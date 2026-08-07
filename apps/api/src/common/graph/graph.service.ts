import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import neo4j, { Driver, Session } from 'neo4j-driver'

export interface GraphNode {
  id: string
  label: string
  properties: Record<string, unknown>
}

export interface GraphRelationship {
  id: string
  type: string
  sourceId: string
  targetId: string
  properties: Record<string, unknown>
}

export interface CaseGraphData {
  caseId: string
  nodes: GraphNode[]
  relationships: GraphRelationship[]
  nodeCount: number
  relationshipCount: number
}

@Injectable()
export class GraphService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GraphService.name)
  private driver!: Driver

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('NEO4J_URI', 'bolt://localhost:7687')
    const authString = this.configService.get<string>(
      'NEO4J_AUTH',
      'neo4j/acpia_neo4j_password_2026'
    )

    const [user, password] = authString.split('/')

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(user || 'neo4j', password || ''))
      await this.driver.verifyConnectivity()
      this.logger.log(`Connected to Neo4j Knowledge Graph at ${uri}`)

      await this.initializeSchema()
    } catch (err) {
      this.logger.warn(`Neo4j standby mode active: ${(err as Error).message}`)
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close()
    }
  }

  getSession(): Session {
    return this.driver.session()
  }

  /**
   * Initializes constraints & indices for all 10 core ACPIA node labels per ONTOLOGY.md
   */
  private async initializeSchema(): Promise<void> {
    const session = this.getSession()
    try {
      const constraints = [
        'CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (n:Person) REQUIRE n.id IS UNIQUE',
        'CREATE CONSTRAINT case_id_unique IF NOT EXISTS FOR (n:Investigation) REQUIRE n.id IS UNIQUE',
        'CREATE CONSTRAINT evidence_id_unique IF NOT EXISTS FOR (n:Evidence) REQUIRE n.id IS UNIQUE',
        'CREATE CONSTRAINT account_id_unique IF NOT EXISTS FOR (n:Account) REQUIRE n.id IS UNIQUE',
        'CREATE CONSTRAINT device_id_unique IF NOT EXISTS FOR (n:Device) REQUIRE n.id IS UNIQUE',
        'CREATE CONSTRAINT location_id_unique IF NOT EXISTS FOR (n:Location) REQUIRE n.id IS UNIQUE',
        'CREATE CONSTRAINT threat_id_unique IF NOT EXISTS FOR (n:Threat) REQUIRE n.id IS UNIQUE',
        'CREATE INDEX case_id_idx IF NOT EXISTS FOR (n:Investigation) ON (n.caseId)',
      ]

      for (const query of constraints) {
        await session.run(query)
      }
      this.logger.log('Neo4j Knowledge Graph constraints and indices initialized successfully')
    } catch (err) {
      this.logger.warn(`Schema initialization deferred: ${(err as Error).message}`)
    } finally {
      await session.close()
    }
  }

  /**
   * Create or merge a node in the Knowledge Graph
   */
  async mergeNode(label: string, id: string, properties: Record<string, unknown>): Promise<void> {
    if (!this.driver) return
    const session = this.getSession()
    try {
      const cypher = `
        MERGE (n:${label} { id: $id })
        SET n += $properties, n.updatedAt = datetime()
      `
      await session.run(cypher, { id, properties })
    } finally {
      await session.close()
    }
  }

  /**
   * Create or merge a relationship between two nodes
   */
  async mergeRelationship(
    sourceId: string,
    targetId: string,
    relationshipType: string,
    properties: Record<string, unknown> = {}
  ): Promise<void> {
    if (!this.driver) return
    const session = this.getSession()
    try {
      const cypher = `
        MATCH (a { id: $sourceId })
        MATCH (b { id: $targetId })
        MERGE (a)-[r:${relationshipType}]->(b)
        SET r += $properties
      `
      await session.run(cypher, { sourceId, targetId, properties })
    } finally {
      await session.close()
    }
  }

  /**
   * Retrieve full graph for a given investigation case
   */
  async getCaseGraph(caseId: string): Promise<CaseGraphData> {
    if (!this.driver) {
      return {
        caseId,
        nodes: [],
        relationships: [],
        nodeCount: 0,
        relationshipCount: 0,
      }
    }

    const session = this.getSession()
    try {
      const result = await session.run(
        `
        MATCH (c:Investigation { id: $caseId })-[*1..3]-(n)
        OPTIONAL MATCH (n)-[r]-(m)
        RETURN n, r, m
        LIMIT 500
        `,
        { caseId }
      )

      const nodesMap = new Map<string, GraphNode>()
      const relationshipsMap = new Map<string, GraphRelationship>()

      result.records.forEach((record) => {
        const node = record.get('n')
        if (node && node.properties && typeof node.properties.id === 'string') {
          nodesMap.set(node.properties.id, {
            id: node.properties.id,
            label: Array.isArray(node.labels) ? node.labels[0] || 'Entity' : 'Entity',
            properties: node.properties,
          })
        }

        const rel = record.get('r')
        if (rel) {
          const key = `${rel.startNodeElementId}-${rel.type}-${rel.endNodeElementId}`
          relationshipsMap.set(key, {
            id: rel.identity ? rel.identity.toString() : key,
            type: rel.type,
            sourceId: rel.startNodeElementId,
            targetId: rel.endNodeElementId,
            properties: rel.properties || {},
          })
        }
      })

      const nodes = Array.from(nodesMap.values())
      const relationships = Array.from(relationshipsMap.values())

      return {
        caseId,
        nodes,
        relationships,
        nodeCount: nodes.length,
        relationshipCount: relationships.length,
      }
    } finally {
      await session.close()
    }
  }

  /**
   * Find shortest path between two entities
   */
  async findShortestPath(sourceId: string, targetId: string): Promise<GraphNode[]> {
    if (!this.driver) return []
    const session = this.getSession()
    try {
      const result = await session.run(
        `
        MATCH p = shortestPath((a { id: $sourceId })-[*..6]-(b { id: $targetId }))
        RETURN nodes(p) AS pathNodes
        `,
        { sourceId, targetId }
      )

      const firstRecord = result.records[0]
      if (!firstRecord) return []

      const pathNodes = firstRecord.get('pathNodes') || []
      return pathNodes.map((n: Record<string, unknown>) => {
        const props = (n?.['properties'] as Record<string, unknown>) || {}
        const labels = (n?.['labels'] as string[]) || []
        return {
          id: typeof props['id'] === 'string' ? props['id'] : '',
          label: labels[0] || 'Entity',
          properties: props,
        }
      })
    } finally {
      await session.close()
    }
  }
}

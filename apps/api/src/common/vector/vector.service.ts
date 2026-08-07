import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { QdrantClient } from '@qdrant/js-client-rest'
import { defaultAiProviderManager } from '@acpia/ai-provider'

export interface VectorSearchResult {
  id: string | number
  score: number
  payload: Record<string, unknown>
}

@Injectable()
export class VectorService implements OnModuleInit {
  private readonly logger = new Logger(VectorService.name)
  private qdrantClient!: QdrantClient

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('QDRANT_URL', 'http://localhost:6333')

    try {
      this.qdrantClient = new QdrantClient({ url })
      this.logger.log(`Initialized Qdrant client for vector search at ${url}`)
      await this.initializeCollections()
    } catch (err) {
      this.logger.warn(`Qdrant standby mode active: ${(err as Error).message}`)
    }
  }

  /**
   * Initializes acpia_evidence and acpia_findings collections per ADR-003
   */
  private async initializeCollections(): Promise<void> {
    try {
      const collections = ['acpia_evidence', 'acpia_findings']
      const existing = await this.qdrantClient.getCollections()
      const existingNames = new Set(existing.collections.map((c) => c.name))

      for (const collectionName of collections) {
        if (!existingNames.has(collectionName)) {
          await this.qdrantClient.createCollection(collectionName, {
            vectors: {
              size: 1536, // Cosine vector size for text-embedding-3
              distance: 'Cosine',
            },
          })
          this.logger.log(`Created Qdrant collection: ${collectionName}`)
        }
      }
    } catch (err) {
      this.logger.warn(`Qdrant collections setup deferred: ${(err as Error).message}`)
    }
  }

  /**
   * Generate embedding via OpenAIProvider & index evidence text into Qdrant acpia_evidence
   */
  async indexEvidenceEmbedding(
    evidenceId: string,
    caseId: string,
    text: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const embedRes = await defaultAiProviderManager.embed({ text })
    await this.upsertVector('acpia_evidence', evidenceId, embedRes.embedding, {
      caseId,
      evidenceId,
      text,
      ...metadata,
    })
    this.logger.log(`Indexed evidence embedding for ${evidenceId} in case ${caseId}`)
  }

  /**
   * Execute end-to-end semantic search by query string per ADR-003
   */
  async semanticSearchByQueryText(
    caseId: string,
    queryText: string,
    collectionName: string = 'acpia_evidence',
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    const embedRes = await defaultAiProviderManager.embed({ text: queryText })
    return this.searchVectors(collectionName, embedRes.embedding, caseId, limit)
  }

  /**
   * Upsert vector point into a collection
   */
  async upsertVector(
    collectionName: string,
    pointId: string | number,
    vector: number[],
    payload: Record<string, unknown>
  ): Promise<void> {
    if (!this.qdrantClient) return
    try {
      await this.qdrantClient.upsert(collectionName, {
        points: [
          {
            id: pointId,
            vector,
            payload,
          },
        ],
      })
    } catch (err) {
      this.logger.error(`Failed to upsert vector to ${collectionName}: ${(err as Error).message}`)
    }
  }

  /**
   * Perform semantic vector search with case filtering per ADR-003
   */
  async searchVectors(
    collectionName: string,
    vector: number[],
    caseId?: string,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    if (!this.qdrantClient) return []
    try {
      const queryParams: Record<string, unknown> = {
        query: vector,
        limit,
      }

      if (caseId) {
        queryParams.filter = {
          must: [
            {
              key: 'caseId',
              match: {
                value: caseId,
              },
            },
          ],
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.qdrantClient.query(collectionName, queryParams as any)

      const points = response.points || []
      return points.map(
        (res: {
          id: string | number
          score: number
          payload?: Record<string, unknown> | null
        }) => ({
          id: res.id,
          score: res.score,
          payload: (res.payload as Record<string, unknown>) || {},
        })
      )
    } catch (err) {
      this.logger.error(`Vector search failed in ${collectionName}: ${(err as Error).message}`)
      return []
    }
  }

  /**
   * Delete vector point from collection
   */
  async deleteVector(collectionName: string, pointId: string | number): Promise<void> {
    if (!this.qdrantClient) return
    try {
      await this.qdrantClient.delete(collectionName, {
        points: [pointId],
      })
    } catch (err) {
      this.logger.error(`Failed to delete vector from ${collectionName}: ${(err as Error).message}`)
    }
  }
}

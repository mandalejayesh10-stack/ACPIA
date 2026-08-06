# ADR-002 — Neo4j as the Knowledge Graph Database

| Field | Value |
|---|---|
| **ID** | ADR-002 |
| **Title** | Neo4j as the Knowledge Graph Database |
| **Status** | ✅ Accepted |
| **Date** | Sprint -1 |
| **Authority** | Chief Software Architect |
| **Deciders** | Chief Software Architect, Product Owner |

---

## Context

ACPIA needs to represent and query complex relationships between investigation entities: persons, devices, accounts, locations, threats, timeline events, and more. Criminal investigations are fundamentally about **connections** — who knew whom, which device was at which location, which account communicated with which victim. A relational database can model these relationships but queries become exponentially slower as the graph grows deeper.

---

## Decision Drivers

- Queries like "find all accounts connected to this suspect within 3 hops" must be fast (< 500ms)
- The ontology (see `ONTOLOGY.md`) has 15 node types and 20+ relationship types
- The Knowledge Graph UI must render live and be interactive
- Path-finding between suspects and victims is a core feature
- Graph data must survive a platform restart (durable, not in-memory)

---

## Considered Alternatives

### Option A: PostgreSQL with adjacency table
Store relationships in a `graph_edges (from_id, to_id, type)` table.

**Pros**: Already in the stack, simple  
**Cons**: Recursive CTEs for path-finding are slow at scale. Multi-hop queries (3–5 hops) become O(n²) or worse. Joins across 15 entity types are complex. Not designed for graph traversal.

---

### Option B: Amazon Neptune / Azure Cosmos DB (graph mode)
Managed graph database services.

**Pros**: Managed, scalable  
**Cons**: Cloud-only — violates Principle 6 (offline deployment). Too expensive for a hackathon. Vendor lock-in.

---

### Option C: ArangoDB
Multi-model (graph + document) database.

**Pros**: Flexible, AQL is expressive  
**Cons**: Less mature ecosystem than Neo4j, smaller community, less well-known to judges. Driver support for Node.js is less mature.

---

### Option D: Neo4j ✅ CHOSEN
The industry-standard native graph database. Used by Palantir, law enforcement agencies worldwide, and financial crime investigation platforms.

**Pros**:
- Cypher query language is designed for relationship queries
- Native graph storage — multi-hop queries are O(log n) not O(n²)
- Excellent Node.js driver (`neo4j-driver`)
- Self-hosted with Docker (offline-capable)
- Industry-recognized for exactly this use case
- Powerful visual exploration in Neo4j Browser (useful for debugging)
- Judges will recognize it as the right tool for this problem

**Cons**:
- Requires learning Cypher query language
- Separate service to manage (Docker container)
- Not suitable as a replacement for relational data (PostgreSQL still needed)

---

## Decision

**Neo4j** as the exclusive knowledge graph database. PostgreSQL remains the relational store. They serve different purposes and are not substitutes.

---

## Consequences

### Positive
- ✅ Multi-hop relationship queries in milliseconds
- ✅ Cypher is expressive and readable for investigation queries
- ✅ Graph visualization directly from Neo4j data
- ✅ Recognized by technical judges as appropriate technology
- ✅ Runs self-hosted in Docker (offline deployment)

### Negative
- ⚠️ Engineers must learn Cypher (small learning curve)
- ⚠️ Dual-database architecture requires synchronization discipline
- ⚠️ All Neo4j access must go through Graph MCP Server (enforced)

---

## Cypher Query Examples (Investigation-Relevant)

```cypher
// Find all accounts connected to a suspect within 3 hops
MATCH path = (suspect:Person {id: $suspectId})-[*1..3]-(entity)
RETURN path

// Shortest path between suspect and victim
MATCH path = shortestPath(
  (suspect:Person {id: $suspectId})-[*]-(victim:Person {id: $victimId})
)
RETURN path

// Find all threats connected to this case
MATCH (i:Investigation {id: $caseId})-[:CONTAINS]->(e:Evidence)-[:DEPICTS]->(t:Threat)
RETURN t
```

---

## Links

- [ONTOLOGY.md](../ONTOLOGY.md) — All node types and relationship types
- [MCP.md](../MCP.md) — Graph MCP Server (all Neo4j access goes here)
- [INVESTIGATION_STATE.md](../INVESTIGATION_STATE.md) — Graph state management

---

*Accepted: Sprint -1 | Cannot be reversed without Chief Software Architect approval + new ADR*

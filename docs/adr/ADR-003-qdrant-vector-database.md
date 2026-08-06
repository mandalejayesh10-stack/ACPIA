# ADR-003 — Qdrant as the Vector Database

| Field | Value |
|---|---|
| **ID** | ADR-003 |
| **Title** | Qdrant as the Vector Database for Semantic Search |
| **Status** | ✅ Accepted |
| **Date** | Sprint -1 |
| **Authority** | Chief Software Architect |
| **Deciders** | Chief Software Architect, Product Owner |

---

## Context

ACPIA's Intelligent Retrieval Agent (Agent 9) and the Copilot (Agent 15) need to answer investigator questions like:

- *"Find all evidence related to financial transactions"*
- *"Which messages mention school locations?"*
- *"Show me all content similar to this image"*

These queries cannot be answered by keyword search (too rigid) or SQL (no semantic understanding). They require **semantic vector search** — finding content by meaning, not exact keywords.

Additionally, the Verification Agent (Agent 14) needs to check if a finding is supported by semantically similar evidence, not just keyword matches.

---

## Decision Drivers

- Must support high-dimensional vector embeddings (text-embedding-3-large = 3072 dimensions)
- Sub-100ms search across thousands of evidence embeddings
- Must support filtering (e.g., search only within a specific case)
- Must be self-hostable (offline deployment requirement)
- Must support multiple distance metrics (cosine similarity for text, L2 for images)
- REST API and Python/Node.js client required

---

## Considered Alternatives

### Option A: PostgreSQL with pgvector
Use the pgvector extension to store vectors in PostgreSQL.

**Pros**: No additional service, vectors co-located with relational data  
**Cons**: Performance degrades significantly at scale (> 100k vectors). No native filtering before ANN search. Not designed for production vector workloads. Would require careful index tuning.

---

### Option B: Pinecone
Managed cloud vector database.

**Pros**: No infrastructure to manage, excellent performance  
**Cons**: Cloud-only — violates Principle 6 (offline deployment). Paid service, costs at scale. Data leaves the platform (security concern for sensitive evidence).

---

### Option C: Weaviate
Open-source vector database with built-in ML models.

**Pros**: Self-hostable, good features  
**Cons**: Heavier resource requirements. Built-in ML models are not needed (we use OpenAI embeddings). More complex configuration.

---

### Option D: Chroma
Open-source, lightweight vector database.

**Pros**: Very easy to set up, Python-native  
**Cons**: Not production-ready for large datasets. Limited filtering capabilities. No Node.js SDK (TypeScript stack requires REST calls only). Not battle-tested at scale.

---

### Option E: Qdrant ✅ CHOSEN
Open-source, production-grade vector database written in Rust. Purpose-built for semantic search.

**Pros**:
- Self-hostable with Docker (offline-capable)
- Excellent performance (Rust-native, HNSW indexing)
- Strong filtering: search within a `caseId` payload filter
- Both TypeScript and Python SDKs (fits our stack)
- Named vector support (store multiple embedding types per point)
- Payload indexing for fast metadata filtering
- Active development, growing community

**Cons**:
- Separate service to manage
- Less mature than Pinecone for managed deployments (not relevant for our use case)

---

## Decision

**Qdrant** as the exclusive vector database. Every evidence item, once analyzed, gets its content embedded and stored as a Qdrant point with a `caseId` payload for filtering.

---

## Collection Design

```typescript
// Primary evidence collection
collection: 'acpia_evidence'
vectors: {
  text:  { size: 3072, distance: 'Cosine' },  // text-embedding-3-large
  image: { size: 1536, distance: 'Cosine' },  // image embeddings (future)
}
payload: {
  evidenceId: string,
  caseId: string,
  type: EvidenceType,
  agentSummary: string,
  uploadedAt: string,
}

// Agent findings collection (for Verification Agent)
collection: 'acpia_findings'
vectors: {
  text: { size: 3072, distance: 'Cosine' }
}
payload: {
  findingId: string,
  caseId: string,
  agentId: string,
  category: string,
}
```

---

## Search Flow

```
Investigator Query (natural language)
        │
        ▼
text-embedding-3-large (OpenAI)
        │
        ▼
Qdrant search with filter: { caseId: 'CASE-2024-001' }
        │
        ▼
Top-K relevant evidence points
        │
        ▼
GPT-4o (reason with retrieved context)
        │
        ▼
Answer with evidence citations
```

---

## Consequences

### Positive
- ✅ Semantic search across all case evidence in < 100ms
- ✅ Self-hosted, offline capable
- ✅ Case-isolated search (payload filtering)
- ✅ Python and TypeScript SDKs

### Negative
- ⚠️ All evidence must be embedded before it can be searched (async, post-upload)
- ⚠️ Embedding cost per evidence item (see COST.md)
- ⚠️ Qdrant points must be deleted when evidence is deleted (sync required)

---

## Links

- [AI_PROVIDER.md](../AI_PROVIDER.md) — `embed()` method
- [MCP.md](../MCP.md) — Search MCP Server
- [COST.md](../COST.md) — Embedding cost estimates

---

*Accepted: Sprint -1 | Cannot be reversed without Chief Software Architect approval + new ADR*

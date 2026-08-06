# ACPIA — Investigation State

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Principle**: Every agent reads from and writes to Investigation State. Agents do not pass results to each other directly.

---

## Overview

The **Shared Investigation State** is the living memory of an active investigation. It is the single, authoritative record of everything known about a case at any point in time. It is distributed across five stores, each optimized for a different type of access.

```
Investigation State
   │
   ├── PostgreSQL   → Structured facts, evidence records, agent outputs, reports
   ├── Neo4j        → Knowledge graph (entities, relationships, paths)
   ├── Qdrant       → Semantic search index (vector embeddings)
   ├── Redis        → Live state, memory, session data (ephemeral)
   └── MinIO        → Evidence file storage (immutable)
```

No store is the "main" store. Together they form one unified investigation state.

---

## 1. Evidence State

Tracks every file uploaded to the investigation.

```typescript
interface EvidenceState {
  id: string                    // EV-YYYY-NNNN
  caseId: string
  filename: string
  mimeType: string
  sizeBytes: number
  hash: string                  // SHA-256, computed at upload
  minioKey: string
  status: EvidenceStatus
  chainOfCustody: CoCRecord[]
  metadata: ExtractedMetadata   // from Agent 6
  analysisResults: {
    contentAnalysis?: ContentAnalysisOutput     // Agent 2
    threatAnalysis?: ThreatOutput               // Agent 3
    contextExtraction?: ContextOutput           // Agent 4
    metadataMapping?: MetadataOutput            // Agent 6
    syntheticDetection?: SyntheticOutput        // Agent 7
  }
  embeddingId?: string          // Qdrant point ID
  graphNodeId?: string          // Neo4j node ID
}

type EvidenceStatus = 
  | 'UPLOADED'      // just uploaded, not yet validated
  | 'VALIDATED'     // hash stored, virus scan clean
  | 'ANALYZING'     // pipeline running
  | 'ANALYZED'      // all relevant agents completed
  | 'FLAGGED'       // requires human attention
  | 'TAMPERED'      // hash mismatch detected
```

**Stored in**: PostgreSQL `evidence` table + Neo4j `Evidence` node  
**Written by**: Evidence Intake Agent  
**Read by**: All agents

---

## 2. Timeline State

The chronological record of all events in the investigation.

```typescript
interface TimelineState {
  caseId: string
  events: TimelineEvent[]
  gaps: TimelineGap[]           // suspicious time gaps identified
  narrative?: string            // Agent 8's narrative summary
  lastReconstructedAt?: Date
  confidence: number
}

interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string
  timestamp: Date
  timestampConfidence: 'EXACT' | 'APPROXIMATE' | 'ESTIMATED'
  participantIds: string[]      // Person/Account node IDs
  locationId?: string
  evidenceRefs: string[]
  significance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  agentId: string               // which agent created this event
}

interface TimelineGap {
  from: Date
  to: Date
  durationHours: number
  significance: 'LOW' | 'MEDIUM' | 'HIGH'
  note: string
}
```

**Stored in**: PostgreSQL `timeline_events` table + Neo4j `TimelineEvent` nodes  
**Written by**: Agent 8 (Timeline Reconstruction)  
**Read by**: Agent 10 (Reporting), Agent 12 (Fusion), Agent 13 (Hypothesis)

---

## 3. Graph State

The knowledge graph representing all entities and their relationships.

```typescript
interface GraphState {
  caseId: string
  nodeCount: number
  relationshipCount: number
  lastUpdatedAt: Date
  
  // Counts by type
  nodeSummary: Record<OntologyLabel, number>
  
  // Network analysis
  centralEntities: string[]     // most connected node IDs
  clusters: EntityCluster[]     // detected community clusters
  isolatedNodes: string[]       // nodes with no relationships (suspicious)
}

interface EntityCluster {
  id: string
  label: string
  memberIds: string[]
  cohesionScore: number
  dominantEntityType: OntologyLabel
}
```

**Stored in**: Neo4j (live) + PostgreSQL `graph_snapshots` (snapshots for reports)  
**Written by**: All agents via Graph MCP Server  
**Read by**: All agents + Frontend (Knowledge Graph UI)

---

## 4. Risk State

The current risk assessment for the investigation.

```typescript
interface RiskState {
  caseId: string
  overallScore: number          // 0.0 – 10.0
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  
  // Breakdown
  victimSafetyScore: number
  evidenceStrengthScore: number
  suspectRiskScore: number
  escalationProbability: number
  
  // Factors
  factors: RiskFactor[]
  escalationIndicators: string[]
  
  // Explanation (from Agent 11)
  explanation: string
  reasoning: string[]
  
  // History
  history: RiskHistoryPoint[]   // score over time
  
  calculatedAt: Date
  calculatedBy: string          // Agent ID
  requiresHumanReview: boolean
  reviewedBy?: string
  reviewedAt?: Date
}
```

**Stored in**: PostgreSQL `risk_assessments` table  
**Written by**: Agent 11 (Risk Assessment), updated by Agent 12 (Fusion)  
**Read by**: Agent 10 (Reporting), Agent 15 (Copilot) + Frontend (Dashboard)

---

## 5. Memory State (Redis)

Ephemeral working memory used by agents during active investigation.

```typescript
// Key patterns:
// acpia:case:{caseId}:entities         → string[] (all entity IDs found)
// acpia:case:{caseId}:threats          → Threat[] (running threat list)
// acpia:case:{caseId}:summary          → string (current investigation summary)
// acpia:case:{caseId}:agent:{id}       → AgentMemory (last findings per agent)
// acpia:entity:{entityId}:facts        → EntityFacts
// acpia:session:{sessionId}:history    → ConversationTurn[] (Copilot history)

interface AgentMemory {
  agentId: string
  lastRunAt: Date
  summary: string
  keyFindings: string[]
  entityIds: string[]
  evidenceIds: string[]
}

interface EntityFacts {
  entityId: string
  entityType: OntologyLabel
  knownFacts: Record<string, unknown>
  lastUpdatedAt: Date
  updatedBy: string             // agent ID
}
```

**Stored in**: Redis  
**TTL**: Case-level memory: no TTL (while case is ACTIVE). Cleared on case close.  
**Written by**: Any agent via Memory MCP Server  
**Read by**: All agents, especially Agent 15 (Copilot)

---

## 6. Intelligence State

Fused intelligence from all agent outputs. The authoritative intelligence picture.

```typescript
interface IntelligenceState {
  caseId: string
  
  // Entity intelligence
  persons: PersonIntelligence[]
  organizations: OrganizationIntelligence[]
  devices: DeviceIntelligence[]
  
  // Findings
  confirmedFindings: Finding[]    // Verified by Agent 14
  pendingFindings: Finding[]      // Not yet verified
  rejectedFindings: Finding[]     // Failed verification
  
  // Threats
  activeThreats: Threat[]
  resolvedThreats: Threat[]
  
  // Hypotheses
  activeHypotheses: Hypothesis[]
  
  // Contradictions
  contradictions: Contradiction[]  // Conflicting findings from different agents
  
  // Fusion metadata
  lastFusedAt?: Date
  fusedBy?: string              // Agent 12 execution ID
  confidence: number            // Overall intelligence confidence
}

interface PersonIntelligence {
  personId: string
  subtype: 'VICTIM' | 'SUSPECT' | 'WITNESS' | 'UNKNOWN'
  confidence: number
  evidenceRefs: string[]
  knownAliases: string[]
  knownAccounts: string[]
  knownDevices: string[]
  knownLocations: string[]
  threatAssociation?: string[]
  riskScore?: number
}
```

**Stored in**: PostgreSQL `intelligence_state` (JSONB) + Neo4j  
**Written by**: Agent 12 (Intelligence Fusion)  
**Read by**: Agent 13, 14, 15, 16 + Report Generation

---

## 7. Report State

All generated reports for the investigation.

```typescript
interface ReportState {
  caseId: string
  reports: Report[]
  latestDraft?: Report
  finalizedReport?: Report
}

interface Report {
  id: string
  version: number
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'FINALIZED' | 'SUPERSEDED'
  type: 'FULL' | 'SUMMARY' | 'LEGAL' | 'PROGRESS'
  
  sections: ReportSection[]
  
  generatedAt: Date
  generatedBy: string           // Agent 10 execution ID
  approvedBy?: string
  approvedAt?: Date
  
  pdfKey?: string               // MinIO key of PDF
  pdfHash?: string              // SHA-256 of PDF
  jsonHash?: string             // SHA-256 of JSON
}
```

**Stored in**: PostgreSQL `reports` table + MinIO (PDF files)  
**Written by**: Agent 10 (Automated Reporting)  
**Read by**: Frontend, Agent 15 (Copilot), Agent 16 (Explainability)

---

## State Access Rules

| State Store | Written By | Read By | Access Method |
|---|---|---|---|
| Evidence (PostgreSQL) | Agent 1 | All agents | Evidence MCP Server |
| Timeline (PostgreSQL + Neo4j) | Agent 8 | Agents 10, 12, 13 | Timeline MCP Server |
| Knowledge Graph (Neo4j) | All agents | All agents | Graph MCP Server |
| Risk (PostgreSQL) | Agent 11 | Agents 10, 12, 15 | Risk MCP Server |
| Memory (Redis) | All agents | All agents | Memory MCP Server |
| Intelligence (PostgreSQL) | Agent 12 | Agents 13, 14, 15, 16 | Direct DB service |
| Reports (PostgreSQL + MinIO) | Agent 10 | Frontend, Agent 15 | Report MCP Server |

**Rule**: No agent accesses any state store directly. All access is via MCP servers.

---

## State Consistency

### Why we're not worried about distributed consistency
Each store has a defined owner (the agent that writes to it). Other agents are consumers. Since agents run sequentially in the pipeline (with some parallel branches), write conflicts are rare.

For the rare cases where two agents write to the same store (e.g., multiple agents add Neo4j nodes), each write is idempotent: agents use `MERGE` in Cypher (create if not exists, update if exists).

### Checkpoint Recovery
If an agent fails mid-pipeline, the investigation state contains all outputs from agents that completed successfully. Restart from the failed agent — no data is lost.

```sql
-- Find last successful agent execution for a case
SELECT agent_id, state, completed_at 
FROM agent_executions 
WHERE case_id = 'CASE-2024-001' 
  AND state = 'COMPLETED'
ORDER BY completed_at DESC;
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

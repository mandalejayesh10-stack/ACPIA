# ACPIA — MCP Architecture

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Scope**: All Model Context Protocol servers and their tool definitions  
> **Framework**: Hermes MCP + OpenAI Tool Calling

---

## Overview

ACPIA uses the **Model Context Protocol (MCP)** to expose structured tools to AI agents. Instead of hardcoding API calls inside each agent, every capability is exposed as a named MCP tool. This creates a clean, auditable, and extensible interface between agents and the platform.

```
AI Agent
   │
   ▼
MCP Client (in Agent SDK)
   │
   ├── Evidence MCP Server   → MinIO + PostgreSQL
   ├── Vision MCP Server     → AI Provider (Vision)
   ├── Metadata MCP Server   → ExifTool + Apache Tika
   ├── Graph MCP Server      → Neo4j
   ├── Timeline MCP Server   → PostgreSQL + Neo4j
   ├── Search MCP Server     → Qdrant + Neo4j
   ├── Risk MCP Server       → PostgreSQL + Risk Engine
   ├── Report MCP Server     → PDF Generator
   ├── Audit MCP Server      → PostgreSQL (append-only)
   └── Memory MCP Server     → Redis
```

---

## MCP Server Specifications

---

### 1. Evidence MCP Server

**Purpose**: Access, store, and retrieve evidence files and metadata.  
**Backend**: MinIO + PostgreSQL  
**Access Level**: Read + Write (write requires WRITE_ALLOWED flag)

#### Tools

```typescript
// Retrieve evidence metadata
get_evidence(evidenceId: string): EvidenceNode

// List all evidence for a case
list_evidence(caseId: string, filters?: EvidenceFilter): EvidenceNode[]

// Download evidence file content (returns base64 or stream URL)
download_evidence(evidenceId: string): { url: string; hash: string; expiresAt: Date }

// Verify evidence integrity
verify_evidence_hash(evidenceId: string): { valid: boolean; storedHash: string; actualHash: string }

// Update evidence status (WRITE_ALLOWED required)
update_evidence_status(evidenceId: string, status: EvidenceStatus): void

// Get chain of custody records
get_chain_of_custody(evidenceId: string): CoCRecord[]

// Record a chain of custody event (WRITE_ALLOWED required)
record_coc_event(evidenceId: string, event: CoCEventInput): CoCRecord
```

---

### 2. Vision MCP Server

**Purpose**: AI-powered visual analysis of images and video frames.  
**Backend**: AI Provider Layer (GPT-4o Vision / Qwen2.5-VL)  
**Access Level**: Read (AI calls are write-audited)

#### Tools

```typescript
// Analyze a single image
analyze_image(evidenceId: string, prompt: string, options?: VisionOptions): VisionResult

// Analyze multiple video frames
analyze_video_frames(evidenceId: string, frameCount?: number, prompt?: string): VideoAnalysisResult

// Detect and cluster faces in image
detect_faces(evidenceId: string): FaceDetectionResult[]

// Extract text from image (OCR)
extract_text_from_image(evidenceId: string, language?: string): OcrResult

// Detect objects and landmarks
detect_objects(evidenceId: string, categories?: ObjectCategory[]): ObjectDetectionResult[]

// Analyze for CSAM indicators (restricted tool — SUPERVISOR role required)
analyze_csam_indicators(evidenceId: string): CsamAnalysisResult

// Check for synthetic/deepfake indicators
check_synthetic(evidenceId: string): SyntheticDetectionResult
```

---

### 3. Metadata MCP Server

**Purpose**: Extract and structure metadata from all file types.  
**Backend**: ExifTool + Apache Tika + FFprobe + custom parsers  
**Access Level**: Read-only

#### Tools

```typescript
// Extract EXIF metadata
extract_exif(evidenceId: string): ExifData

// Extract GPS coordinates from EXIF
extract_gps(evidenceId: string): GpsData | null

// Extract device information
extract_device_info(evidenceId: string): DeviceInfo

// Extract document metadata (author, created, modified)
extract_document_meta(evidenceId: string): DocumentMeta

// Extract video/audio technical metadata
extract_av_meta(evidenceId: string): AvMeta

// Extract all metadata (runs all applicable extractors)
extract_all_metadata(evidenceId: string): AllMetadata

// Parse chat export files (WhatsApp, Telegram, etc.)
parse_chat_export(evidenceId: string, format: ChatFormat): ParsedChat
```

---

### 4. Graph MCP Server

**Purpose**: Read and write to the Neo4j Knowledge Graph.  
**Backend**: Neo4j  
**Access Level**: Read + Write (write requires WRITE_ALLOWED flag)

#### Tools

```typescript
// Find a node by ID
get_node(nodeId: string, label?: OntologyLabel): GraphNode

// Find nodes matching criteria
find_nodes(label: OntologyLabel, properties?: Record<string, unknown>): GraphNode[]

// Get all relationships from a node
get_relationships(nodeId: string, direction?: 'IN' | 'OUT' | 'BOTH'): GraphRelationship[]

// Find shortest path between two nodes
find_path(fromId: string, toId: string, maxHops?: number): GraphPath | null

// Find all nodes connected to a person
get_person_network(personId: string, depth?: number): PersonNetwork

// Create or update a node (WRITE_ALLOWED required)
upsert_node(label: OntologyLabel, properties: Record<string, unknown>): GraphNode

// Create a relationship (WRITE_ALLOWED required)
create_relationship(fromId: string, type: RelationshipType, toId: string, properties?: Record<string, unknown>): GraphRelationship

// Run a custom Cypher query (read-only, pre-approved queries only)
run_cypher_query(queryId: string, params: Record<string, unknown>): GraphQueryResult
```

---

### 5. Timeline MCP Server

**Purpose**: Build, query, and reconstruct the investigation timeline.  
**Backend**: PostgreSQL + Neo4j  
**Access Level**: Read + Write (write requires WRITE_ALLOWED flag)

#### Tools

```typescript
// Get all timeline events for a case
get_timeline(caseId: string, options?: TimelineOptions): TimelineEvent[]

// Get events in a time range
get_events_in_range(caseId: string, from: Date, to: Date): TimelineEvent[]

// Get events involving a specific person
get_person_timeline(personId: string, caseId: string): TimelineEvent[]

// Create a timeline event (WRITE_ALLOWED required)
create_timeline_event(event: TimelineEventInput): TimelineEvent

// Link events as sequential (WRITE_ALLOWED required)
link_events(fromEventId: string, toEventId: string): void

// Reconstruct timeline from evidence (triggers Timeline Agent)
reconstruct_timeline(caseId: string, evidenceIds: string[]): TimelineReconstructionJob
```

---

### 6. Search MCP Server

**Purpose**: Semantic and structured search across all investigation data.  
**Backend**: Qdrant + Neo4j + PostgreSQL  
**Access Level**: Read-only

#### Tools

```typescript
// Semantic search across all evidence
semantic_search(query: string, caseId: string, limit?: number): SemanticSearchResult[]

// Search within a specific evidence type
search_evidence(query: string, caseId: string, type?: EvidenceType): EvidenceSearchResult[]

// Find similar entities
find_similar_entities(nodeId: string, topK?: number): SimilarEntity[]

// Full-text search across case data
full_text_search(query: string, caseId: string, scope?: SearchScope): SearchResult[]

// Search by metadata attributes
search_by_metadata(filters: MetadataFilter, caseId: string): EvidenceNode[]

// Find connections between two entities
find_connections(entityAId: string, entityBId: string, caseId: string): Connection[]
```

---

### 7. Risk MCP Server

**Purpose**: Calculate, retrieve, and update risk assessments.  
**Backend**: PostgreSQL + Risk Engine  
**Access Level**: Read + Write (write requires WRITE_ALLOWED flag)

#### Tools

```typescript
// Get current risk score for a case
get_case_risk(caseId: string): RiskAssessment

// Get risk score for a specific person
get_person_risk(personId: string, caseId: string): RiskAssessment

// Calculate risk using the Python risk engine
calculate_risk(input: RiskCalculationInput): RiskCalculationResult

// Get all risk factors for a case
list_risk_factors(caseId: string): RiskFactor[]

// Update risk score (WRITE_ALLOWED required)
update_risk(caseId: string, assessment: RiskAssessmentInput): RiskAssessment

// Get risk history for trend analysis
get_risk_history(caseId: string): RiskHistoryPoint[]
```

---

### 8. Report MCP Server

**Purpose**: Generate, retrieve, and manage investigation reports.  
**Backend**: PDF Generator + PostgreSQL + MinIO  
**Access Level**: Read + Write (final report requires human approval gate)

#### Tools

```typescript
// Get an existing report
get_report(reportId: string): Report

// List all reports for a case
list_reports(caseId: string): Report[]

// Generate a report draft (does not publish)
generate_report_draft(caseId: string, options: ReportOptions): ReportDraft

// Export report as PDF
export_report_pdf(reportId: string): { url: string; hash: string }

// Get report sections
get_report_sections(reportId: string): ReportSection[]

// Create a custom report section (WRITE_ALLOWED required)
create_report_section(reportId: string, section: ReportSectionInput): ReportSection
```

---

### 9. Audit MCP Server

**Purpose**: Record audit events (append-only).  
**Backend**: PostgreSQL `audit_log` table  
**Access Level**: Write-only (agents write, cannot read their own logs)

#### Tools

```typescript
// Record an agent action in the audit log
log_agent_action(action: AgentAuditInput): AuditRecord

// Record a data access event
log_data_access(access: DataAccessInput): AuditRecord

// Record a human approval gate event
log_gate_event(gate: GateEventInput): AuditRecord
```

---

### 10. Memory MCP Server

**Purpose**: Shared investigation memory — ephemeral and persistent.  
**Backend**: Redis  
**Access Level**: Read + Write

#### Tools

```typescript
// Get a memory value (case-scoped)
get_memory(caseId: string, key: string): MemoryValue | null

// Set a memory value with optional TTL
set_memory(caseId: string, key: string, value: unknown, ttlSeconds?: number): void

// Get all memory keys for a case
list_memory_keys(caseId: string, pattern?: string): string[]

// Get entity memory (facts known about an entity)
get_entity_memory(entityId: string, caseId: string): EntityMemory

// Update entity memory
update_entity_memory(entityId: string, caseId: string, facts: Partial<EntityMemory>): EntityMemory

// Get conversation memory (for Copilot agent)
get_conversation_memory(sessionId: string): ConversationTurn[]

// Append to conversation memory
append_conversation_memory(sessionId: string, turn: ConversationTurn): void

// Clear conversation memory
clear_conversation_memory(sessionId: string): void
```

---

## MCP Security Controls

| Control | Rule |
|---|---|
| Authentication | All MCP servers require internal service token |
| Authorization | `WRITE_ALLOWED` flag required for all write tools |
| Audit | Every tool call logged to Audit MCP Server |
| Input validation | JSON Schema validated before tool execution |
| Output limits | Max response size: 1MB per tool call |
| Rate limiting | 100 tool calls / minute per agent instance |
| Case isolation | All tools scoped to `caseId` — cross-case access impossible |

---

## MCP Tool Naming Convention

```
{verb}_{noun}[_{qualifier}]

Examples:
get_evidence
list_evidence
verify_evidence_hash
analyze_image
detect_faces
extract_exif
create_timeline_event
calculate_risk
log_agent_action
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

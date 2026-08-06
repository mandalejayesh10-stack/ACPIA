# ACPIA — API Specification

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Format**: OpenAPI 3.1 compatible  
> **Base URL**: `/api/v1`  
> **Authentication**: Bearer JWT (all endpoints unless marked `[PUBLIC]`)

---

## Response Envelope

Every API response uses this envelope. No exceptions.

```typescript
// Success
{
  "success": true,
  "data": T,
  "meta": {
    "timestamp": "ISO8601",
    "traceId": "uuid",
    "version": "1.0"
  }
}

// Paginated success
{
  "success": true,
  "data": T[],
  "meta": {
    "timestamp": "ISO8601",
    "traceId": "uuid",
    "version": "1.0",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "EVIDENCE_NOT_FOUND",
    "message": "Evidence with ID EV-2024-001 was not found.",
    "field": null,
    "stack": "..." // dev environment only
  },
  "meta": {
    "timestamp": "ISO8601",
    "traceId": "uuid",
    "version": "1.0"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Valid token, insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `CASE_NOT_FOUND` | 404 | Case does not exist |
| `EVIDENCE_NOT_FOUND` | 404 | Evidence does not exist |
| `EVIDENCE_TAMPERED` | 409 | Evidence hash mismatch |
| `CASE_CLOSED` | 409 | Operation not permitted on closed case |
| `GATE_REQUIRED` | 403 | Human approval required before proceeding |
| `AGENT_UNAVAILABLE` | 503 | Agent health check failed |
| `UPLOAD_TOO_LARGE` | 413 | File exceeds size limit |
| `INVALID_FILE_TYPE` | 422 | Unsupported MIME type |

---

## Authentication Endpoints

### `POST /auth/login` [PUBLIC]
```
Body:   { email: string, password: string, mfaCode?: string }
Return: { accessToken: string, refreshToken: string, user: UserProfile, expiresIn: number }
```

### `POST /auth/refresh` [PUBLIC]
```
Body:   { refreshToken: string }
Return: { accessToken: string, refreshToken: string, expiresIn: number }
```

### `POST /auth/logout`
```
Body:   { refreshToken: string }
Return: { success: true }
```

### `GET /auth/me`
```
Return: { user: UserProfile, permissions: Permission[], sessions: Session[] }
```

### `POST /auth/mfa/setup`
```
Return: { qrCode: string, secret: string, backupCodes: string[] }
```

### `POST /auth/mfa/verify`
```
Body:   { code: string }
Return: { verified: boolean }
```

---

## User Management Endpoints [ADMIN]

### `GET /users`
```
Query:  page, pageSize, role?, search?
Return: UserProfile[]  (paginated)
```

### `POST /users`
```
Body:   { name, email, role, department }
Return: UserProfile
```

### `GET /users/:id`
```
Return: UserProfile
```

### `PATCH /users/:id`
```
Body:   Partial<{ name, email, role, status }>
Return: UserProfile
```

### `DELETE /users/:id`
```
Return: { success: true }
```

---

## Case Endpoints

### `GET /cases`
```
Query:  page, pageSize, status?, priority?, search?, assignedTo?
Return: CaseSummary[]  (paginated, scoped to user's assigned cases)
```

### `POST /cases` [SUPERVISOR, ADMIN]
```
Body:   { title, description, priority, leadInvestigatorId }
Return: Case
```

### `GET /cases/:id`
```
Return: CaseDetail  (full case with evidence list, agent status, risk score)
```

### `PATCH /cases/:id` [SUPERVISOR, ADMIN]
```
Body:   Partial<{ title, description, priority, status, teamIds }>
Return: Case
```

### `POST /cases/:id/close` [SUPERVISOR, ADMIN]
```
Body:   { reason: string, summary: string }
Return: Case
```

### `GET /cases/:id/timeline`
```
Query:  from?, to?, types?, personId?
Return: TimelineEvent[]
```

### `GET /cases/:id/graph`
```
Query:  depth?, nodeTypes?, focusId?
Return: { nodes: GraphNode[], edges: GraphEdge[] }
```

### `GET /cases/:id/risk`
```
Return: RiskAssessment
```

### `GET /cases/:id/audit`
```
Query:  page, pageSize, actorType?, action?
Return: AuditRecord[]  (paginated)
```

---

## Evidence Endpoints

### `GET /cases/:caseId/evidence`
```
Query:  page, pageSize, type?, status?, search?
Return: Evidence[]  (paginated)
```

### `POST /cases/:caseId/evidence/upload`
```
Content-Type: multipart/form-data
Body:   { file: File, source: string, collectedAt?: ISO8601, description?: string }
Return: Evidence
Notes:  Max file size: 500MB. Supported types: JPEG, PNG, MP4, MOV, MP3, WAV, PDF, TXT, ZIP (chat exports)
```

### `GET /cases/:caseId/evidence/:evidenceId`
```
Return: EvidenceDetail  (with metadata, CoC records, agent analysis summary)
```

### `GET /cases/:caseId/evidence/:evidenceId/download`
```
Return: 302 redirect to signed MinIO URL (expires in 15 minutes)
Notes:  Download event logged to audit log and CoC record created
```

### `GET /cases/:caseId/evidence/:evidenceId/preview`
```
Query:  width?, height?, page? (for PDFs), frameAt? (for videos, seconds)
Return: 302 redirect to signed MinIO thumbnail URL
```

### `DELETE /cases/:caseId/evidence/:evidenceId` [SUPERVISOR, ADMIN]
```
Body:   { reason: string }
Return: { success: true }
Notes:  Soft delete only. File remains in MinIO, CoC record created.
```

### `GET /cases/:caseId/evidence/:evidenceId/chain-of-custody`
```
Return: CoCRecord[]
```

---

## Investigation Pipeline Endpoints

### `POST /cases/:caseId/pipeline/start`
```
Body:   { evidenceIds: string[], agentIds?: string[], options?: PipelineOptions }
Return: PipelineRun
Notes:  Triggers the full agent pipeline. Publishes investigation.started event.
```

### `GET /cases/:caseId/pipeline/status`
```
Return: PipelineStatus  (current status of all agents for this case)
```

### `POST /cases/:caseId/pipeline/agents/:agentId/run`
```
Body:   { evidenceIds?: string[], options?: AgentOptions }
Return: AgentExecution
Notes:  Run a single agent independently
```

### `GET /cases/:caseId/pipeline/executions`
```
Query:  page, pageSize, agentId?, status?
Return: AgentExecution[]  (paginated)
```

### `GET /cases/:caseId/pipeline/executions/:executionId`
```
Return: AgentExecutionDetail  (with full output)
```

---

## Report Endpoints

### `GET /cases/:caseId/reports`
```
Return: Report[]
```

### `POST /cases/:caseId/reports/generate`
```
Body:   { sections?: string[], format?: 'FULL' | 'SUMMARY' | 'LEGAL' }
Return: Report
Notes:  Report status starts as DRAFT. Requires human approval to finalize.
```

### `GET /cases/:caseId/reports/:reportId`
```
Return: ReportDetail
```

### `POST /cases/:caseId/reports/:reportId/approve` [INVESTIGATOR, SUPERVISOR]
```
Body:   { notes?: string }
Return: Report  (status → FINALIZED)
```

### `GET /cases/:caseId/reports/:reportId/export`
```
Query:  format: 'PDF' | 'JSON'
Return: 302 redirect to signed URL
```

---

## Knowledge Graph Endpoints

### `GET /cases/:caseId/graph/nodes`
```
Query:  label?, limit?, offset?
Return: GraphNode[]
```

### `GET /cases/:caseId/graph/nodes/:nodeId`
```
Return: GraphNode  (with relationships)
```

### `GET /cases/:caseId/graph/paths`
```
Query:  fromId, toId, maxHops?
Return: GraphPath[]
```

### `GET /cases/:caseId/graph/search`
```
Query:  q, label?, limit?
Return: GraphNode[]
```

---

## Search Endpoints

### `GET /cases/:caseId/search`
```
Query:  q, type? ('SEMANTIC' | 'FULLTEXT' | 'METADATA'), scope?, limit?
Return: SearchResult[]
```

---

## Agents Endpoint (Platform Level)

### `GET /agents`
```
Return: AgentManifest[]  (all registered agent plugins)
```

### `GET /agents/:agentId/health`
```
Return: HealthStatus
```

### `GET /agents/:agentId/metrics`
```
Return: AgentMetrics
```

---

## System Endpoints

### `GET /health` [PUBLIC]
```
Return: { status: 'OK' | 'DEGRADED', services: ServiceHealth[] }
```

### `GET /metrics` [ADMIN]
```
Return: PlatformMetrics  (token usage, cost, agent performance)
```

### `GET /feature-flags` [ADMIN]
```
Return: FeatureFlag[]
```

### `PATCH /feature-flags/:flagId` [ADMIN]
```
Body:   { enabled: boolean }
Return: FeatureFlag
```

---

## WebSocket Events (Real-Time)

Connection: `ws://{host}/ws?token={accessToken}&caseId={caseId}`

### Incoming Events (server → client)

```typescript
{ event: 'agent.started',    data: AgentStartedPayload }
{ event: 'agent.progress',   data: AgentProgressPayload }
{ event: 'agent.completed',  data: AgentCompletedPayload }
{ event: 'agent.failed',     data: AgentFailedPayload }
{ event: 'gate.requested',   data: GateRequestedPayload }
{ event: 'graph.updated',    data: GraphUpdatePayload }
{ event: 'timeline.updated', data: TimelineUpdatePayload }
{ event: 'risk.updated',     data: RiskUpdatePayload }
{ event: 'report.ready',     data: ReportReadyPayload }
{ event: 'pipeline.completed', data: PipelineCompletedPayload }
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

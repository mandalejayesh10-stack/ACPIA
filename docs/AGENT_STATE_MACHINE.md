# ACPIA — Agent State Machine

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Scope**: All 16 investigation agent plugins  
> **Storage**: `agent_executions` PostgreSQL table + Redis (live state)

---

## State Diagram

```
                    ┌──────────────────┐
                    │    CREATED       │
                    │  (instantiated)  │
                    └────────┬─────────┘
                             │ register()
                             ▼
                    ┌──────────────────┐
                    │   REGISTERED     │
                    │  (in registry)   │
                    └────────┬─────────┘
                             │ health() → HEALTHY
                             ▼
              ┌──────────────────────────────┐
              │           READY              │
              │  (accepting work, healthy)   │
              └────────────┬─────────────────┘
                           │ execute() called
                           ▼
              ┌──────────────────────────────┐
              │          RUNNING             │──────────────────┐
              │  (actively processing)       │                  │
              └──────┬──────────────┬────────┘                  │
                     │              │                           │
             success │    error     │ human gate           health check
                     │    (transient)│ required             fails (fatal)
                     ▼              ▼                           │
          ┌──────────────┐  ┌─────────────┐                    │
          │  COMPLETED   │  │    RETRY    │                    │
          │  (output     │  │  (waiting,  │                    │
          │   produced)  │  │  backoff)   │                    │
          └──────┬───────┘  └──────┬──────┘                    │
                 │                 │                           ▼
    Verification │         execute │            ┌──────────────────────────┐
    Agent runs   │         retry   │            │          FAILED          │
                 ▼                 ▼            │  (non-recoverable,       │
          ┌──────────────┐  ┌─────────────┐    │   human intervention     │
          │  VERIFIED    │  │   RUNNING   │    │   required)              │
          │  (output     │  │  (resumed)  │    └──────────────────────────┘
          │   validated) │  └─────────────┘
          └──────┬───────┘
                 │ also enters from RUNNING
                 │ when human gate required
                 ▼
          ┌──────────────┐
          │    PAUSED    │──── human approves ──▶ RUNNING (resume)
          │  (awaiting   │──── human rejects  ──▶ FAILED
          │   approval)  │──── deadline passed──▶ ESCALATED ──▶ SUPERVISOR
          └──────────────┘

          VERIFIED + case closed
                 │
                 ▼
          ┌──────────────┐
          │   ARCHIVED   │
          │  (immutable, │
          │   read-only) │
          └──────────────┘
```

---

## State Definitions

### `CREATED`
**Description**: The agent plugin class has been instantiated. No registration has occurred.  
**Entry**: Plugin class constructor called at startup  
**Exit**: `register()` called successfully  
**Duration**: Milliseconds  

---

### `REGISTERED`
**Description**: The plugin has registered its manifest, subscriptions, and MCP clients with the platform registry. It is known to the system but not yet confirmed healthy.  
**Entry**: `register()` returns successfully  
**Exit**: First health check passes → `READY`  
**Duration**: Seconds (first health check cycle)  

---

### `READY`
**Description**: The agent is healthy, has passed its health check, and is waiting for work. This is the idle state.  
**Entry**: `health()` returns `HEALTHY`  
**Exit**: `execute()` called → `RUNNING`  
**Characteristics**: Health checks continue every 30s  

---

### `RUNNING`
**Description**: The agent is actively processing an `AgentInput`. This state is reflected in real-time on the UI via WebSocket.  
**Entry**: `execute()` called  
**Exits**:
- Success → `COMPLETED`
- Transient error → `RETRY`
- Human gate trigger → `PAUSED`
- Fatal error → `FAILED`

**Duration**: Agent-specific (seconds to minutes)  
**Max duration**: Enforced by `timeoutMs` in manifest  

---

### `RETRY`
**Description**: The agent encountered a transient error (network failure, rate limit, timeout) and is waiting before the next attempt.  
**Entry**: Transient error thrown, attempt < `maxAttempts`  
**Exit**: Backoff expires → `RUNNING` (retry)  
**Max retries**: 3 (default, configurable per agent)  
**Backoff**: Exponential (1s → 2s → 4s)  

**State record**:
```json
{
  "state": "RETRY",
  "attempt": 2,
  "maxAttempts": 3,
  "nextRetryAt": "2024-01-15T10:31:00Z",
  "lastError": { "code": "RATE_LIMIT", "message": "..." }
}
```

---

### `PAUSED`
**Description**: The agent has produced an output that requires human approval before the pipeline can proceed. The output is stored but not published to the Event Bus.  
**Entry**: Human gate triggered by agent output (see `AI_SAFETY.md`)  
**Exits**:
- Approved → `RUNNING` (publishes output, pipeline continues)
- Rejected → `FAILED`
- Deadline exceeded → `ESCALATED` (notifies SUPERVISOR, then waits)

**UI**: Pulsing purple indicator on Agent Card. Gate request visible in notification panel.  

---

### `COMPLETED`
**Description**: The agent has successfully produced and published its `AgentOutput` to the Event Bus and written it to the Investigation State.  
**Entry**: `publish()` succeeds  
**Exit**: Case closed → `ARCHIVED`  

---

### `VERIFIED`
**Description**: The agent's output has been validated by the Verification Agent (Agent 14). The output is now part of the official investigation record.  
**Entry**: Verification Agent marks this execution as verified  
**Note**: Not all agents wait for verification before proceeding — verification runs async and updates state retroactively  

---

### `FAILED`
**Description**: The agent encountered a non-recoverable error, or all retry attempts were exhausted, or a human rejected the gate.  
**Entry**:
- `maxAttempts` exhausted with no success
- Non-retryable error thrown (e.g., `EVIDENCE_TAMPERED`, `UNAUTHORIZED`)
- Human rejected at approval gate

**Actions taken**:
1. Error logged to audit log
2. `AGENT_FAILED` event published to Event Bus
3. Pipeline halted or continues (depending on `critical` flag in manifest)
4. Alert sent to ADMIN / SUPERVISOR
5. Message moved to Dead Letter Queue

---

### `ARCHIVED`
**Description**: The execution record is immutable and read-only. The case has been closed. The output is preserved for legal and audit purposes.  
**Entry**: Case is closed (status → `CLOSED` or `ARCHIVED`)  
**Actions**: All agent execution records for the case are set to `ARCHIVED`  
**Immutability**: PostgreSQL row-level security prevents UPDATE/DELETE  

---

## State Storage

### PostgreSQL (durable)

```sql
CREATE TABLE agent_executions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id           UUID NOT NULL REFERENCES cases(id),
  agent_id          TEXT NOT NULL,
  agent_version     TEXT NOT NULL,
  state             TEXT NOT NULL,
  attempt           INT NOT NULL DEFAULT 1,
  triggered_by      TEXT NOT NULL,
  triggered_at      TIMESTAMPTZ NOT NULL,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  output            JSONB,
  error             JSONB,
  gate_id           UUID REFERENCES human_gates(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Redis (live state — TTL: 24 hours)

```
Key: acpia:execution:{executionId}:state
Val: { state, startedAt, attempt, agentId, caseId }
TTL: 86400 seconds
```

Used for real-time WebSocket state broadcasting to the frontend.

---

## State Transition Events

Every state transition publishes an event to RabbitMQ:

| Transition | Topic |
|---|---|
| → RUNNING | `acpia.agents.{agentId}.started` |
| → RETRY | `acpia.agents.{agentId}.retry` |
| → PAUSED | `acpia.agents.{agentId}.gate_requested` |
| → COMPLETED | `acpia.agents.{agentId}.completed` |
| → FAILED | `acpia.agents.{agentId}.failed` |
| → VERIFIED | `acpia.agents.{agentId}.verified` |
| → ARCHIVED | `acpia.agents.{agentId}.archived` |

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

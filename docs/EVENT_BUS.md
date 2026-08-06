# ACPIA — Event Bus Architecture

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Backend**: RabbitMQ  
> **Principle**: Agents communicate only through events. Never directly.

---

## Overview

The ACPIA Event Bus is powered by RabbitMQ. Every agent-to-agent communication, every platform notification, and every state change in the investigation pipeline flows through this bus. No agent imports another agent. No service calls another service synchronously across plugin boundaries.

---

## Topic Naming Convention

```
acpia.{service}.{entity}.{action}

Examples:
acpia.agents.evidence.completed
acpia.agents.threat.started
acpia.cases.case.created
acpia.evidence.file.uploaded
acpia.pipeline.investigation.failed
acpia.system.health.degraded
```

| Segment | Values |
|---|---|
| `service` | `agents` \| `cases` \| `evidence` \| `pipeline` \| `system` \| `reports` \| `users` |
| `entity` | `evidence` \| `case` \| `agent` \| `report` \| `risk` \| `timeline` \| `graph` \| `investigation` \| `health` |
| `action` | `created` \| `updated` \| `completed` \| `failed` \| `started` \| `paused` \| `archived` \| `retry` \| `gate_requested` \| `gate_approved` \| `gate_rejected` |

---

## Exchange Configuration

| Exchange | Type | Purpose |
|---|---|---|
| `acpia.agents` | `topic` | Agent lifecycle and pipeline events |
| `acpia.cases` | `topic` | Case management events |
| `acpia.evidence` | `topic` | Evidence events |
| `acpia.system` | `fanout` | System-wide broadcasts (shutdown, health) |
| `acpia.pipeline` | `topic` | Investigation pipeline orchestration |
| `acpia.dlx` | `direct` | Dead Letter Exchange (all failed messages) |

---

## Queue Definitions

### Agent Queues

Each agent plugin has a dedicated, durable queue.

| Queue | Binds To | Description |
|---|---|---|
| `q.agent.evidence-intake` | `acpia.pipeline.investigation.started` | Evidence Intake Agent |
| `q.agent.content-analysis` | `acpia.agents.evidence.completed` | Content Analysis Agent |
| `q.agent.threat-identification` | `acpia.agents.content-analysis.completed` | Threat Identification Agent |
| `q.agent.context-extraction` | `acpia.agents.content-analysis.completed` | Context Extraction Agent |
| `q.agent.activity-pattern` | `acpia.agents.threat-identification.completed` | Activity Pattern Agent |
| `q.agent.metadata-mapping` | `acpia.agents.evidence.completed` | Metadata Mapping Agent |
| `q.agent.synthetic-detection` | `acpia.agents.content-analysis.completed` | Synthetic Detection Agent |
| `q.agent.timeline-reconstruction` | `acpia.agents.metadata-mapping.completed` | Timeline Reconstruction Agent |
| `q.agent.intelligent-retrieval` | `acpia.agents.timeline-reconstruction.completed` | Intelligent Retrieval Agent |
| `q.agent.automated-reporting` | `acpia.agents.intelligent-retrieval.completed` | Automated Reporting Agent |
| `q.agent.risk-assessment` | `acpia.agents.threat-identification.completed` | Risk Assessment Agent |
| `q.agent.intelligence-fusion` | `acpia.agents.risk-assessment.completed` | Intelligence Fusion Agent |
| `q.agent.hypothesis-generation` | `acpia.agents.intelligence-fusion.completed` | Hypothesis Generation Agent |
| `q.agent.verification` | `acpia.agents.hypothesis-generation.completed` | Verification Agent |
| `q.agent.copilot` | `acpia.pipeline.investigation.completed` | Copilot Agent |
| `q.agent.explainability` | `acpia.pipeline.investigation.completed` | Explainability Agent |

### Platform Queues

| Queue | Binds To | Description |
|---|---|---|
| `q.pipeline.orchestration` | `acpia.pipeline.*` | Chief Investigation Agent |
| `q.notifications.realtime` | `acpia.agents.*.completed`, `acpia.agents.*.failed` | WebSocket notification service |
| `q.audit.logger` | `acpia.*` | Audit log writer |
| `q.monitoring.metrics` | `acpia.*` | Metrics collector |
| `q.dlq.agents` | `acpia.dlx` | Dead letter queue for failed agent messages |
| `q.dlq.pipeline` | `acpia.dlx` | Dead letter queue for failed pipeline messages |

---

## Event Schema

All events follow this base envelope:

```typescript
interface BusEvent<T = unknown> {
  // Routing
  eventId: string             // UUID
  topic: string               // full topic name
  timestamp: Date
  
  // Correlation
  traceId: string             // spans the full investigation pipeline run
  correlationId: string       // links related events (e.g., request/response)
  caseId: string
  investigationId: string
  
  // Source
  source: {
    service: string           // 'evidence-intake-agent'
    version: string           // '1.0.0'
    instanceId: string        // for horizontal scaling
  }
  
  // Payload
  payload: T
  
  // Metadata
  schemaVersion: string       // '1.0'
  priority: EventPriority     // see Priority section
  retry: {
    attempt: number
    maxAttempts: number
    lastError?: string
  }
}
```

---

## Core Event Payloads

### Agent Completed Event

```typescript
interface AgentCompletedPayload {
  executionId: string
  agentId: string
  agentVersion: string
  status: 'SUCCESS' | 'PARTIAL'
  outputSummary: string         // brief human-readable summary
  findingsCount: number
  confidence: number
  durationMs: number
  evidenceIds: string[]
  outputStorageKey: string      // where full output is stored in PostgreSQL
}
```

### Agent Failed Event

```typescript
interface AgentFailedPayload {
  executionId: string
  agentId: string
  errorCode: string
  errorMessage: string
  retryable: boolean
  attempt: number
  willRetry: boolean
}
```

### Investigation Started Event

```typescript
interface InvestigationStartedPayload {
  investigationId: string
  caseId: string
  evidenceIds: string[]
  triggeredBy: string           // user ID
  pipelineConfig: {
    enabledAgents: string[]
    featureFlags: Record<string, boolean>
  }
}
```

### Human Gate Requested Event

```typescript
interface GateRequestedPayload {
  gateId: string
  gateType: string
  agentId: string
  caseId: string
  summary: string
  requiredRole: Role
  deadline: Date
  outputStorageKey: string
}
```

---

## Priority Levels

```typescript
enum EventPriority {
  CRITICAL = 10,    // system failures, evidence tampering
  HIGH = 7,         // agent failures, human gate requests
  NORMAL = 5,       // standard agent events (default)
  LOW = 2,          // metrics, non-urgent notifications
  BACKGROUND = 1    // audit logging, archival
}
```

RabbitMQ priority queue is configured with `x-max-priority: 10`.

---

## Retry Policy

### Message-Level Retry

```typescript
interface MessageRetryPolicy {
  maxAttempts: 3
  backoff: 'EXPONENTIAL'
  initialDelayMs: 1000       // 1s → 2s → 4s
  maxDelayMs: 30000
}
```

Messages are nacked (not acked) on failure. RabbitMQ requeues them. After `maxAttempts` exhausted, message is routed to the Dead Letter Exchange.

---

## Dead Letter Queue (DLQ)

### DLQ Configuration

```
Exchange: acpia.dlx
Queue: q.dlq.agents
Queue: q.dlq.pipeline
Message TTL: 7 days (after that, permanently logged and discarded)
```

### DLQ Processing

1. Failed message arrives in DLQ
2. `DlqWorker` service picks up the message
3. Logs full message content to PostgreSQL `failed_events` table
4. Notifies ADMIN via notification service
5. Marks the associated `agent_execution` record as `FAILED`
6. If the failure is retriable at investigation level, creates a manual rerun task

### DLQ Alert Rules

| Condition | Action |
|---|---|
| 5+ messages in DLQ | Alert ADMIN |
| Same topic failing repeatedly | Alert ADMIN + auto-disable agent |
| Evidence-related failure | Alert SUPERVISOR + halt pipeline |

---

## Ordering Guarantees

RabbitMQ does not guarantee global ordering across queues. ACPIA's design accounts for this:

1. **Pipeline ordering** is enforced by the event binding graph — each agent only consumes events from its upstream agent. This creates a natural sequence without relying on global ordering.

2. **Timeline events** are ordered by timestamp, not by arrival order. The Timeline Agent sorts on database write.

3. **Investigation state** is idempotent — agents check if their output already exists before writing. Duplicate event delivery is safe.

---

## Exactly-Once Processing

ACPIA uses **at-least-once delivery** (RabbitMQ guarantee) with **idempotent consumers** to achieve effectively-exactly-once processing.

```typescript
// Every agent executor checks before processing
const existing = await db.agentExecution.findUnique({
  where: { executionId: input.executionId }
})
if (existing?.status === 'COMPLETED') {
  logger.info('Duplicate event received, skipping', { executionId })
  channel.ack(message)  // ack without re-processing
  return
}
```

---

## Connection Management

```typescript
// RabbitMQ connection config
const CONNECTION_CONFIG = {
  hostname: process.env.RABBITMQ_HOST,
  port: 5672,
  username: process.env.RABBITMQ_USER,
  password: process.env.RABBITMQ_PASS,
  vhost: '/acpia',
  heartbeat: 60,
  connectionTimeout: 5000
}

// Connection pool (amqplib)
maxChannels: 100
prefetchCount: 10            // per agent queue (backpressure)
```

---

## Monitoring

| Metric | Alert Threshold |
|---|---|
| Queue depth (any queue) | > 100 messages |
| Message age (any queue) | > 5 minutes |
| DLQ depth | > 5 messages |
| Consumer count drops to 0 | Immediate alert |
| Publish rate drops to 0 | After 2 minutes |

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

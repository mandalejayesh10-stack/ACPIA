# ACPIA — Agent Contract

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Scope**: All 16 investigation agent plugins  
> **Principle**: Every agent looks the same from the outside. What differs is what it does on the inside.

---

## Overview

Every agent in ACPIA is a **plugin** that implements the `AgentPlugin` interface from `@acpia/agent-sdk`. This contract defines exactly what every agent must do, how it communicates, how it fails, how it recovers, and how it reports.

---

## 1. Agent Lifecycle

```
CREATED
   │
   ▼ register()
REGISTERED
   │
   ▼ health() = HEALTHY
READY
   │
   ▼ execute() called
RUNNING
   │
   ├── (success) ────────────────────────────────▶ COMPLETED
   │                                                    │
   ├── (transient error, retryable) ──▶ RETRY           ▼
   │                                       │        VERIFIED
   │                                       │        (after Verification Agent)
   ├── (paused by human gate) ──▶ PAUSED   │            │
   │                                │      │            ▼
   │                          resume▼    retry▼     ARCHIVED
   │                          RUNNING  RUNNING      (case closed)
   │
   └── (fatal error, non-retryable) ──▶ FAILED
```

### State Definitions

| State | Description |
|---|---|
| `CREATED` | Plugin class instantiated, not yet registered |
| `REGISTERED` | Plugin registered in the Chief Agent's plugin registry |
| `READY` | Health check passed, accepting work |
| `RUNNING` | Actively processing an `AgentInput` |
| `PAUSED` | Awaiting human approval gate |
| `RETRY` | Waiting before reattempting after a transient error |
| `COMPLETED` | Successfully produced and published an `AgentOutput` |
| `VERIFIED` | Output passed the Verification Agent |
| `FAILED` | Non-recoverable error, requires human intervention |
| `ARCHIVED` | Output archived when case is closed |

---

## 2. Agent Plugin Interface

```typescript
// packages/agent-sdk/src/interfaces/agent-plugin.interface.ts

export interface AgentPlugin {
  /**
   * Agent metadata — declared statically, never changes at runtime.
   */
  readonly manifest: AgentManifest

  /**
   * Called once at startup. Register tools, event subscriptions, and MCP clients.
   */
  register(registry: PluginRegistry): Promise<void>

  /**
   * Core execution logic. Receives typed input, returns typed output.
   * This is the ONLY place agent logic lives.
   */
  execute(input: AgentInput, context: AgentContext): Promise<AgentOutput>

  /**
   * Validate input before execution. Must be fast (no I/O).
   */
  validate(input: AgentInput): ValidationResult

  /**
   * Publish output to the Event Bus after successful execution.
   */
  publish(output: AgentOutput, bus: EventBus): Promise<void>

  /**
   * Return current health status. Called by the health check system.
   */
  health(): Promise<HealthStatus>

  /**
   * Called when the platform is shutting down. Clean up resources.
   */
  shutdown(): Promise<void>
}
```

---

## 3. Agent Manifest

Every agent declares its identity and capabilities at the class level.

```typescript
export interface AgentManifest {
  id: string                  // 'evidence-intake-agent'
  name: string                // 'Evidence Intake Agent'
  version: string             // '1.0.0' (semver)
  description: string
  agentNumber: number         // 1–16
  inputSchema: ZodSchema      // Zod schema for input validation
  outputSchema: ZodSchema     // Zod schema for output validation
  requiredMcpServers: McpServer[]
  requiredFeatureFlags: FeatureFlag[]
  maxConcurrentExecutions: number
  timeoutMs: number
  retryPolicy: RetryPolicy
  requiresHumanGates: HumanGate[]
  publishesTopic: string      // 'acpia.agents.evidence.completed'
  subscribesToTopics: string[] // upstream agent topics this agent listens to
}
```

---

## 4. Agent Input/Output

### Input
```typescript
export interface AgentInput {
  executionId: string         // UUID for this specific run
  caseId: string
  investigationId: string
  evidenceIds: string[]       // evidence to process
  previousOutputs: Record<string, AgentOutput>  // outputs from upstream agents
  userContext: {
    userId: string
    role: Role
    sessionId: string
  }
  options: Record<string, unknown>  // agent-specific config
  triggeredAt: Date
  triggeredBy: 'USER' | 'PIPELINE' | 'SCHEDULER' | 'RETRY'
}
```

### Output
```typescript
export interface AgentOutput {
  executionId: string
  agentId: string
  agentVersion: string
  caseId: string
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'SKIPPED'
  
  // Core findings
  findings: Finding[]
  
  // Explainability (REQUIRED — see AI Safety)
  confidence: number
  reasoning: string[]
  evidenceRefs: string[]
  modelUsed?: string
  promptId?: string
  promptVersion?: string
  
  // Knowledge graph updates
  graphNodes: GraphNodeInput[]
  graphRelationships: GraphRelationshipInput[]
  
  // Timeline updates
  timelineEvents: TimelineEventInput[]
  
  // Performance metadata
  startedAt: Date
  completedAt: Date
  durationMs: number
  tokensUsed?: number
  estimatedCostUsd?: number
  
  // Error (only when status = FAILED or PARTIAL)
  error?: {
    code: string
    message: string
    retryable: boolean
    fallbackUsed?: string
  }
}
```

---

## 5. Agent Context

The context object is injected by the SDK and provides access to all platform services.

```typescript
export interface AgentContext {
  // MCP clients (read-only by default)
  mcp: {
    evidence: EvidenceMcpClient
    vision: VisionMcpClient
    metadata: MetadataMcpClient
    graph: GraphMcpClient
    timeline: TimelineMcpClient
    search: SearchMcpClient
    risk: RiskMcpClient
    report: ReportMcpClient
    audit: AuditMcpClient
    memory: MemoryMcpClient
  }
  
  // AI Provider Layer
  ai: AiProvider
  
  // Logger (structured, case-scoped)
  logger: AgentLogger
  
  // Feature flags
  flags: FeatureFlagClient
  
  // Execution state
  executionId: string
  caseId: string
  abortSignal: AbortSignal  // use this to respect cancellation
}
```

---

## 6. Health Check

Every agent implements `health()` which the platform polls every 30 seconds.

```typescript
export interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'
  agent: string
  version: string
  timestamp: Date
  checks: HealthCheck[]
  metrics: {
    executionsToday: number
    averageLatencyMs: number
    errorRatePercent: number
    lastExecutedAt?: Date
  }
}

export interface HealthCheck {
  name: string                // 'mcp_evidence' | 'ai_provider' | 'event_bus'
  status: 'OK' | 'WARN' | 'FAIL'
  latencyMs?: number
  message?: string
}
```

---

## 7. Logging Contract

Every agent log entry uses the structured JSON format defined in `ENGINEERING_CONTRACT.md`.

```typescript
// Agent-specific logger with automatic context injection
interface AgentLogger {
  info(message: string, meta?: Record<string, unknown>): void
  warn(message: string, meta?: Record<string, unknown>): void
  error(message: string, error: Error, meta?: Record<string, unknown>): void
  debug(message: string, meta?: Record<string, unknown>): void
}

// Automatically injected fields in every log entry:
// {
//   timestamp: ISO8601,
//   level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
//   service: 'acpia.agents.{agent-id}',
//   traceId: string,       // correlates all logs for one execution
//   executionId: string,
//   caseId: string,
//   agentId: string,
//   agentVersion: string,
//   message: string,
//   meta: {}
// }
```

Forbidden in logs:
- Evidence file content
- PII (names, phone numbers)
- API keys or secrets
- Full AI prompt text

---

## 8. Retry Policy

```typescript
export interface RetryPolicy {
  maxAttempts: number         // default: 3
  backoffStrategy: 'FIXED' | 'EXPONENTIAL' | 'JITTER'
  initialDelayMs: number      // default: 1000
  maxDelayMs: number          // default: 30000
  retryableErrors: string[]   // error codes that trigger retry
  nonRetryableErrors: string[] // error codes that immediately fail
}

// Default retry policy (can be overridden in manifest)
const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  backoffStrategy: 'EXPONENTIAL',
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  retryableErrors: ['NETWORK_ERROR', 'RATE_LIMIT', 'TIMEOUT', 'AI_OVERLOADED'],
  nonRetryableErrors: ['EVIDENCE_TAMPERED', 'UNAUTHORIZED', 'INVALID_INPUT', 'CASE_CLOSED']
}
```

---

## 9. Memory Contract

Agents interact with memory exclusively through the Memory MCP Server. Memory is scoped to case and session.

```typescript
// What agents SHOULD store in memory
interface AgentMemoryKeys {
  [`agent.{agentId}.lastRunAt`]: Date
  [`agent.{agentId}.summary`]: string       // brief summary of last findings
  [`entity.{entityId}.facts`]: EntityFacts  // extracted facts about an entity
  [`case.entities`]: string[]               // all entity IDs found so far
  [`case.threats`]: ThreatSummary[]         // running threat list
}

// Memory TTL guidelines
// Case-level memory: no TTL (persists for case lifetime)
// Session memory: 8 hours
// Temporary computation: 10 minutes
```

---

## 10. Metrics Contract

Every agent emits the following metrics (collected by OpenTelemetry):

```typescript
// Counters
acpia.agent.executions.total{agentId, status}
acpia.agent.retries.total{agentId, reason}
acpia.agent.gate_pauses.total{agentId}

// Histograms
acpia.agent.execution.duration_ms{agentId}
acpia.agent.tokens.used{agentId, model}
acpia.agent.cost.usd{agentId, model}

// Gauges
acpia.agent.queue.depth{agentId}
acpia.agent.health{agentId}  // 1=HEALTHY, 0.5=DEGRADED, 0=UNHEALTHY
```

---

## 11. Explainability Contract

Every agent that uses AI must populate the explainability fields. No exceptions.

```typescript
// Minimum explainability requirement for AI-powered agents
interface ExplainabilityRequirement {
  confidence: number           // Overall confidence 0–1
  reasoning: string[]          // Min 3 reasoning steps
  evidenceRefs: string[]       // Min 1 evidence reference
  modelUsed: string            // Exact model identifier
  promptId: string             // From Prompt Registry
  promptVersion: string        // Semantic version
}

// Non-AI agents (e.g., Evidence Intake, Metadata) are exempt from
// modelUsed, promptId, promptVersion but still require:
// confidence (rule-based) and evidenceRefs
```

---

## Plugin File Structure

Every plugin follows this folder structure:

```
plugins/{agent-name}/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              // exports the plugin class
│   ├── manifest.ts           // AgentManifest definition
│   ├── agent.ts              // Main class implementing AgentPlugin
│   ├── executor.ts           // Core execution logic
│   ├── validator.ts          // Input validation
│   └── types.ts              // Agent-specific types
├── tests/
│   ├── agent.test.ts         // Unit tests
│   ├── executor.test.ts      // Execution logic tests
│   └── fixtures/             // Test fixtures
└── README.md                 // Agent purpose, inputs, outputs, examples
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

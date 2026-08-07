/**
 * @acpia/agent-sdk — Plugin Interface & Types
 * Governed by docs/AGENT_CONTRACT.md & docs/AGENT_STATE_MACHINE.md
 */

export interface AgentManifest {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly description: string
  readonly sprint: number
  readonly requiredMcpServers: string[]
  readonly requiredEvents: string[]
  readonly publishedEvents: string[]
}

export interface AgentInput {
  readonly caseId: string
  readonly investigationId: string
  readonly executionId: string
  readonly evidenceIds?: string[]
  readonly params?: Record<string, unknown>
}

export interface AgentFinding {
  readonly id: string
  readonly category: string
  readonly description: string
  readonly confidence: number // 0.0 to 1.0
  readonly evidenceRefs: string[]
  readonly metadata?: Record<string, unknown>
}

export interface AgentOutput {
  readonly status: 'SUCCESS' | 'PARTIAL' | 'FAILED'
  readonly findings: AgentFinding[]
  readonly confidence: number
  readonly reasoning: string
  readonly evidenceRefs: string[]
  readonly metrics?: {
    durationMs: number
    tokensUsed?: number
  }
}

export interface ValidationResult {
  readonly valid: boolean
  readonly errors?: string[]
}

export interface HealthStatus {
  readonly status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'
  readonly agentId: string
  readonly version: string
  readonly timestamp: Date
}

export interface AgentContext {
  readonly caseId: string
  readonly traceId: string
  readonly executionId: string
  readonly mcp: Record<string, unknown>
  readonly flags: {
    isEnabled: (flagId: string) => boolean
  }
}

export interface AgentPlugin {
  readonly manifest: AgentManifest
  register(registry: unknown): Promise<void>
  execute(input: AgentInput, context: AgentContext): Promise<AgentOutput>
  validate(input: AgentInput): ValidationResult
  health(): Promise<HealthStatus>
  shutdown(): Promise<void>
}

export * from './base-agent.js'

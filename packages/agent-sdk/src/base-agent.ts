import {
  AgentPlugin,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  ValidationResult,
  HealthStatus,
} from './index.js'

export abstract class BaseAgent implements AgentPlugin {
  abstract readonly manifest: AgentManifest

  async register(_registry: unknown): Promise<void> {
    // Default registration hook for plugins
  }

  validate(input: AgentInput): ValidationResult {
    if (!input || !input.caseId || !input.executionId) {
      return {
        valid: false,
        errors: ['Missing required caseId or executionId in AgentInput'],
      }
    }
    return { valid: true }
  }

  async health(): Promise<HealthStatus> {
    return {
      status: 'HEALTHY',
      agentId: this.manifest.id,
      version: this.manifest.version,
      timestamp: new Date(),
    }
  }

  async shutdown(): Promise<void> {
    // Default cleanup hook
  }

  /**
   * Template method executing the agent lifecycle: validate -> execute -> metrics
   */
  async execute(input: AgentInput, context: AgentContext): Promise<AgentOutput> {
    const startTime = Date.now()

    const validation = this.validate(input)
    if (!validation.valid) {
      return {
        status: 'FAILED',
        findings: [],
        confidence: 0,
        reasoning: `Validation failed: ${validation.errors?.join(', ')}`,
        evidenceRefs: input.evidenceIds || [],
        metrics: {
          durationMs: Date.now() - startTime,
        },
      }
    }

    try {
      const output = await this.onExecute(input, context)
      const durationMs = Date.now() - startTime

      return {
        ...output,
        metrics: {
          durationMs,
          tokensUsed: output.metrics?.tokensUsed || 0,
        },
      }
    } catch (err) {
      return {
        status: 'FAILED',
        findings: [],
        confidence: 0,
        reasoning: `Execution error: ${(err as Error).message}`,
        evidenceRefs: input.evidenceIds || [],
        metrics: {
          durationMs: Date.now() - startTime,
        },
      }
    }
  }

  /**
   * Abstract execution method implemented by specific investigation agent plugins
   */
  abstract onExecute(input: AgentInput, context: AgentContext): Promise<AgentOutput>
}

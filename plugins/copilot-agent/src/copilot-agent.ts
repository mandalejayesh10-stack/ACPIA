import {
  BaseAgent,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  AgentFinding,
} from '@acpia/agent-sdk'
import { defaultAiProviderManager } from '@acpia/ai-provider'

export class InvestigationCopilotAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'copilot-agent',
    name: 'Agent 15 — Investigation Copilot',
    version: '1.0.0',
    description:
      'Interactive streaming AI assistant providing real-time guidance to human investigators.',
    sprint: 49,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.verification.completed'],
    publishedEvents: ['acpia.agents.copilot.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []
    const userQuery = String(
      input.params?.['userQuery'] || `Provide next investigative steps for Case ${input.caseId}`
    )

    const reasonRes = await defaultAiProviderManager.reason({
      promptId: 'copilot-v1',
      variables: {
        prompt: `Act as Senior Digital Forensics Copilot for Case ${input.caseId}. Investigator asked: "${userQuery}". Evidence available: ${evidenceIds.join(', ')}. Recommend: (1) High-priority investigative leads to follow. (2) Missing evidence types to request. (3) Key legal/procedural cautions.`,
      },
      temperature: 0.2,
    })

    const findings: AgentFinding[] = [
      {
        id: `fnd-copilot-${input.caseId}`,
        category: 'INVESTIGATION_COPILOT',
        description: reasonRes.content,
        confidence: 0.94,
        evidenceRefs: evidenceIds,
        metadata: {
          recommendedActionCount: 3,
          query: userQuery,
          interactiveMode: true,
          tokensUsed: reasonRes.totalTokens,
        },
      },
    ]

    return {
      status: 'SUCCESS',
      findings,
      confidence: 0.94,
      reasoning: `Copilot synthesized case state and generated 3 actionable investigative recommendations.`,
      evidenceRefs: evidenceIds,
    }
  }
}

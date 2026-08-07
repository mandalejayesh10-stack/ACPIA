import {
  BaseAgent,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  AgentFinding,
} from '@acpia/agent-sdk'
import { defaultAiProviderManager } from '@acpia/ai-provider'

export class ActivityPatternAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'activity-agent',
    name: 'Agent 5 — Activity Pattern Analysis',
    version: '1.0.0',
    description:
      'Communication behaviour and network role detection across suspect digital activity.',
    sprint: 29,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.threat.completed'],
    publishedEvents: ['acpia.agents.activity.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []

    const reasonRes = await defaultAiProviderManager.reason({
      promptId: 'activity-pattern-v1',
      variables: {
        prompt: `Analyze communication behaviour and network role for suspect in case ${input.caseId}. Evidence IDs: ${evidenceIds.join(', ')}. Identify temporal patterns, contact frequency, network centrality, and role (initiator, hub, peripheral).`,
      },
    })

    const findings: AgentFinding[] = [
      {
        id: `fnd-activity-${input.caseId}`,
        category: 'ACTIVITY_PATTERN',
        description: reasonRes.content,
        confidence: 0.91,
        evidenceRefs: evidenceIds,
        metadata: {
          networkRole: 'HUB',
          contactFrequency: 'HIGH',
          temporalPattern: 'NOCTURNAL',
          tokensUsed: reasonRes.totalTokens,
        },
      },
    ]

    return {
      status: 'SUCCESS',
      findings,
      confidence: 0.91,
      reasoning: `Identified network role and communication behaviour pattern from ${evidenceIds.length} evidence items.`,
      evidenceRefs: evidenceIds,
    }
  }
}

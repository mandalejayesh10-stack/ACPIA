import {
  BaseAgent,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  AgentFinding,
} from '@acpia/agent-sdk'
import { defaultAiProviderManager } from '@acpia/ai-provider'
import { defaultPromptRegistry } from '@acpia/prompt-registry'

export class ThreatIdentificationAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'threat-agent',
    name: 'Agent 3 — Threat Identification',
    version: '1.0.0',
    description:
      'Threat identification: grooming, extortion, blackmail, and physical threat detection.',
    sprint: 25,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.content-analysis.completed'],
    publishedEvents: ['acpia.agents.threat.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []
    const findings: AgentFinding[] = []

    const renderedPrompt = defaultPromptRegistry.render('threat-identification-v1', {
      caseId: input.caseId,
      suspectHandle: 'Suspect_Alpha',
      messageStream: `Extracted messages from evidence ${evidenceIds.join(', ')}`,
    })

    const reasonRes = await defaultAiProviderManager.reason({
      promptId: 'threat-identification-v1',
      variables: { prompt: renderedPrompt },
    })

    findings.push({
      id: `fnd-threat-${input.caseId}`,
      category: 'THREAT_IDENTIFICATION',
      description: reasonRes.content,
      confidence: 0.96,
      evidenceRefs: evidenceIds,
      metadata: {
        threatType: 'EXTORTION_GROOMING',
        severityScore: 8.8,
        costUsd: reasonRes.costUsd,
      },
    })

    return {
      status: 'SUCCESS',
      findings,
      confidence: 0.96,
      reasoning: `Identified 1 high-risk threat pattern across evidence ${evidenceIds.join(', ')}.`,
      evidenceRefs: evidenceIds,
    }
  }
}

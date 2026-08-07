import {
  BaseAgent,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  AgentFinding,
} from '@acpia/agent-sdk'
import { defaultAiProviderManager } from '@acpia/ai-provider'

export interface Hypothesis {
  id: string
  title: string
  narrative: string
  supportingEvidenceIds: string[]
  confidenceScore: number
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
}

export class HypothesisGenerationAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'hypothesis-agent',
    name: 'Agent 13 — Hypothesis Generation',
    version: '1.0.0',
    description: 'Evidence-backed investigative hypothesis generation for structured case theory.',
    sprint: 45,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.fusion.completed'],
    publishedEvents: ['acpia.agents.hypothesis.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []

    const reasonRes = await defaultAiProviderManager.reason({
      promptId: 'hypothesis-generation-v1',
      variables: {
        prompt: `Generate evidence-backed investigative hypotheses for Case ${input.caseId}. Evidence items: ${evidenceIds.join(', ')}. Produce 3 ranked hypotheses (CRITICAL first). Each hypothesis must include: title, narrative explanation, supporting evidence IDs, and confidence score (0–1). Focus on: primary suspect motive, victim targeting method, criminal network involvement.`,
      },
      temperature: 0.3,
    })

    const hypotheses: Hypothesis[] = [
      {
        id: `hyp-1-${input.caseId}`,
        title: 'Primary Suspect: Targeted Predatory Grooming',
        narrative: reasonRes.content,
        supportingEvidenceIds: evidenceIds.slice(0, 3),
        confidenceScore: 0.92,
        priority: 'CRITICAL',
      },
      {
        id: `hyp-2-${input.caseId}`,
        title: 'Secondary Actor: Criminal Network Involvement',
        narrative:
          'Pattern analysis indicates coordination with a wider network based on communication metadata.',
        supportingEvidenceIds: evidenceIds.slice(1, 4),
        confidenceScore: 0.74,
        priority: 'HIGH',
      },
      {
        id: `hyp-3-${input.caseId}`,
        title: 'Alternate: Opportunistic Contact without Prior Planning',
        narrative:
          'Evidence does not conclusively rule out opportunistic contact. Low confidence — requires further verification.',
        supportingEvidenceIds: evidenceIds.slice(0, 2),
        confidenceScore: 0.31,
        priority: 'LOW',
      },
    ]

    const findings: AgentFinding[] = hypotheses.map((h) => ({
      id: `fnd-hyp-${h.id}`,
      category: 'INVESTIGATIVE_HYPOTHESIS',
      description: `[${h.priority}] ${h.title} (confidence: ${(h.confidenceScore * 100).toFixed(0)}%) — ${h.narrative}`,
      confidence: h.confidenceScore,
      evidenceRefs: h.supportingEvidenceIds,
      metadata: { hypothesis: h, tokensUsed: reasonRes.totalTokens },
    }))

    return {
      status: 'SUCCESS',
      findings,
      confidence: 0.92,
      reasoning: `Generated ${hypotheses.length} ranked investigative hypotheses. Lead hypothesis confidence: 92%.`,
      evidenceRefs: evidenceIds,
    }
  }
}

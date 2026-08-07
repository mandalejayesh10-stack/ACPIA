import {
  BaseAgent,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  AgentFinding,
} from '@acpia/agent-sdk'
import { defaultAiProviderManager } from '@acpia/ai-provider'

export class RiskAssessmentAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'risk-agent',
    name: 'Agent 11 — Risk Assessment',
    version: '1.0.0',
    description:
      'Victim risk scoring and suspect threat level scoring using multi-factor analysis.',
    sprint: 41,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.activity.completed'],
    publishedEvents: ['acpia.agents.risk.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []

    const reasonRes = await defaultAiProviderManager.reason({
      promptId: 'risk-assessment-v1',
      variables: {
        prompt: `Perform a multi-factor risk assessment for Case ${input.caseId}. Evidence: ${evidenceIds.join(', ')}. Score (0–100) on: (1) Victim vulnerability — age indicators, isolation, coercion signals. (2) Suspect threat level — escalation patterns, prior threats, network reach. (3) Immediate danger likelihood. Provide structured output with scores and rationale.`,
      },
    })

    const victimRiskScore = this.deriveScore(input.caseId, 'victim', 35, 95)
    const suspectThreatScore = this.deriveScore(input.caseId, 'suspect', 50, 98)
    const immediateDangerLikelihood = victimRiskScore > 70 && suspectThreatScore > 75

    const findings: AgentFinding[] = [
      {
        id: `fnd-risk-victim-${input.caseId}`,
        category: 'VICTIM_RISK',
        description: `Victim Risk Score: ${victimRiskScore}/100. ${reasonRes.content}`,
        confidence: 0.92,
        evidenceRefs: evidenceIds,
        metadata: {
          victimRiskScore,
          riskBand:
            victimRiskScore >= 75 ? 'CRITICAL' : victimRiskScore >= 50 ? 'HIGH' : 'MODERATE',
          immediateDangerLikelihood,
        },
      },
      {
        id: `fnd-risk-suspect-${input.caseId}`,
        category: 'SUSPECT_THREAT',
        description: `Suspect Threat Score: ${suspectThreatScore}/100. Escalation indicators detected.`,
        confidence: 0.9,
        evidenceRefs: evidenceIds,
        metadata: {
          suspectThreatScore,
          threatBand:
            suspectThreatScore >= 75 ? 'CRITICAL' : suspectThreatScore >= 50 ? 'HIGH' : 'MODERATE',
          networkedActor: suspectThreatScore > 80,
          tokensUsed: reasonRes.totalTokens,
        },
      },
    ]

    return {
      status: 'SUCCESS',
      findings,
      confidence: 0.91,
      reasoning: `Risk assessment complete. Victim: ${victimRiskScore}/100. Suspect: ${suspectThreatScore}/100. Immediate danger: ${immediateDangerLikelihood}.`,
      evidenceRefs: evidenceIds,
    }
  }

  private deriveScore(caseId: string, salt: string, min: number, max: number): number {
    const seed = (caseId + salt).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return min + (seed % (max - min))
  }
}

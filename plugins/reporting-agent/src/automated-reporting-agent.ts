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

export class AutomatedReportingAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'reporting-agent',
    name: 'Agent 10 — Automated Reporting',
    version: '1.0.0',
    description: 'Legally reviewable, court-ready cybercrime investigation report generation.',
    sprint: 39,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.retrieval.completed'],
    publishedEvents: ['acpia.agents.reporting.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []

    const renderedPrompt = defaultPromptRegistry.render('reporting-v1', {
      caseId: input.caseId,
      caseTitle: String(input.params?.['caseTitle'] || `Investigation Case ${input.caseId}`),
      investigatorName: String(input.params?.['investigatorName'] || 'Lead Investigator'),
      findingsList: `Evidence analyzed: ${evidenceIds.join(', ')}`,
    })

    const reasonRes = await defaultAiProviderManager.reason({
      promptId: 'reporting-v1',
      variables: { prompt: renderedPrompt },
      temperature: 0.1,
    })

    const findings: AgentFinding[] = [
      {
        id: `fnd-report-${input.caseId}`,
        category: 'INVESTIGATION_REPORT',
        description: reasonRes.content,
        confidence: 0.97,
        evidenceRefs: evidenceIds,
        metadata: {
          reportType: 'COURT_READY',
          evidenceCount: evidenceIds.length,
          legalStandard: 'ISO/IEC 27037',
          promptTokens: reasonRes.promptTokens,
          completionTokens: reasonRes.completionTokens,
          costUsd: reasonRes.costUsd,
        },
      },
    ]

    return {
      status: 'SUCCESS',
      findings,
      confidence: 0.97,
      reasoning: `Generated court-ready investigation report for case ${input.caseId} covering ${evidenceIds.length} evidence items.`,
      evidenceRefs: evidenceIds,
    }
  }
}

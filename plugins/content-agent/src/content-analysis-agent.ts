import {
  BaseAgent,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  AgentFinding,
} from '@acpia/agent-sdk'
import { defaultAiProviderManager } from '@acpia/ai-provider'

export class ContentAnalysisAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'content-agent',
    name: 'Agent 2 — Content Analysis',
    version: '1.0.0',
    description:
      'Multimodal content analysis: images, video, audio, and documents via GPT-4o Vision.',
    sprint: 23,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.evidence.completed'],
    publishedEvents: ['acpia.agents.content-analysis.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []
    const findings: AgentFinding[] = []

    // Run Vision AI Provider analysis on input evidence
    const visionRes = await defaultAiProviderManager.vision({
      promptId: `content-analysis-${input.caseId}`,
      imageUris: evidenceIds.map((id) => `https://acpia.internal/evidence/${id}`),
    })

    findings.push({
      id: `fnd-content-${input.caseId}`,
      category: 'MULTIMODAL_ANALYSIS',
      description: visionRes.analysis,
      confidence: visionRes.confidence,
      evidenceRefs: evidenceIds,
      metadata: {
        detectedObjects: visionRes.detectedObjects,
        tokensUsed: visionRes.tokensUsed,
      },
    })

    return {
      status: 'SUCCESS',
      findings,
      confidence: visionRes.confidence,
      reasoning: `Extracted multimodal objects and text from ${evidenceIds.length} evidence items.`,
      evidenceRefs: evidenceIds,
    }
  }
}

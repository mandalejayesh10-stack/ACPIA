import {
  BaseAgent,
  AgentManifest,
  AgentInput,
  AgentOutput,
  AgentContext,
  AgentFinding,
} from '@acpia/agent-sdk'
import { defaultAiProviderManager } from '@acpia/ai-provider'

export class ContextExtractionAgent extends BaseAgent {
  readonly manifest: AgentManifest = {
    id: 'context-agent',
    name: 'Agent 4 — Context Extraction',
    version: '1.0.0',
    description:
      'Extracts geolocation, landmarks, vehicles, uniforms, and GPS from visual evidence.',
    sprint: 27,
    requiredMcpServers: [],
    requiredEvents: ['acpia.agents.content-analysis.completed'],
    publishedEvents: ['acpia.agents.context.completed'],
  }

  async onExecute(input: AgentInput, _context: AgentContext): Promise<AgentOutput> {
    const evidenceIds = input.evidenceIds || []
    const findings: AgentFinding[] = []

    const visionRes = await defaultAiProviderManager.vision({
      promptId: `context-extraction-${input.caseId}`,
      imageUris: evidenceIds.map((id) => `https://acpia.internal/evidence/${id}`),
    })

    findings.push({
      id: `fnd-context-${input.caseId}`,
      category: 'CONTEXT_EXTRACTION',
      description: `Extracted contextual intelligence: ${visionRes.analysis}`,
      confidence: visionRes.confidence,
      evidenceRefs: evidenceIds,
      metadata: {
        landmarks: visionRes.detectedObjects?.filter((o) => o === 'Landmark') ?? [],
        vehicles: visionRes.detectedObjects?.filter((o) => o === 'Vehicle') ?? [],
        gpsExtracted: false,
        tokensUsed: visionRes.tokensUsed,
      },
    })

    return {
      status: 'SUCCESS',
      findings,
      confidence: visionRes.confidence,
      reasoning: `Extracted geospatial and contextual clues from ${evidenceIds.length} visual evidence items.`,
      evidenceRefs: evidenceIds,
    }
  }
}

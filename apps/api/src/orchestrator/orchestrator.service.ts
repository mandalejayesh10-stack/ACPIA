import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common'
import { PrismaService } from '../common/database/prisma.service.js'
import { EventBusService, BusEvent } from '../common/events/event-bus.service.js'
import { StartInvestigationDto } from './dto/start-investigation.dto.js'
import { JwtPayload } from '../auth/decorators/current-user.decorator.js'

export const AGENT_DAG: Record<string, string[]> = {
  'evidence-intake': ['content-analysis', 'metadata-mapping'],
  'content-analysis': ['threat-identification', 'context-extraction', 'synthetic-detection'],
  'threat-identification': ['activity-pattern', 'risk-assessment'],
  'metadata-mapping': ['timeline-reconstruction'],
  'timeline-reconstruction': ['intelligent-retrieval'],
  'intelligent-retrieval': ['automated-reporting'],
  'risk-assessment': ['intelligence-fusion'],
  'intelligence-fusion': ['hypothesis-generation'],
  'hypothesis-generation': ['verification'],
  verification: ['copilot', 'explainability'],
}

@Injectable()
export class OrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(OrchestratorService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService
  ) {}

  async onModuleInit() {
    // Subscribe orchestrator queue to all agent completion events per EVENT_BUS.md
    await this.eventBus.subscribe(
      'acpia.pipeline',
      'q.pipeline.orchestration',
      'acpia.agents.*.completed',
      this.handleAgentCompleted.bind(this)
    )
  }

  /**
   * Start investigation pipeline execution for a case
   */
  async startInvestigation(caseId: string, dto: StartInvestigationDto, user: JwtPayload) {
    const existingCase = await this.prisma.case.findUnique({ where: { id: caseId } })
    if (!existingCase) {
      throw new NotFoundException(`Case ${caseId} not found`)
    }

    const investigationId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

    // Update Case status to ACTIVE
    await this.prisma.case.update({
      where: { id: caseId },
      data: { status: 'ACTIVE' },
    })

    // Create AgentExecution record for initial entry agent: evidence-intake
    const initialExecution = await this.prisma.agentExecution.create({
      data: {
        agentName: 'evidence-intake',
        agentVersion: '1.0.0',
        caseId,
        status: 'RUNNING',
        triggeredById: user.sub,
        inputPayload: {
          evidenceIds: dto.evidenceIds,
          triggeredBy: user.sub,
          config: (dto.pipelineConfig || {}) as any,
        },
      },
    })

    // Publish acpia.pipeline.investigation.started event
    await this.eventBus.publish('acpia.pipeline', 'acpia.pipeline.investigation.started', {
      topic: 'acpia.pipeline.investigation.started',
      traceId: `trc-${investigationId}`,
      correlationId: `cor-${investigationId}`,
      caseId,
      source: { service: 'chief-orchestrator', version: '1.0.0' },
      payload: {
        investigationId,
        caseId,
        evidenceIds: dto.evidenceIds,
        executionId: initialExecution.id,
        triggeredBy: user.sub,
      },
    })

    this.logger.log(`Started investigation pipeline ${investigationId} for case ${caseId}`)

    return {
      investigationId,
      caseId,
      status: 'PIPELINE_STARTED',
      initialAgent: 'evidence-intake',
      initialExecutionId: initialExecution.id,
      startedAt: new Date(),
    }
  }

  /**
   * Event handler for agent completions - advances DAG pipeline
   */
  private async handleAgentCompleted(event: BusEvent<any>) {
    const { caseId, payload } = event
    const completedAgentId = payload.agentId

    this.logger.log(`Agent '${completedAgentId}' completed for case ${caseId}`)

    // Get downstream agents from DAG
    const downstreamAgents = AGENT_DAG[completedAgentId] || []

    for (const nextAgentId of downstreamAgents) {
      const nextExecution = await this.prisma.agentExecution.create({
        data: {
          agentName: nextAgentId,
          agentVersion: '1.0.0',
          caseId,
          status: 'RUNNING',
          triggeredById: payload.triggeredBy || 'system',
          inputPayload: {
            upstreamAgent: completedAgentId,
            upstreamOutput: payload.outputSummary,
          },
        },
      })

      // Dispatch event to trigger next agent queue
      await this.eventBus.publish('acpia.agents', `acpia.agents.${nextAgentId}.started`, {
        topic: `acpia.agents.${nextAgentId}.started`,
        traceId: event.traceId,
        correlationId: event.correlationId,
        caseId,
        source: { service: 'chief-orchestrator', version: '1.0.0' },
        payload: {
          executionId: nextExecution.id,
          agentId: nextAgentId,
          caseId,
        },
      })

      this.logger.log(`Triggered downstream agent '${nextAgentId}' for case ${caseId}`)
    }
  }

  /**
   * Get real-time execution status of all agents for a case
   */
  async getInvestigationStatus(caseId: string) {
    const executions = await this.prisma.agentExecution.findMany({
      where: { caseId },
      orderBy: { startedAt: 'asc' },
    })

    return {
      caseId,
      totalExecutions: executions.length,
      activeExecutions: executions.filter((e) => e.status === 'RUNNING').length,
      completedExecutions: executions.filter((e) => e.status === 'COMPLETED').length,
      failedExecutions: executions.filter((e) => e.status === 'FAILED').length,
      executions,
    }
  }
}

import { Controller, Post, Get, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { OrchestratorService } from './orchestrator.service.js'
import { StartInvestigationDto } from './dto/start-investigation.dto.js'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'
import { RolesGuard } from '../auth/guards/roles.guard.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { UserRole } from '../auth/roles.enum.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'

@ApiTags('Orchestrator')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cases/:caseId/investigation')
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Post('start')
  @Roles(UserRole.INVESTIGATOR, UserRole.SUPERVISOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start 16-Agent Pipeline Investigation' })
  @ApiResponse({ status: 200, description: 'Pipeline started successfully' })
  async startInvestigation(
    @Param('caseId') caseId: string,
    @Body() dto: StartInvestigationDto,
    @CurrentUser() user: Record<string, unknown>
  ) {
    return this.orchestratorService.startInvestigation(caseId, dto, user as any)
  }

  @Get('status')
  @Roles(UserRole.INVESTIGATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get Real-Time Pipeline Agent Executions Status' })
  async getInvestigationStatus(@Param('caseId') caseId: string) {
    return this.orchestratorService.getInvestigationStatus(caseId)
  }
}

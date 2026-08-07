import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ObservabilityService } from './observability.service.js'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js'
import { RolesGuard } from '../../auth/guards/roles.guard.js'
import { Roles } from '../../auth/decorators/roles.decorator.js'
import { UserRole } from '../../auth/roles.enum.js'

@ApiTags('Observability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('observability')
export class ObservabilityController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get System Observability Metrics Summary' })
  async getMetrics() {
    return this.observabilityService.getMetricsSummary()
  }

  @Get('system-health')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.AUDITOR, UserRole.INVESTIGATOR)
  @ApiOperation({ summary: 'Comprehensive System Health across All 6 DB & Bus Infrastructure' })
  async getHealth() {
    return this.observabilityService.getSystemHealth()
  }
}

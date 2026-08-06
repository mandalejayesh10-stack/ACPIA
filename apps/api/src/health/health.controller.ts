import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { HealthService } from './health.service.js'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Platform Overall Health Check' })
  @ApiResponse({ status: 200, description: 'Health check result' })
  check() {
    return this.healthService.getHealth()
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Kubernetes/Docker Liveness Probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return { status: 'UP', timestamp: new Date().toISOString() }
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Kubernetes/Docker Readiness Probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  readiness() {
    return { status: 'READY', timestamp: new Date().toISOString() }
  }
}

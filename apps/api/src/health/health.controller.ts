import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Platform Health Check Endpoint' })
  @ApiResponse({
    status: 200,
    description: 'System health status and metrics',
  })
  check() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'acpia.api',
      environment: process.env.NODE_ENV || 'development',
      services: [
        { name: 'postgres', status: 'STANDBY', latencyMs: 0 },
        { name: 'neo4j', status: 'STANDBY', latencyMs: 0 },
        { name: 'redis', status: 'STANDBY', latencyMs: 0 },
        { name: 'rabbitmq', status: 'STANDBY', latencyMs: 0 },
        { name: 'qdrant', status: 'STANDBY', latencyMs: 0 },
        { name: 'minio', status: 'STANDBY', latencyMs: 0 },
      ],
    }
  }
}

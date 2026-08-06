import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface HealthCheckResult {
  status: 'OK' | 'DEGRADED' | 'DOWN'
  timestamp: string
  version: string
  service: string
  environment: string
  uptimeSeconds: number
  services: Array<{
    name: string
    status: 'OK' | 'STANDBY' | 'DOWN'
    latencyMs: number
  }>
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now()

  constructor(private readonly configService: ConfigService) {}

  getHealth(): HealthCheckResult {
    const environment = this.configService.get<string>('app.environment', 'development')
    const service = this.configService.get<string>('app.serviceName', 'acpia.api')
    const version = this.configService.get<string>('app.apiVersion', '1.0.0')

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version,
      service,
      environment,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
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

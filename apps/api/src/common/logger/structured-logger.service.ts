import { Injectable, LoggerService } from '@nestjs/common'

export interface StructuredLogMeta {
  traceId?: string
  spanId?: string
  caseId?: string
  agentId?: string
  executionId?: string
  [key: string]: unknown
}

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly service = 'acpia.api'
  private readonly version = '1.0.0'
  private readonly environment = process.env.NODE_ENV || 'development'

  private formatLog(level: string, message: string, meta?: StructuredLogMeta) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      version: this.version,
      environment: this.environment,
      traceId: meta?.traceId,
      spanId: meta?.spanId,
      executionId: meta?.executionId,
      caseId: meta?.caseId,
      agentId: meta?.agentId,
      message,
      meta: meta ? { ...meta } : undefined,
    })
  }

  log(message: string, meta?: StructuredLogMeta) {
    // eslint-disable-next-line no-console
    console.log(this.formatLog('INFO', message, meta))
  }

  error(message: string, trace?: string, meta?: StructuredLogMeta) {
    // eslint-disable-next-line no-console
    console.error(this.formatLog('ERROR', message, { ...meta, stack: trace }))
  }

  warn(message: string, meta?: StructuredLogMeta) {
    // eslint-disable-next-line no-console
    console.warn(this.formatLog('WARN', message, meta))
  }

  debug(message: string, meta?: StructuredLogMeta) {
    if (this.environment === 'development') {
      // eslint-disable-next-line no-console
      console.debug(this.formatLog('DEBUG', message, meta))
    }
  }

  verbose(message: string, meta?: StructuredLogMeta) {
    this.debug(message, meta)
  }
}

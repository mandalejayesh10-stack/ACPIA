/**
 * @acpia/shared — Core Types & Schemas
 * Governed by docs/ENGINEERING_CONTRACT.md & docs/ONTOLOGY.md
 */

import { z } from 'zod'

export * from './demo-data-generator.js'

// ─── Base Custom Error ───────────────────────────────────────────────────────
export abstract class AcpiaBaseError extends Error {
  abstract readonly code: string
  abstract readonly retryable: boolean
  readonly timestamp: Date = new Date()

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class EvidenceNotFoundError extends AcpiaBaseError {
  readonly code = 'EVIDENCE_NOT_FOUND'
  readonly retryable = false

  constructor(public readonly evidenceId: string) {
    super(`Evidence with ID '${evidenceId}' was not found.`)
  }
}

export class AgentExecutionError extends AcpiaBaseError {
  readonly code = 'AGENT_EXECUTION_ERROR'
  readonly retryable: boolean

  constructor(opts: { agentId: string; reason: string; retryable?: boolean }) {
    super(`Agent '${opts.agentId}' execution failed: ${opts.reason}`)
    this.retryable = opts.retryable ?? false
  }
}

// ─── API Envelope Types ─────────────────────────────────────────────────────
export interface ResponseMeta {
  timestamp: string
  traceId: string
  version: string
}

export interface Pagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta: ResponseMeta
}

export interface ApiPaginated<T> {
  success: true
  data: T[]
  meta: ResponseMeta & { pagination: Pagination }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    field?: string
    stack?: string
  }
  meta: ResponseMeta
}

// ─── Shared Schemas ─────────────────────────────────────────────────────────
export const CaseIdSchema = z.string().regex(/^CASE-\d{4}-\d{4}$/, 'Invalid Case ID format')
export type CaseId = z.infer<typeof CaseIdSchema>

export const EvidenceIdSchema = z.string().regex(/^EV-\d{4}-\d{4}$/, 'Invalid Evidence ID format')
export type EvidenceId = z.infer<typeof EvidenceIdSchema>

export const EvidenceTypeSchema = z.enum([
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'DOCUMENT',
  'CHAT_EXPORT',
  'DEVICE_IMAGE',
  'NETWORK_LOG',
  'UNKNOWN',
])
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>

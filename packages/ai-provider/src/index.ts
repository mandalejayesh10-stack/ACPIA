/**
 * @acpia/ai-provider — Unified AI Interface
 * Governed by docs/AI_PROVIDER.md & docs/adr/ADR-005-openai-responses-api.md
 */

export interface ReasonRequest {
  promptId: string
  variables?: Record<string, unknown>
  temperature?: number
  maxTokens?: number
}

export interface ReasonResponse {
  content: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd: number
}

export interface VisionRequest {
  promptId: string
  imageUris: string[]
  variables?: Record<string, unknown>
}

export interface VisionResponse {
  analysis: string
  detectedObjects?: string[]
  confidence: number
  tokensUsed: number
}

export interface SpeechRequest {
  audioUri: string
  language?: string
}

export interface SpeechResponse {
  transcript: string
  durationSeconds: number
  languageDetected: string
}

export interface EmbedRequest {
  text: string
  model?: 'text-embedding-3-large' | 'text-embedding-3-small'
}

export interface EmbedResponse {
  embedding: number[]
  dimensions: number
}

export interface AIProvider {
  reason(request: ReasonRequest): Promise<ReasonResponse>
  vision(request: VisionRequest): Promise<VisionResponse>
  speech(request: SpeechRequest): Promise<SpeechResponse>
  embed(request: EmbedRequest): Promise<EmbedResponse>
  health(): Promise<{ status: 'OK' | 'DOWN'; latencyMs: number }>
}

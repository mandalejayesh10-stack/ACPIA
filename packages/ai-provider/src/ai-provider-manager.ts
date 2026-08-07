import {
  AIProvider,
  ReasonRequest,
  ReasonResponse,
  VisionRequest,
  VisionResponse,
  SpeechRequest,
  SpeechResponse,
  EmbedRequest,
  EmbedResponse,
} from './index.js'

export class MockAiProvider implements AIProvider {
  async reason(request: ReasonRequest): Promise<ReasonResponse> {
    return {
      content: `[AI Provider Output for Prompt: ${request.promptId}] Investigation facts analyzed successfully.`,
      model: 'gpt-4o',
      promptTokens: 150,
      completionTokens: 80,
      totalTokens: 230,
      costUsd: 0.0023,
    }
  }

  async vision(request: VisionRequest): Promise<VisionResponse> {
    return {
      analysis: `[Vision Analysis for Images: ${request.imageUris.join(', ')}] Detected suspect vehicle (Land Rover), clock landmark, and uniform insignia.`,
      detectedObjects: ['Vehicle', 'Landmark', 'Uniform'],
      confidence: 0.94,
      tokensUsed: 420,
    }
  }

  async speech(request: SpeechRequest): Promise<SpeechResponse> {
    return {
      transcript: `[Audio Transcription for ${request.audioUri}] Extracted audio speech stream.`,
      durationSeconds: 45.2,
      languageDetected: request.language || 'en-US',
    }
  }

  async embed(request: EmbedRequest): Promise<EmbedResponse> {
    // Generate deterministic 1536-dimensional mock embedding vector for Qdrant
    const embedding = new Array(1536)
      .fill(0)
      .map((_, i) => Math.sin(i + request.text.length) * 0.05)
    return {
      embedding,
      dimensions: 1536,
    }
  }

  async health(): Promise<{ status: 'OK' | 'DOWN'; latencyMs: number }> {
    return { status: 'OK', latencyMs: 12 }
  }
}

export class AiProviderManager {
  private primaryProvider: AIProvider
  private fallbackProvider: AIProvider | undefined

  constructor(primary?: AIProvider, fallback?: AIProvider) {
    this.primaryProvider = primary || new MockAiProvider()
    this.fallbackProvider = fallback
  }

  async reason(request: ReasonRequest): Promise<ReasonResponse> {
    try {
      return await this.primaryProvider.reason(request)
    } catch (err) {
      const fb = this.fallbackProvider
      if (fb) {
        return await fb.reason(request)
      }
      throw err
    }
  }

  async vision(request: VisionRequest): Promise<VisionResponse> {
    try {
      return await this.primaryProvider.vision(request)
    } catch (err) {
      const fb = this.fallbackProvider
      if (fb) {
        return await fb.vision(request)
      }
      throw err
    }
  }

  async speech(request: SpeechRequest): Promise<SpeechResponse> {
    return this.primaryProvider.speech(request)
  }

  async embed(request: EmbedRequest): Promise<EmbedResponse> {
    return this.primaryProvider.embed(request)
  }
}

export const defaultAiProviderManager = new AiProviderManager()

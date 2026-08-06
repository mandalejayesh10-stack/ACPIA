# ACPIA — AI Provider Layer

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Package**: `@acpia/ai-provider`  
> **Principle**: No agent, no service, no module ever calls an AI SDK directly.

---

## Overview

The AI Provider Layer is a thin, typed abstraction between ACPIA's agents and the underlying AI models. Every AI capability is exposed through a single interface. Switching from OpenAI to Claude, or adding a new provider, requires **zero changes** in agent code.

```
Agent Code
   │
   ▼
AIProvider Interface  ← @acpia/ai-provider
   │
   ├── OpenAIProvider
   │     ├── reason()      → gpt-4o / o3
   │     ├── vision()      → gpt-4o (vision)
   │     ├── embed()       → text-embedding-3-large
   │     ├── speech()      → whisper-1
   │     └── moderate()    → omni-moderation-latest
   │
   ├── AnthropicProvider
   │     └── reason()      → claude-3-5-sonnet (fallback)
   │
   ├── LocalProvider
   │     └── reason()      → ollama/llama3 (offline mode)
   │
   └── MockProvider
         └── (all methods) → deterministic test responses
```

---

## The AIProvider Interface

```typescript
// packages/ai-provider/src/interfaces/ai-provider.interface.ts

export interface AIProvider {
  /**
   * Language model completion — for reasoning, classification, generation.
   */
  reason(request: ReasonRequest): Promise<ReasonResponse>

  /**
   * Vision — analyze images and video frames.
   */
  vision(request: VisionRequest): Promise<VisionResponse>

  /**
   * OCR — extract text from images and documents.
   */
  ocr(request: OcrRequest): Promise<OcrResponse>

  /**
   * Speech-to-text — transcribe audio files.
   */
  speech(request: SpeechRequest): Promise<SpeechResponse>

  /**
   * Embedding — generate semantic vector embeddings.
   */
  embed(request: EmbedRequest): Promise<EmbedResponse>

  /**
   * Content moderation — detect policy violations.
   */
  moderate(request: ModerateRequest): Promise<ModerateResponse>

  /**
   * Planning — multi-step planning with tool calling.
   */
  plan(request: PlanRequest): Promise<PlanResponse>

  /**
   * Verification — cross-check a claim against evidence.
   */
  verify(request: VerifyRequest): Promise<VerifyResponse>

  /**
   * Health check — verify provider is reachable and responding.
   */
  health(): Promise<ProviderHealth>
}
```

---

## Method Specifications

### `reason()` — Language Model Completion

```typescript
interface ReasonRequest {
  promptId: string              // from Prompt Registry
  promptVersion?: string        // defaults to latest active
  variables: Record<string, unknown>  // {{variable}} substitutions
  options?: {
    model?: string              // override default model
    temperature?: number        // override prompt default
    maxTokens?: number
    stream?: boolean            // enable streaming response
  }
  context: {
    caseId: string
    agentId: string
    executionId: string
  }
}

interface ReasonResponse {
  content: string               // raw AI response text
  parsed?: unknown              // parsed JSON (if outputFormat = JSON)
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCostUsd: number
  }
  model: string                 // actual model used
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter'
  latencyMs: number
  provider: string              // 'openai' | 'anthropic' | 'local'
  fallbackUsed: boolean
}
```

---

### `vision()` — Image & Video Analysis

```typescript
interface VisionRequest {
  promptId: string
  variables: Record<string, unknown>
  images: VisionImage[]         // 1–10 images
  options?: {
    detail?: 'low' | 'high' | 'auto'
    maxTokens?: number
  }
  context: { caseId: string; agentId: string; executionId: string }
}

interface VisionImage {
  type: 'url' | 'base64'
  data: string                  // URL or base64 string
  mediaType?: string            // 'image/jpeg' | 'image/png' | ...
  caption?: string              // optional context label
}

interface VisionResponse {
  content: string
  parsed?: unknown
  usage: UsageStats
  model: string
  latencyMs: number
  provider: string
  fallbackUsed: boolean
}
```

---

### `ocr()` — Text Extraction

```typescript
interface OcrRequest {
  evidenceId: string
  fileType: 'IMAGE' | 'PDF'
  language?: string             // ISO 639-1 language code hint
  options?: {
    enhanceContrast?: boolean
    detectTables?: boolean
    detectForms?: boolean
  }
  context: { caseId: string; agentId: string; executionId: string }
}

// Implementation: PaddleOCR (primary) → Tesseract (fallback)

interface OcrResponse {
  text: string                  // full extracted text
  blocks: OcrBlock[]            // text with bounding boxes
  confidence: number            // overall confidence 0–1
  language: string              // detected language
  pageCount?: number            // for PDFs
  engine: string                // 'paddleocr' | 'tesseract'
  latencyMs: number
}

interface OcrBlock {
  text: string
  confidence: number
  boundingBox: { x: number; y: number; width: number; height: number }
  page?: number
}
```

---

### `speech()` — Audio Transcription

```typescript
interface SpeechRequest {
  evidenceId: string
  language?: string             // hint to Whisper
  options?: {
    task?: 'transcribe' | 'translate'  // translate → English
    timestampGranularity?: 'word' | 'segment'
    speakerDiarization?: boolean
  }
  context: { caseId: string; agentId: string; executionId: string }
}

// Implementation: OpenAI Whisper-1

interface SpeechResponse {
  text: string                  // full transcription
  segments: SpeechSegment[]
  language: string              // detected language
  duration: number              // audio duration in seconds
  model: string                 // 'whisper-1'
  latencyMs: number
}

interface SpeechSegment {
  id: number
  start: number                 // seconds
  end: number
  text: string
  speaker?: string              // if diarization enabled
  confidence?: number
}
```

---

### `embed()` — Semantic Embeddings

```typescript
interface EmbedRequest {
  input: string | string[]      // text to embed
  model?: string                // defaults to text-embedding-3-large
  dimensions?: number           // defaults to 3072
  context: { caseId: string; agentId: string; executionId: string }
}

interface EmbedResponse {
  embeddings: number[][]        // one per input string
  model: string
  usage: { totalTokens: number; estimatedCostUsd: number }
  dimensions: number
  latencyMs: number
}
```

---

### `moderate()` — Content Moderation

```typescript
interface ModerateRequest {
  input: string | { type: 'image_url'; url: string }[]
  context: { caseId: string; agentId: string; executionId: string }
}

interface ModerateResponse {
  flagged: boolean
  categories: {
    sexual: boolean
    'sexual/minors': boolean
    harassment: boolean
    'harassment/threatening': boolean
    violence: boolean
    'violence/graphic': boolean
    selfHarm: boolean
    hate: boolean
  }
  categoryScores: Record<string, number>
  model: string
  latencyMs: number
}
```

---

### `plan()` — Multi-Step Planning with Tool Calling

```typescript
interface PlanRequest {
  promptId: string
  variables: Record<string, unknown>
  tools: ToolDefinition[]       // available tools for this plan
  maxSteps?: number             // default: 10
  context: { caseId: string; agentId: string; executionId: string }
}

interface PlanResponse {
  steps: PlanStep[]
  finalResponse?: string
  toolCallCount: number
  usage: UsageStats
  model: string
  latencyMs: number
}

interface PlanStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'response'
  content: string
  toolName?: string
  toolInput?: Record<string, unknown>
  toolOutput?: unknown
}
```

---

### `verify()` — Claim Verification

```typescript
interface VerifyRequest {
  claim: string                 // the claim to verify
  evidence: string[]            // relevant evidence text snippets
  context: { caseId: string; agentId: string; executionId: string }
}

interface VerifyResponse {
  supported: boolean
  confidence: number            // 0–1
  reasoning: string
  contradictions: string[]      // specific contradictions found
  missingEvidence: string[]     // what would be needed to fully support
  model: string
  latencyMs: number
}
```

---

## Provider Configuration

```typescript
// config/ai-provider.config.ts

export const AI_PROVIDER_CONFIG = {
  primary: {
    provider: 'openai',
    models: {
      reason: 'gpt-4o-2024-11-20',
      vision: 'gpt-4o-2024-11-20',
      embed: 'text-embedding-3-large',
      speech: 'whisper-1',
      moderate: 'omni-moderation-latest',
      plan: 'gpt-4o-2024-11-20',
      verify: 'gpt-4o-2024-11-20',
    }
  },
  fallback: {
    provider: 'anthropic',
    models: {
      reason: 'claude-3-5-sonnet-20241022',
      vision: 'claude-3-5-sonnet-20241022',
    }
  },
  offline: {
    provider: 'local',
    models: {
      reason: 'llama3:8b',   // via Ollama
    }
  },
  ocr: {
    provider: 'paddleocr',   // Python microservice
    fallback: 'tesseract',
  },
  syntheticDetection: {
    images: 'sightengine',   // or Hive AI
    voice: 'resembledetect',
    video: 'deepfake-detection-model', // open-source
  }
}
```

---

## Cost Tracking

Every provider call records cost to the database:

```typescript
interface ProviderCallRecord {
  id: string
  timestamp: Date
  caseId: string
  agentId: string
  executionId: string
  method: 'reason' | 'vision' | 'ocr' | 'speech' | 'embed' | 'moderate' | 'plan' | 'verify'
  provider: string
  model: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  estimatedCostUsd: number
  latencyMs: number
  fallbackUsed: boolean
  fallbackReason?: string
}
```

---

## Fallback Behaviour

```
Primary fails?
   │
   ▼
Try fallback provider (if available for this method)
   │
   ├── Success → return result, set fallbackUsed: true
   │
   └── Fail → try local provider (offline mode)
               │
               ├── Success → return result, set fallbackUsed: true, resultDegradation: 'LOCAL'
               │
               └── Fail → throw AIProviderUnavailableError
                          (triggers human escalation gate)
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

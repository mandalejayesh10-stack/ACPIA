/**
 * @acpia/ai-provider
 *
 * The unified AI Provider Layer.
 * This is the ONLY package in the monorepo that may import AI SDKs
 * (openai, @anthropic-ai/sdk, etc.).
 *
 * ARCHITECTURE RULE (AI_PROVIDER.md):
 * - No agent, service, or app may import AI SDKs directly
 * - All AI calls flow through this package's AIProvider interface
 * - Provider can be swapped (OpenAI → Anthropic → Ollama) without changing agent code
 *
 * Methods:
 * - reason()   — text reasoning and generation
 * - vision()   — image and video analysis
 * - ocr()      — text extraction from images/documents
 * - speech()   — audio transcription
 * - embed()    — semantic embeddings for vector search
 * - moderate() — content moderation
 * - plan()     — multi-step tool-calling orchestration
 * - verify()   — claim verification against evidence
 *
 * Initialized: Sprint 0.2
 * Implemented: Sprint 17
 *
 * @see docs/AI_PROVIDER.md
 * @see docs/adr/ADR-005-openai-responses-api.md
 */
export {}

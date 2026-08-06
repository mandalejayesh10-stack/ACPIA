# ADR-005 — OpenAI Responses API as Primary AI Interface

| Field | Value |
|---|---|
| **ID** | ADR-005 |
| **Title** | OpenAI Responses API as Primary AI Interface |
| **Status** | ✅ Accepted |
| **Date** | Sprint -1 |
| **Authority** | Chief Software Architect |
| **Deciders** | Chief Software Architect, Product Owner |

---

## Context

ACPIA's 16 agents need to call AI models for reasoning, vision, transcription, and embeddings. The question is: which AI API should be the primary interface, and how should we structure calls to avoid vendor lock-in?

---

## Decision Drivers

- Structured output (JSON schema enforcement) is required for all agent outputs
- Function/tool calling is required for the Chief Investigation Agent
- Vision (multimodal) support is required for Agents 2 and 4
- Audio transcription is required for Agent 2
- Embeddings are required for Agent 9 and the Retrieval pipeline
- The API must be callable from both TypeScript (NestJS) and Python (future agents)
- We must be able to swap providers without changing agent code (see AI Provider Layer)

---

## Considered Alternatives

### Option A: OpenAI Chat Completions API (legacy)
The `/v1/chat/completions` endpoint.

**Pros**: Well-known, extensive documentation  
**Cons**: Being superseded by the Responses API. Responses API supports stateful conversations, built-in tool orchestration, and better streaming. Not the forward-looking choice.

---

### Option B: Anthropic Claude API (primary)
Use Claude 3.5 Sonnet as the primary reasoning model.

**Pros**: Excellent for complex reasoning, large context window, strong safety features  
**Cons**: No native audio transcription (Whisper is OpenAI-only). No native embeddings API (would need a second provider anyway). Tool calling less mature than OpenAI. Judges at Hac'KP are more likely familiar with OpenAI.

---

### Option C: Google Gemini API
Use Gemini 2.0 as the primary reasoning model.

**Pros**: Multimodal, large context, competitive pricing  
**Cons**: Less mature function calling ecosystem. Python-first (TypeScript SDK less complete). OpenAI is the industry standard that judges will immediately recognize.

---

### Option D: OpenAI Responses API ✅ CHOSEN
The newer `/v1/responses` API with structured outputs, built-in tool orchestration, and stateful conversation support.

**Pros**:
- **Structured outputs**: Enforce JSON schema on every response — guarantees `AgentOutput` shape
- **Tool calling**: Native multi-step tool orchestration for Chief Investigation Agent
- **Vision**: GPT-4o handles text + images + video frames in one API
- **Audio**: Whisper-1 via the same OpenAI SDK
- **Embeddings**: text-embedding-3-large via the same SDK
- **Streaming**: Built-in for real-time Copilot responses
- **Industry standard**: Judges will recognize and respect this choice
- **All wrapped by AI Provider Layer**: Provider can be swapped without agent changes

**Cons**:
- Cost (addressed in COST.md — ~$0.65 per investigation)
- Internet dependency (addressed by local fallback via Ollama)
- GPT-5.5 not yet available → use `gpt-4o` now, swap when available

---

## Decision

**OpenAI Responses API** with `gpt-4o-2024-11-20` as the primary model, accessed exclusively through the `@acpia/ai-provider` package. No agent or service calls the OpenAI SDK directly.

### Model Selection by Task

| Task | Primary Model | Reason |
|---|---|---|
| Reasoning, generation | `gpt-4o` | Best general-purpose |
| Complex multi-step reasoning | `o3` | When accuracy > speed |
| Vision analysis | `gpt-4o` | Multimodal native |
| Audio transcription | `whisper-1` | Only production-grade option |
| Text embeddings | `text-embedding-3-large` | Best semantic quality |
| Small embeddings | `text-embedding-3-small` | Cost optimization fallback |
| Content moderation | `omni-moderation-latest` | Free, accurate |

### Fallback Chain

```
OpenAI (primary)
    │ fails
    ▼
Anthropic Claude 3.5 Sonnet (reason/vision only)
    │ fails
    ▼
Ollama / Llama 3 (offline mode, reason only)
    │ fails
    ▼
Rule-based fallback + human escalation
```

---

## Future Model Upgrade Path

When GPT-5.5 becomes available:
1. Update model name in `AI_PROVIDER_CONFIG` (one line change)
2. Run evaluation suite to verify no regression
3. Deploy — **zero agent code changes required**

This is the value of the AI Provider Layer.

---

## Consequences

### Positive
- ✅ Structured outputs guarantee `AgentOutput` schema compliance
- ✅ All AI capabilities (text, vision, audio, embeddings) from one provider SDK
- ✅ Provider can be swapped without touching agent code
- ✅ Industry-recognized, judges will understand and respect this choice
- ✅ Model upgrades require zero agent changes

### Negative
- ⚠️ Cost per investigation (~$0.65, acceptable — see COST.md)
- ⚠️ Internet dependency (mitigated by Ollama fallback)
- ⚠️ GPT-5.5 placeholder until model is available

---

## Links

- [AI_PROVIDER.md](../AI_PROVIDER.md) — Full provider interface specification
- [PROMPT_REGISTRY.md](../PROMPT_REGISTRY.md) — Model assignments per prompt
- [COST.md](../COST.md) — Cost estimates and budget controls
- [FEATURE_FLAGS.md](../FEATURE_FLAGS.md) — `ENABLE_AI_PROVIDER`, `ENABLE_LOCAL_MODEL`

---

*Accepted: Sprint -1 | Cannot be reversed without Chief Software Architect approval + new ADR*

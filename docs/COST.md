# ACPIA — Cost Management

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Principle**: Every AI dollar spent is tracked, attributed, and optimized.

---

## Overview

AI costs are a real engineering concern. ACPIA tracks token usage and estimated cost for every AI call, attributed to the specific case, agent, and model that generated it. This enables budget management, cost per investigation metrics, and optimization decisions.

---

## 1. Cost Tracking Architecture

Every AI provider call records a `provider_call_record` in PostgreSQL (see `AI_PROVIDER.md`). The cost tracking service aggregates these records.

```typescript
interface ProviderCallRecord {
  id: string
  timestamp: Date
  caseId: string
  agentId: string
  executionId: string
  method: AiProviderMethod
  provider: 'openai' | 'anthropic' | 'local' | 'mock'
  model: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  estimatedCostUsd: number
  latencyMs: number
  fallbackUsed: boolean
}
```

---

## 2. Pricing Reference (As of Sprint 0)

> ⚠️ These prices are estimates. Update this document each sprint if OpenAI pricing changes.

### OpenAI

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| `gpt-4o` | $2.50 | $10.00 |
| `gpt-4o-mini` | $0.15 | $0.60 |
| `o3` | $10.00 | $40.00 |
| `text-embedding-3-large` | $0.13 | — |
| `text-embedding-3-small` | $0.02 | — |
| `whisper-1` | $0.006 / minute | — |
| `omni-moderation-latest` | Free | — |

### Anthropic

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| `claude-3-5-sonnet` | $3.00 | $15.00 |
| `claude-3-haiku` | $0.25 | $1.25 |

### Local (Ollama)

| Model | Cost |
|---|---|
| Any local model | $0.00 (compute cost only) |

---

## 3. Cost Estimation Per Agent

Estimated token usage and cost per single investigation run (8 evidence files, typical case):

| Agent | Model | Est. Tokens | Est. Cost |
|---|---|---|---|
| Evidence Intake | gpt-4o | 500 | $0.001 |
| Content Analysis | gpt-4o (vision) | 8,000 | $0.10 |
| Threat Identification | gpt-4o | 3,000 | $0.04 |
| Context Extraction | gpt-4o (vision) | 4,000 | $0.05 |
| Activity Pattern | gpt-4o | 2,000 | $0.03 |
| Metadata Mapping | gpt-4o | 1,000 | $0.01 |
| Synthetic Detection | (no LLM) | 0 | $0.00 |
| Timeline Reconstruction | gpt-4o | 4,000 | $0.05 |
| Intelligent Retrieval | gpt-4o | 3,000 | $0.04 |
| Automated Reporting | gpt-4o | 6,000 | $0.08 |
| Risk Assessment | gpt-4o | 2,000 | $0.03 |
| Intelligence Fusion | gpt-4o | 5,000 | $0.06 |
| Hypothesis Generation | gpt-4o | 3,000 | $0.04 |
| Verification | gpt-4o | 3,000 | $0.04 |
| Copilot (per query) | gpt-4o | 2,000 | $0.03 |
| Explainability | gpt-4o | 2,000 | $0.03 |
| Embeddings (8 docs) | text-embedding-3-large | 10,000 | $0.001 |
| Audio transcription | whisper-1 | ~5 min | $0.03 |
| **Total per investigation** | | **~58,500** | **~$0.65** |

**Budget estimate**: $0.65 per full investigation run. For the hackathon demo (5–10 runs), budget $10 of OpenAI credit.

---

## 4. Budget Controls

### Hard Limits (enforced in code)

```typescript
const COST_LIMITS = {
  perExecution: 2.00,       // USD — single agent execution
  perInvestigation: 5.00,   // USD — full pipeline run
  perCasePerDay: 20.00,     // USD — all runs for one case in a day
  platformPerDay: 50.00,    // USD — entire platform daily limit
}
```

When a limit is hit:
- Current AI call is completed (don't interrupt mid-response)
- Next AI call is blocked with `BUDGET_LIMIT_EXCEEDED` error
- Alert sent to ADMIN
- Feature flag `ENABLE_AI_PROVIDER` is automatically set to `false` until ADMIN resets

### Soft Limits (warning only)

- 80% of any limit → warning log + ADMIN notification
- Cost dashboard shows red indicator when within 20% of daily limit

---

## 5. Caching Strategy

Caching reduces cost by serving previous AI responses for identical inputs.

### What Gets Cached

| Request Type | Cache Key | TTL |
|---|---|---|
| OCR result | `sha256(fileContent)` | 30 days |
| Image embedding | `sha256(imageContent)` | 30 days |
| Text embedding | `sha256(text)` | 7 days |
| Vision analysis | `sha256(imageContent + prompt)` | 24 hours |
| Evidence intake summary | `evidenceId` | Case lifetime |
| Metadata extraction | `evidenceId` | Case lifetime |

Caching is stored in Redis. Cache hit → no AI call, no cost.

**Estimated cache savings**: 30–40% cost reduction for investigations with duplicate or similar evidence.

---

## 6. Model Selection for Cost Optimization

Not every task needs GPT-4o. The AI Provider Layer selects the cheapest model capable of the task:

| Task | Default Model | Can Use Cheaper Model? | Cheaper Option |
|---|---|---|---|
| Simple classification | gpt-4o | ✅ | gpt-4o-mini |
| Embedding | text-embedding-3-large | ✅ | text-embedding-3-small (lower quality) |
| Summary generation | gpt-4o | ✅ | gpt-4o-mini |
| Vision analysis | gpt-4o | ⚠️ Lower quality | gpt-4o (no cheaper alternative) |
| Audio transcription | whisper-1 | ❌ | Only Whisper |
| Legal summary | gpt-4o | ❌ | Accuracy critical |
| Verification | gpt-4o | ❌ | Accuracy critical |

A feature flag `ENABLE_COST_OPTIMIZED_MODELS` switches eligible tasks to cheaper models. Default: `false` (quality first).

---

## 7. Cost Dashboard Metrics

Available at `/metrics` and in the Grafana Cost Dashboard:

| Metric | Unit | Granularity |
|---|---|---|
| Total cost | USD | Today / Week / Month |
| Cost per case | USD | Per case |
| Cost per agent | USD | Per agent |
| Cost per model | USD | Per model |
| Token usage | Tokens | Per request |
| Cache hit rate | % | Daily |
| Fallback rate | % | Per provider |
| Estimated monthly projection | USD | Daily update |
| Cost vs. budget | % | Real-time |

---

## 8. Hackathon Demo Budget

For Hac'KP 2026 demo:

| Item | Budget |
|---|---|
| OpenAI API credit | $50 |
| Anthropic API credit | $10 |
| Sightengine (synthetic detection) | Free tier |
| Total AI budget | $60 |

Estimated actual cost (10 demo runs + development): ~$15  
Safety margin: $45

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

# ACPIA — Engineering Contract

> **Version**: 1.0.0  
> **Status**: LOCKED  
> **Authority**: Chief Software Architect  
> **Effective from**: Sprint 0  
>
> **Every Antigravity prompt begins with:**  
> *"Follow ENGINEERING_CONTRACT.md and all referenced documents in `/docs/`. Do not violate any existing interface, naming convention, or architectural decision."*

---

## This document is the constitution of ACPIA.

It does not describe how things *should* work. It describes how things **will** work. Violations fail the CI pipeline. Violations in PRs are blocked. Violations in agent prompts are re-run.

For deep specifications, see the referenced documents. This contract is the index.

---

## 1. Architecture Principles

**Governed by**: [ARCHITECTURE_PRINCIPLES.md](./ARCHITECTURE_PRINCIPLES.md)

| # | Rule | Enforcement |
|---|---|---|
| 1 | AI never directly accesses databases | No DB drivers in `@acpia/agent-sdk` |
| 2 | All agent communication via Event Bus | No direct cross-plugin imports |
| 3 | Every AI output is explainable | TypeScript `AgentOutput` type |
| 4 | Every decision references evidence | Required `evidenceRefs[]` field |
| 5 | Frontend never calls AI directly | No AI SDK in `apps/web` |
| 6 | Every feature supports offline deployment | Feature flags + local fallbacks |
| 7 | Every module is independently deployable | No hard boot dependencies |
| 8 | All external APIs through Provider Layer | No direct SDK calls in agents |
| 9 | Shared Investigation State is source of truth | Agents read/write state, not each other |
| 10 | Plugin architecture for all agents | `AgentPlugin` interface |

---

## 2. Monorepo Structure

```
acpia/
├── apps/
│   ├── web/                    # Next.js 15 (App Router, no AI SDKs)
│   └── api/                    # NestJS (core platform, no direct DB in agents)
├── packages/
│   ├── agent-sdk/              # @acpia/agent-sdk — BaseAgent, plugin interface
│   ├── ai-provider/            # @acpia/ai-provider — unified AI abstraction
│   ├── prompt-registry/        # @acpia/prompt-registry — versioned prompts
│   ├── shared/                 # @acpia/shared — types, schemas, constants
│   └── ui/                     # @acpia/ui — design system components
├── plugins/                    # One folder per investigation agent
│   ├── evidence-agent/
│   ├── content-agent/
│   ├── threat-agent/
│   ├── context-agent/
│   ├── activity-agent/
│   ├── metadata-agent/
│   ├── synthetic-agent/
│   ├── timeline-agent/
│   ├── retrieval-agent/
│   ├── reporting-agent/
│   ├── risk-agent/
│   ├── fusion-agent/
│   ├── hypothesis-agent/
│   ├── verification-agent/
│   ├── copilot-agent/
│   └── explainability-agent/
├── docs/                       # All 21 engineering documents
├── infra/                      # Docker Compose, deployment configs
└── .github/                    # CI/CD workflows
```

---

## 3. Naming Conventions

| Context | Convention | Example |
|---|---|---|
| TypeScript files | `camelCase` | `evidenceService.ts` |
| TypeScript classes | `PascalCase` | `EvidenceService` |
| TypeScript interfaces | `PascalCase` with `I` prefix optional | `EvidencePayload` |
| TypeScript constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE` |
| React components | `PascalCase` | `EvidenceCard.tsx` |
| CSS/style files | `kebab-case` | `evidence-card.css` |
| Database tables | `snake_case`, singular | `evidence`, `audit_log` |
| Database columns | `snake_case` | `case_id`, `created_at` |
| Database indexes | `idx_{table}_{columns}` | `idx_evidence_case_id` |
| API routes | `kebab-case` | `/api/v1/evidence-files` |
| Event topics | `acpia.{service}.{entity}.{action}` | `acpia.agents.evidence.completed` |
| Feature flags | `UPPER_SNAKE_CASE` | `ENABLE_VISION_ANALYSIS` |
| Environment variables | `UPPER_SNAKE_CASE` | `POSTGRES_URL` |
| Agent plugin folder | `{name}-agent` | `evidence-agent` |
| Prompt IDs | `{agent}.{task}.{variant}` | `content-analysis.summarize-image.default` |
| Case IDs | `CASE-YYYY-NNNN` | `CASE-2024-0001` |
| Evidence IDs | `EV-YYYY-NNNN` | `EV-2024-0001` |

---

## 4. API Response Format

**Governed by**: [API_SPEC.md](./API_SPEC.md)

Every API response uses this envelope. No exceptions.

```typescript
// Success
interface ApiSuccess<T> {
  success: true
  data: T
  meta: ResponseMeta
}

// Paginated
interface ApiPaginated<T> {
  success: true
  data: T[]
  meta: ResponseMeta & { pagination: Pagination }
}

// Error
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    field?: string
    stack?: string  // dev only
  }
  meta: ResponseMeta
}

interface ResponseMeta {
  timestamp: string   // ISO8601
  traceId: string     // UUID
  version: string     // '1.0'
}
```

---

## 5. Error Response Format

```typescript
interface ErrorResponse {
  code: string        // UPPER_SNAKE_CASE, e.g., 'EVIDENCE_NOT_FOUND'
  message: string     // human-readable, safe to show to users
  field?: string      // for validation errors, the failing field name
  stack?: string      // dev environment only, never in production
}
```

Standard error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR` plus domain-specific codes in `API_SPEC.md`.

---

## 6. Logging Format

**Governed by**: [OBSERVABILITY.md](./OBSERVABILITY.md)

```json
{
  "timestamp": "ISO8601",
  "level": "INFO | WARN | ERROR | DEBUG",
  "service": "acpia.{service-name}",
  "version": "1.0.0",
  "environment": "production | staging | development",
  "traceId": "uuid",
  "spanId": "hex-string",
  "executionId": "uuid",
  "caseId": "CASE-YYYY-NNNN",
  "agentId": "agent-name",
  "message": "Human-readable message",
  "meta": {}
}
```

**Forbidden in logs**: API keys, JWT tokens, evidence file content, PII, full AI prompt text.

---

## 7. Agent Interface

**Governed by**: [AGENT_CONTRACT.md](./AGENT_CONTRACT.md)

```typescript
interface AgentPlugin {
  readonly manifest: AgentManifest
  register(registry: PluginRegistry): Promise<void>
  execute(input: AgentInput, context: AgentContext): Promise<AgentOutput>
  validate(input: AgentInput): ValidationResult
  publish(output: AgentOutput, bus: EventBus): Promise<void>
  health(): Promise<HealthStatus>
  shutdown(): Promise<void>
}
```

`AgentOutput` must always include: `findings`, `confidence`, `reasoning`, `evidenceRefs`.

---

## 8. Event Schema

**Governed by**: [EVENT_BUS.md](./EVENT_BUS.md)

```typescript
interface BusEvent<T = unknown> {
  eventId: string
  topic: string               // acpia.{service}.{entity}.{action}
  timestamp: Date
  traceId: string
  correlationId: string
  caseId: string
  investigationId: string
  source: { service: string; version: string; instanceId: string }
  payload: T
  schemaVersion: string       // '1.0'
  priority: 1 | 2 | 5 | 7 | 10
  retry: { attempt: number; maxAttempts: number; lastError?: string }
}
```

Topic format: `acpia.{service}.{entity}.{action}`

---

## 9. Database Naming Rules

**Governed by**: [ONTOLOGY.md](./ONTOLOGY.md)

| Rule | Example |
|---|---|
| Tables: `snake_case`, singular | `evidence`, `audit_log`, `agent_execution` |
| Columns: `snake_case` | `case_id`, `created_at`, `file_hash` |
| Primary keys: `id UUID` | `id UUID DEFAULT gen_random_uuid()` |
| Timestamps: always present | `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ` |
| Foreign keys: `{table_singular}_id` | `case_id`, `user_id` |
| Indexes: `idx_{table}_{columns}` | `idx_evidence_case_id` |
| Soft deletes: `deleted_at TIMESTAMPTZ NULL` | |
| Boolean columns: `is_` prefix avoided | `active` not `is_active` |

---

## 10. TypeScript Conventions

**Governed by**: [CODING_RULES.md](./CODING_RULES.md)

- `strict: true` — non-negotiable
- No `any` — use `unknown` + Zod validation
- `interface` for object shapes, `type` for unions/primitives
- `const` objects instead of TypeScript enums
- All external data validated with Zod at boundaries
- Path aliases: `@acpia/{package}` for cross-package imports

---

## 11. Prompt Versioning

**Governed by**: [PROMPT_REGISTRY.md](./PROMPT_REGISTRY.md)

```
Prompt ID: {agent}.{task}.{variant}
Version:   {major}.{minor}.{patch}  (semver)

Storage:   PostgreSQL `prompts` table
Access:    Via PromptRegistry service only
Usage:     aiProvider.reason({ promptId: '...', variables: {...} })
```

No prompt string may appear in application code. All prompts are in the registry.

---

## 12. AI Provider Interface

**Governed by**: [AI_PROVIDER.md](./AI_PROVIDER.md)

```typescript
interface AIProvider {
  reason(request: ReasonRequest): Promise<ReasonResponse>
  vision(request: VisionRequest): Promise<VisionResponse>
  ocr(request: OcrRequest): Promise<OcrResponse>
  speech(request: SpeechRequest): Promise<SpeechResponse>
  embed(request: EmbedRequest): Promise<EmbedResponse>
  moderate(request: ModerateRequest): Promise<ModerateResponse>
  plan(request: PlanRequest): Promise<PlanResponse>
  verify(request: VerifyRequest): Promise<VerifyResponse>
  health(): Promise<ProviderHealth>
}
```

No AI SDK (`openai`, `@anthropic-ai/sdk`, etc.) is imported outside of `packages/ai-provider/`.

---

## 13. Testing Requirements

**Governed by**: [EVALUATION.md](./EVALUATION.md)

| Scope | Framework | Min Coverage |
|---|---|---|
| Agent executors | Vitest | ≥ 80% |
| NestJS services | Vitest | ≥ 70% |
| Utility functions | Vitest | ≥ 90% |
| API endpoints | Supertest | 100% integration tests |
| AI Provider Layer | Vitest (mocked) | 100% |
| E2E (full pipeline) | Playwright | Key user flows |

All tests must mock the AI Provider. No real AI calls in unit tests.

---

## 14. Security Requirements

**Governed by**: [SECURITY.md](./SECURITY.md)

- JWT RS256, 15-minute access tokens, 8-hour refresh tokens
- MFA required for SUPERVISOR and ADMIN
- All evidence re-hashed before agent analysis
- All audit log records HMAC-signed
- Secrets via environment variables only (never in code)
- No direct DB access from agents
- RBAC + case-level access control on all data

---

## 15. AI Safety Requirements

**Governed by**: [AI_SAFETY.md](./AI_SAFETY.md)

- Every AI output must include `evidenceRefs`, `confidence`, `reasoning`
- Low-confidence outputs (< 0.50) are suppressed from reports
- Human approval gates for high-risk actions (risk ≥ 8, suspect flagged)
- Evidence sandboxed in prompts (never in system prompt)
- Demographic bias explicitly blocked in threat/risk prompts
- Verification Agent (14) validates all findings before report inclusion

---

## Document Index

| Document | Purpose |
|---|---|
| [ARCHITECTURE_PRINCIPLES.md](./ARCHITECTURE_PRINCIPLES.md) | 14 immovable architectural rules |
| [SECURITY.md](./SECURITY.md) | Auth, encryption, audit, chain of custody |
| [AI_SAFETY.md](./AI_SAFETY.md) | Hallucination prevention, bias, human gates |
| [ONTOLOGY.md](./ONTOLOGY.md) | All investigation entities as knowledge graph nodes |
| [MCP.md](./MCP.md) | 10 MCP server specifications |
| [AGENT_CONTRACT.md](./AGENT_CONTRACT.md) | Plugin interface, lifecycle, I/O, logging |
| [AGENT_STATE_MACHINE.md](./AGENT_STATE_MACHINE.md) | All agent states and transitions |
| [EVENT_BUS.md](./EVENT_BUS.md) | RabbitMQ topics, queues, retry, DLQ |
| [API_SPEC.md](./API_SPEC.md) | All REST endpoints, response formats |
| [PROMPT_REGISTRY.md](./PROMPT_REGISTRY.md) | All prompts, versioned and typed |
| [AI_PROVIDER.md](./AI_PROVIDER.md) | Unified AI abstraction layer |
| [INVESTIGATION_STATE.md](./INVESTIGATION_STATE.md) | Shared state across all stores |
| [OBSERVABILITY.md](./OBSERVABILITY.md) | Logs, metrics, traces, dashboards |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, typography, components, animations |
| [FEATURE_FLAGS.md](./FEATURE_FLAGS.md) | All feature toggles |
| [DEMO.md](./DEMO.md) | Second-by-second hackathon demo script |
| [COST.md](./COST.md) | Token tracking, budgets, caching |
| [ROADMAP.md](./ROADMAP.md) | All 68 sprints + future vision |
| [CODING_RULES.md](./CODING_RULES.md) | TypeScript, DB, AI, API, Git rules |
| [EVALUATION.md](./EVALUATION.md) | Agent metrics, ground truth, regression testing |

---

*Version 1.0.0 — Sprint -1 — Authority: Chief Software Architect — LOCKED*

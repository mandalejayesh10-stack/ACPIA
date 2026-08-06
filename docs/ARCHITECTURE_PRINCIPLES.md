# ACPIA — Architecture Principles

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Scope**: All services, agents, plugins, and interfaces in ACPIA  
> **Rule**: No sprint may be approved that violates these principles. Any deviation requires explicit written approval from the Chief Software Architect.

---

## Preamble

ACPIA is a government-grade, AI-powered criminal investigation platform. Every architectural decision is made in service of three immovable goals:

1. **Correctness** — Investigation conclusions must be evidence-backed and verifiable.
2. **Auditability** — Every action must be traceable, timestamped, and attributable.
3. **Resilience** — The platform must continue to operate under failure, with no single point of collapse.

These principles are not suggestions. They are the **constitution** of ACPIA.

---

## Principle 1 — AI Never Directly Accesses Databases ⭐⭐⭐⭐⭐

AI agents **never** issue direct SQL, Cypher, or vector queries. All data access is mediated through:

- **Service Layer** (NestJS services) for PostgreSQL
- **Graph Service** for Neo4j
- **Vector Service** for Qdrant
- **Memory Service** for Redis

**Why**: Direct DB access from agents creates untraceable data reads, bypasses audit logging, and tightly couples agent logic to infrastructure. If the DB schema changes, agents must not break.

```
❌ Agent → PostgreSQL
✅ Agent → Service API → PostgreSQL
```

**Enforcement**: Agent SDK exposes typed `context.services.*` accessors. No raw DB drivers are exported from `@acpia/agent-sdk`.

---

## Principle 2 — All Agent Communication Occurs Through the Event Bus ⭐⭐⭐⭐⭐

Agents **never** call each other directly. All inter-agent communication uses RabbitMQ topics via the canonical event schema.

```
❌ EvidenceAgent.callContentAgent()
✅ eventBus.publish('acpia.agents.evidence.completed', payload)
```

**Why**: Direct coupling means one failing agent cascades to all. The event bus enables:
- Independent scaling of each agent
- Replay of failed events
- Dead Letter Queue recovery
- Zero-downtime agent upgrades
- Full audit trail of every agent interaction

**Enforcement**: Agent SDK's `publish()` method is the only inter-agent communication mechanism. Direct imports between plugin packages are forbidden.

---

## Principle 3 — Every AI Output Is Explainable

No AI agent may return a conclusion without a corresponding explanation. Every `AgentOutput` **must** include:

```typescript
{
  conclusion: string,
  confidence: number,      // 0.0 – 1.0
  reasoning: string[],     // step-by-step chain of thought
  evidenceRefs: string[],  // IDs of evidence used
  modelUsed: string,
  promptId: string,
  promptVersion: string
}
```

**Why**: ACPIA outputs may be presented in court. Every finding must withstand legal scrutiny. "The AI said so" is not acceptable.

**Enforcement**: `AgentOutput` TypeScript type enforces these fields. Any agent returning an output without them fails type-check at build time.

---

## Principle 4 — Every Decision References Evidence

No agent may produce a risk score, threat classification, hypothesis, or report **without linking it to one or more evidence IDs**. Orphaned conclusions are invalid.

```typescript
// FORBIDDEN
{ threat: 'grooming', confidence: 0.9 }

// REQUIRED
{ threat: 'grooming', confidence: 0.9, evidenceRefs: ['EV-2024-001', 'EV-2024-002'] }
```

**Why**: Investigation integrity. Every finding must have a verifiable chain back to physical evidence.

---

## Principle 5 — Frontend Never Calls AI Directly

The Next.js frontend **never** calls OpenAI, Claude, Gemini, or any AI provider directly. All AI calls are routed through the NestJS API.

```
❌ Browser → OpenAI API
✅ Browser → NestJS API → AI Provider Layer → OpenAI
```

**Why**:
- API keys never leave the server
- All AI calls are logged, audited, and cost-tracked
- Rate limiting is enforced server-side
- The AI provider can be swapped without frontend changes

**Enforcement**: No AI SDK packages are permitted in `apps/web/package.json`.

---

## Principle 6 — Every Feature Must Support Offline Deployment

ACPIA is designed for **Kerala Police** and similar government agencies. It must be deployable in air-gapped environments where external internet access is restricted or unavailable.

This means:
- Every AI provider has a **local/offline fallback** (open-source model via Ollama or similar)
- Every external dependency has a self-hosted alternative
- Feature flags control which providers are active (see `FEATURE_FLAGS.md`)
- Docker Compose must bring up a fully functional platform with no external calls

**Why**: Government security requirements often mandate on-premises deployment.

---

## Principle 7 — Every Module Is Independently Deployable

Every agent plugin, every NestJS module, every service must be independently:
- Startable
- Testable
- Deployable
- Scalable

```
plugins/evidence-agent/   → can run standalone
plugins/threat-agent/     → can run standalone
apps/api/                 → can run without agents
```

No module has a hard boot dependency on another. Missing dependencies are handled gracefully with health check failures and circuit breakers.

**Why**: Enables blue-green deployments, canary releases, and isolated debugging.

---

## Principle 8 — Every External API Goes Through the Provider Layer ⭐⭐⭐⭐⭐

No service, agent, or module calls an external API directly. All external API calls are routed through the `@acpia/ai-provider` package.

```
❌ openai.chat.completions.create(...)
✅ aiProvider.reason({ promptId, variables, model })
```

The provider layer exposes:
- `reason()` — Language model completion
- `vision()` — Image/video understanding
- `ocr()` — Text extraction from images/documents
- `speech()` — Audio transcription
- `embed()` — Semantic embeddings
- `moderate()` — Content moderation
- `plan()` — Multi-step planning with tool calling

**Why**: One interface means one swap to change the underlying model or provider across the entire platform. OpenAI → Claude = one config change.

---

## Principle 9 — Shared Investigation State Is the Source of Truth

Every agent reads from and writes to the **Shared Investigation State** (PostgreSQL + Neo4j + Qdrant + Redis). Agents do not pass results directly to the next agent.

```
Agent 1 → writes → Investigation State
Agent 2 → reads ← Investigation State
```

**Why**: If Agent 5 fails, restart from Agent 5. No reprocessing of Agents 1–4. The investigation state is durable, queryable, and auditable.

---

## Principle 10 — Plugin Architecture for All Agents

All 16 investigation agents are implemented as **plugins** in the `plugins/` directory. Each plugin exposes a canonical interface:

```typescript
interface AgentPlugin {
  register(registry: PluginRegistry): void
  execute(input: AgentInput, context: AgentContext): Promise<AgentOutput>
  validate(input: AgentInput): ValidationResult
  publish(output: AgentOutput, bus: EventBus): Promise<void>
  health(): HealthStatus
}
```

The Chief Investigation Agent loads plugins dynamically at startup. New agents are added by creating a new plugin — **no core code changes required**.

**Platform pitch**: *"ACPIA is a plugin-based investigation operating system."*

---

## Principle 11 — Secrets Never Appear in Code or Logs

- All secrets (API keys, DB passwords, JWT secrets) are loaded from environment variables only
- Secrets are never logged, even at DEBUG level
- Secrets are never committed to version control
- `.env` files are gitignored; `.env.example` files (with no values) are committed
- In production, secrets are managed by a secret manager (HashiCorp Vault or cloud equivalent)

---

## Principle 12 — Everything Is Typed, Nothing Is `any`

TypeScript strict mode is non-negotiable. `any` is forbidden everywhere. `unknown` is used where types cannot be guaranteed, with explicit runtime validation (Zod schemas).

```typescript
// FORBIDDEN
function process(data: any) { ... }

// REQUIRED
function process(data: EvidencePayload) { ... }
```

---

## Principle 13 — Human Approval Gates Exist for High-Risk Actions

Certain agent outputs require a human investigator to approve before the platform acts on them:

- Generating an official report
- Flagging a person as a primary suspect
- Issuing a risk score above 8/10
- Archiving or deleting evidence

These gates are enforced in the workflow engine, not the UI. They cannot be bypassed by feature flags.

---

## Principle 14 — Chain of Custody Is Immutable

Every access, modification, download, and analysis of evidence is permanently recorded in the `audit_log` table. These records:
- Cannot be deleted
- Cannot be modified
- Are cryptographically signed
- Reference the actor (user or agent), timestamp, action, and evidence ID

---

## Summary Table

| # | Principle | Enforcement |
|---|---|---|
| 1 | AI never accesses DB directly | No DB drivers in agent-sdk |
| 2 | Agent communication via Event Bus only | No direct agent imports |
| 3 | Every AI output is explainable | TypeScript type enforcement |
| 4 | Every decision references evidence | Required `evidenceRefs` field |
| 5 | Frontend never calls AI | No AI SDK in web package |
| 6 | Support offline deployment | Feature flags + local fallbacks |
| 7 | Every module independently deployable | No hard boot dependencies |
| 8 | All external APIs through Provider Layer | No direct SDK calls in agents |
| 9 | Shared Investigation State is source of truth | Agents read/write state, not each other |
| 10 | Plugin architecture for all agents | `AgentPlugin` interface |
| 11 | Secrets never in code or logs | Env vars + gitignore |
| 12 | Everything typed, no `any` | TypeScript strict + ESLint |
| 13 | Human approval gates for high-risk actions | Workflow engine enforcement |
| 14 | Chain of custody is immutable | Append-only audit log |

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

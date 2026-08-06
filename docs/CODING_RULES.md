# ACPIA — Coding Rules

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Enforcement**: ESLint, TypeScript strict mode, PR reviews  
> **Principle**: These rules are not preferences. Violations fail the CI pipeline.

---

## 1. TypeScript Rules

### No `any`. Ever.

```typescript
// ❌ FORBIDDEN
function process(data: any) { ... }
const result: any = await fetchData()

// ✅ REQUIRED
function process(data: EvidencePayload) { ... }
const result: EvidencePayload = await fetchData()

// ✅ ACCEPTABLE when type is genuinely unknown at compile time
function process(data: unknown) {
  const parsed = EvidencePayloadSchema.parse(data) // Zod validation
}
```

ESLint rule: `@typescript-eslint/no-explicit-any: error`

---

### Strict Mode — Non-Negotiable

Every `tsconfig.json` in the monorepo extends `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

### Use `unknown` + Zod for External Data

Any data from external sources (API responses, file parsing, event bus messages) must be validated with Zod before use:

```typescript
// ❌ FORBIDDEN
const event = JSON.parse(message) as AgentCompletedEvent

// ✅ REQUIRED
const event = AgentCompletedEventSchema.parse(JSON.parse(message))
```

---

### Prefer `interface` over `type` for object shapes

```typescript
// ✅ For object shapes (extensible, mergeable)
interface EvidencePayload {
  id: string
  hash: string
}

// ✅ For unions, primitives, and mapped types
type EvidenceStatus = 'UPLOADED' | 'VALIDATED' | 'ANALYZED'
type EvidenceId = `EV-${string}`
```

---

### Enums → `const` objects

```typescript
// ❌ TypeScript enums (generate JS runtime code, cause issues with bundlers)
enum Role { INVESTIGATOR, SUPERVISOR, ADMIN }

// ✅ const object with as const
const Role = {
  INVESTIGATOR: 'INVESTIGATOR',
  SUPERVISOR: 'SUPERVISOR',
  ADMIN: 'ADMIN',
} as const
type Role = typeof Role[keyof typeof Role]
```

---

## 2. Database Rules

### Never Call the DB from the Frontend

```
❌ Next.js Page → Prisma → PostgreSQL
✅ Next.js Page → NestJS API → Service → Prisma → PostgreSQL
```

No Prisma client in `apps/web`. No database drivers in `apps/web`.

---

### ORM Only — No Raw SQL in Application Code

```typescript
// ❌ FORBIDDEN
await db.$queryRaw`SELECT * FROM evidence WHERE case_id = ${caseId}`

// ✅ REQUIRED
await db.evidence.findMany({ where: { caseId } })
```

Exception: Performance-critical queries pre-approved by the Chief Software Architect and tagged with `// APPROVED_RAW_QUERY: {reason}`.

---

### Always Scope Queries to `caseId`

No query that returns sensitive data may omit the `caseId` filter:

```typescript
// ❌ FORBIDDEN — returns all evidence across all cases
await db.evidence.findMany({ where: { status: 'ANALYZED' } })

// ✅ REQUIRED
await db.evidence.findMany({ where: { caseId, status: 'ANALYZED' } })
```

---

### snake_case Database Names, camelCase TypeScript

Database columns are `snake_case`. Prisma maps them to `camelCase` TypeScript automatically via `@map`.

```prisma
model Evidence {
  id        String   @id @default(uuid())
  caseId    String   @map("case_id")
  fileHash  String   @map("file_hash")
  createdAt DateTime @default(now()) @map("created_at")
  @@map("evidence")
}
```

---

## 3. AI / Prompt Rules

### Never Hardcode a Prompt String

```typescript
// ❌ FORBIDDEN
const response = await openai.complete({
  messages: [{ role: 'system', content: 'You are an AI investigator...' }]
})

// ✅ REQUIRED
const response = await aiProvider.reason({
  promptId: 'content-analysis.summarize-image.default',
  variables: { evidenceSummary, caseContext }
})
```

---

### Never Hardcode a Model Name

```typescript
// ❌ FORBIDDEN
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  ...
})

// ✅ REQUIRED — model is configured in the prompt registry
const response = await aiProvider.reason({ promptId: '...' })
// Model is read from the prompt record in the DB
```

---

### Never Call OpenAI (or Any AI SDK) Outside the AI Provider Layer

```typescript
// ❌ FORBIDDEN (in any agent, service, or module)
import OpenAI from 'openai'
const openai = new OpenAI()

// ✅ REQUIRED (in agents)
constructor(private readonly ai: AiProvider) {}
await this.ai.reason({ promptId: '...' })
```

---

## 4. Architecture Rules

### Everything Is Dependency Injected

No global singletons. No module-level initialization. All services are injected via NestJS DI.

```typescript
// ❌ FORBIDDEN
const db = new PrismaClient() // global singleton

// ✅ REQUIRED
@Injectable()
class EvidenceService {
  constructor(private readonly db: DatabaseService) {}
}
```

---

### No Direct Cross-Plugin Imports

```typescript
// ❌ FORBIDDEN (in plugins/threat-agent/)
import { ContentAnalysisAgent } from '../../content-agent/src/agent'

// ✅ REQUIRED — consume via Event Bus or shared types only
import type { ContentAnalysisOutput } from '@acpia/shared'
```

---

### Never Import DB Drivers in Agent Plugins

```typescript
// ❌ FORBIDDEN (in any plugin)
import { PrismaClient } from '@prisma/client'
import neo4j from 'neo4j-driver'

// ✅ REQUIRED — use MCP servers
const evidence = await context.mcp.evidence.get_evidence(evidenceId)
```

---

## 5. Error Handling Rules

### Always Use Typed Errors

```typescript
// ❌ FORBIDDEN
throw new Error('Something went wrong')

// ✅ REQUIRED
throw new EvidenceNotFoundError(evidenceId)
throw new AgentExecutionError({ agentId, reason: 'RATE_LIMIT', retryable: true })
```

All custom errors extend `AcpiaBaseError`:

```typescript
abstract class AcpiaBaseError extends Error {
  abstract readonly code: string
  abstract readonly retryable: boolean
  readonly timestamp = new Date()
}
```

---

### Never Swallow Errors

```typescript
// ❌ FORBIDDEN
try {
  await riskyOperation()
} catch {
  // silently ignored
}

// ✅ REQUIRED
try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', error instanceof Error ? error : new Error(String(error)))
  throw error  // or handle appropriately
}
```

---

### Always Validate Function Return Types

```typescript
// ❌ FORBIDDEN
async function getEvidence(id: string) {
  return db.evidence.findUnique({ where: { id } }) // returns null if not found
}

// ✅ REQUIRED
async function getEvidence(id: string): Promise<Evidence> {
  const evidence = await db.evidence.findUnique({ where: { id } })
  if (!evidence) throw new EvidenceNotFoundError(id)
  return evidence
}
```

---

## 6. API Rules

### Always Use the Response Envelope

```typescript
// ❌ FORBIDDEN
return evidence  // raw object

// ✅ REQUIRED
return this.response.success(evidence)
return this.response.paginated(evidence, pagination)
return this.response.error(new EvidenceNotFoundError(id))
```

---

### Validate All Inputs at the Controller Boundary

```typescript
// Every controller method uses a DTO with class-validator decorators
@Post('upload')
async uploadEvidence(
  @Body() dto: UploadEvidenceDto,  // validated by ValidationPipe
  @Param('caseId', ParseUUIDPipe) caseId: string
) { ... }
```

---

### No Sensitive Data in Query Strings

API keys, tokens, and passwords are never passed as query parameters (visible in logs). Always use request headers or body.

---

## 7. Frontend Rules

### No Direct API Calls from Client Components

```typescript
// ❌ FORBIDDEN (in a React client component)
const evidence = await fetch('/api/v1/cases/123/evidence').then(r => r.json())

// ✅ REQUIRED — use server actions or React Query with typed API client
const { data } = useEvidence(caseId)  // React Query hook with typed client
```

---

### No AI SDK Imports in `apps/web`

```typescript
// ❌ FORBIDDEN
import OpenAI from 'openai'  // in any frontend file

// There is no legitimate reason for this
```

---

### Always Handle Loading, Error, and Empty States

Every component that fetches data must handle all three states:

```tsx
if (isLoading) return <EvidenceSkeleton />
if (error) return <ErrorState message={error.message} retry={refetch} />
if (!evidence?.length) return <EmptyState message="No evidence uploaded yet." />
return <EvidenceGrid evidence={evidence} />
```

---

## 8. Testing Rules

### Minimum Coverage Targets

| Category | Coverage |
|---|---|
| Agent executors | ≥ 80% |
| NestJS services | ≥ 70% |
| Utility functions | ≥ 90% |
| API endpoints | 100% (integration tests) |
| AI provider layer | 100% (mocked) |

### Test File Naming

```
agent.ts → agent.test.ts
evidence.service.ts → evidence.service.test.ts
```

### Never Test Implementation Details

```typescript
// ❌ BAD — testing internals
expect(agent['_privateField']).toBe(...)

// ✅ GOOD — testing behaviour
expect(await agent.execute(input)).toMatchObject({ status: 'SUCCESS' })
```

### Mock the AI Provider in All Tests

```typescript
// In test setup
const mockAiProvider = createMockAiProvider({
  reason: vi.fn().mockResolvedValue(mockReasonResponse),
  vision: vi.fn().mockResolvedValue(mockVisionResponse),
})
```

---

## 9. Git Rules

### Commit Message Format (Conventional Commits)

```
{type}({scope}): {description}

Types: feat | fix | chore | docs | test | refactor | perf | ci | sprint
Scopes: web | api | agent-sdk | agent/{name} | infra | docs

Examples:
feat(api): add evidence upload endpoint
sprint(3): add docker-compose with all services
fix(agent/content-analysis): handle null image response
docs: add CODING_RULES.md
```

Enforced by `commitlint` Husky hook.

---

### Branch Naming

```
sprint/{number}-{short-description}    → sprint/3-docker-compose
feat/{ticket}-{description}            → feat/42-evidence-upload
fix/{ticket}-{description}             → fix/107-hash-mismatch
```

---

### No Direct Commits to `main`

All changes via Pull Requests. PR must pass:
1. ESLint (zero warnings)
2. TypeScript strict check
3. Vitest unit tests
4. Build (pnpm turbo build)

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

# ACPIA — Definition of Done

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Applies to**: Every sprint, every PR, every Antigravity task  
> **Rule**: A sprint is NOT complete until every item below is ✅.

---

## The DoD Checklist

### 🔨 Build & Quality

- [ ] **Builds successfully** — `pnpm turbo run build` exits with code 0 for all affected packages
- [ ] **Lint passes** — `pnpm turbo run lint` exits with code 0, **zero warnings** (warnings are treated as errors in CI)
- [ ] **Type-check passes** — `pnpm turbo run typecheck` exits with code 0 with TypeScript strict mode enabled
- [ ] **No `any` introduced** — `grep -r "as any\|: any" apps/ packages/ plugins/` returns no results in changed files

### 🧪 Testing

- [ ] **Unit tests pass** — `pnpm turbo run test` exits with code 0
- [ ] **No regressions** — all tests that were passing before this sprint still pass
- [ ] **Coverage maintained** — coverage for changed files does not drop below thresholds defined in `EVALUATION.md`
- [ ] **AI provider mocked** — no real AI calls in unit tests (checked by test suite configuration)

### 🏗 Architecture

- [ ] **ENGINEERING_CONTRACT.md followed** — the engineer/Antigravity has explicitly verified compliance with all 15 sections
- [ ] **No architecture documents modified** — unless this sprint explicitly requires it and a corresponding ADR exists
- [ ] **No cross-plugin direct imports** — `packages/agent-sdk` is the only cross-plugin dependency
- [ ] **No AI SDK imports in `apps/web`** — verified by ESLint rule
- [ ] **No raw DB queries in agents** — all data access via MCP servers
- [ ] **All new API endpoints use the response envelope** — `{ success, data, meta }` format

### 📝 Code Quality

- [ ] **No uncommitted TODOs** — `grep -r "TODO\|FIXME\|HACK" --include="*.ts"` returns no results in changed files, unless explicitly tracked with format `// TODO(SPRINT-XX): description`
- [ ] **No hardcoded strings** — configuration values, feature flags, and constants in their designated locations
- [ ] **No hardcoded prompts** — all AI prompts registered in the Prompt Registry
- [ ] **No hardcoded model names** — all model selection via AI Provider config
- [ ] **No secrets in code** — `grep -r "sk-\|Bearer \|password.*=" --include="*.ts"` clean in changed files

### 🪵 Observability

- [ ] **Logs implemented** — all new code paths have appropriate `logger.info/warn/error` calls
- [ ] **Error handling implemented** — no unhandled promise rejections or swallowed exceptions
- [ ] **Custom errors used** — all thrown errors extend `AcpiaBaseError` (not generic `Error`)
- [ ] **Metrics emitted** — new agents emit required OpenTelemetry metrics (if this is an agent sprint)

### 📖 Documentation

- [ ] **Sprint documentation updated** — if this sprint adds a new API endpoint, agent, or database table, the corresponding doc is updated
- [ ] **README updated** — if the monorepo structure changed, the root README is updated
- [ ] **ADR created** — if this sprint made a significant architectural decision, a new ADR is created

### 🔒 Security

- [ ] **Input validation** — all new API endpoints have Zod/DTO validation
- [ ] **Authorization checked** — new endpoints check role and case-level access
- [ ] **Audit log entries** — new agent actions and evidence access are logged
- [ ] **No sensitive data in logs** — checked by code review

### 🚀 Deployment

- [ ] **Docker Compose still works** — `docker compose up` brings up all services cleanly
- [ ] **Environment variables documented** — any new env vars added to `.env.example`
- [ ] **No breaking changes without migration** — if DB schema changed, migration script exists
- [ ] **Feature flag added** — if this sprint adds a new major feature, a feature flag controls it

---

## Sprint-Level DoD (Additional for Sprint Completion)

Beyond individual PR DoD, a sprint is considered complete when:

- [ ] **Chief Software Architect review** — sprint output reviewed and approved
- [ ] **Integration test passes** — the end-to-end flow relevant to this sprint works as expected
- [ ] **ROADMAP.md updated** — sprint marked as `✅ Complete` in `docs/ROADMAP.md`
- [ ] **No known critical bugs** — no P0/P1 bugs left unresolved from this sprint

---

## Why Every Item Matters

| Item | What happens if skipped |
|---|---|
| Lint | Style inconsistencies accumulate, CI breaks mid-project |
| Type-check | Silent runtime errors in production |
| No `any` | Type system becomes useless, errors slip through |
| Tests pass | Regressions discovered in the demo, not in CI |
| Architecture followed | One deviation triggers 10 more, platform collapses |
| No TODOs | Technical debt invisible until deadline |
| Logs implemented | Cannot debug without logs — production blind |
| Audit logs | Chain of custody breaks — legal risk |
| Feature flags | Cannot disable broken features without deploy |

---

## CI Enforcement

The GitHub Actions CI pipeline enforces the following automatically on every PR:

```yaml
jobs:
  lint:        pnpm turbo run lint
  typecheck:   pnpm turbo run typecheck
  test:        pnpm turbo run test
  build:       pnpm turbo run build
  audit:       pnpm audit --audit-level=high
  no-any:      grep check for 'any' in changed files
  no-secrets:  truffleHog or gitleaks scan
```

A PR cannot be merged if any CI job fails. This is non-negotiable.

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

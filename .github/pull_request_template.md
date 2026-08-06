## Description

<!-- 
  ACPIA Pull Request
  Follow ENGINEERING_CONTRACT.md before submitting.
  This template is mandatory. Incomplete PRs are rejected.
-->

### Business Goal
> What user or investigative capability does this PR enable or improve?

_

### Technical Goal
> What engineering problem does this PR solve?

_

---

## Files Changed

| File | Change Type | Reason |
|------|-------------|--------|
| `path/to/file` | `[ADD\|MODIFY\|DELETE]` | Brief reason |

---

## Architecture Impact

> Does this PR touch any file listed in `docs/DO_NOT_TOUCH.md`?

- [ ] **No** — this PR does not touch any protected file
- [ ] **Yes** — ADR number: `ADR-___` (must be Accepted before this PR can merge)

> Does this PR change any interface defined in `AGENT_CONTRACT.md`, `API_SPEC.md`, `EVENT_BUS.md`, or `AI_PROVIDER.md`?

- [ ] No
- [ ] Yes — justify below:

_

> Does this PR follow all rules in `ENGINEERING_CONTRACT.md`?

- [ ] ✅ Yes — I have read ENGINEERING_CONTRACT.md and this PR is compliant

---

## Testing

> What tests were added or updated?

| Test File | Coverage | What It Tests |
|-----------|----------|---------------|
| `path/to/test` | `___% →  ___%` | Brief description |

> Run the following before submitting:

```bash
pnpm turbo run lint typecheck test build
```

- [ ] `pnpm lint` — passes with zero errors
- [ ] `pnpm typecheck` — passes with zero errors  
- [ ] `pnpm test` — all tests pass, no regressions
- [ ] `pnpm build` — builds successfully

---

## Definition of Done

- [ ] Builds successfully
- [ ] Lint passes (zero warnings)
- [ ] Type-check passes
- [ ] Unit tests pass
- [ ] Existing tests remain green (no regressions)
- [ ] No architecture documents changed without ADR
- [ ] Documentation updated (if this sprint requires it)
- [ ] No uncommitted TODOs (use `// TODO(SPRINT-XX):` format if needed)
- [ ] Logs and error handling implemented for all new code paths
- [ ] Follows ENGINEERING_CONTRACT.md

---

## Acceptance Criteria

> What must be true for this PR to be considered complete? List as checkboxes.

- [ ] AC1: _
- [ ] AC2: _
- [ ] AC3: _

---

## Rollback Plan

> If this PR causes a production issue, how do we roll back?

- **Immediate**: Revert this PR (`git revert {SHA}`)
- **Data migration** (if applicable): _
- **Feature flag** (if applicable): Set `{FLAG_NAME}` to `false`

---

## Sprint Reference

> Which sprint does this PR belong to?

Sprint: `0.___` — `{Sprint Name}`

---

## Screenshots / Recordings

<!-- For UI changes, include before/after screenshots. For pipeline changes, include log output. -->

_

---

> 💡 **Reminder**: Read [`docs/DO_NOT_TOUCH.md`](docs/DO_NOT_TOUCH.md) before modifying any architecture document.

# ACPIA — Do Not Touch

> **Status**: IMMUTABLE  
> **Authority**: Chief Software Architect  
> **Enforcement**: Branch protection rules + PR review requirements  
>
> **These files cannot be modified without explicit written approval from the Chief Software Architect and a corresponding Architecture Decision Record (ADR).**

---

## Protected Files

The following files define the core contracts and architecture of ACPIA. They were designed in Sprint -1 and represent decisions that, if changed mid-project, would cascade breaking changes across every agent, every service, and every frontend component.

### Tier 1 — Absolute Lock (Zero tolerance. Requires new ADR + Chief Software Architect signature.)

| File | Reason |
|---|---|
| [`docs/ENGINEERING_CONTRACT.md`](./ENGINEERING_CONTRACT.md) | Master governance document — all other docs flow from this |
| [`docs/AGENT_CONTRACT.md`](./AGENT_CONTRACT.md) | `AgentPlugin` interface — changing it breaks all 16 agents |
| [`docs/API_SPEC.md`](./API_SPEC.md) | Every endpoint, response format, and error code |
| [`docs/EVENT_BUS.md`](./EVENT_BUS.md) | Topic naming, event schema — changing breaks all inter-agent comms |
| [`docs/ONTOLOGY.md`](./ONTOLOGY.md) | All knowledge graph node types and relationships |
| [`docs/AI_PROVIDER.md`](./AI_PROVIDER.md) | The unified AI interface — changing it breaks all agents |
| [`docs/adr/`](./adr/) | ADR directory — individual ADR files are immutable once Accepted |

---

### Tier 2 — Change Requires SUPERVISOR Review + Chief Software Architect Comment Approval

| File | Reason |
|---|---|
| [`docs/ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) | 14 immovable rules — exceptions require explicit justification |
| [`docs/SECURITY.md`](./SECURITY.md) | Security model for Kerala Police deployment |
| [`docs/AI_SAFETY.md`](./AI_SAFETY.md) | Safety rules for a child protection platform |
| [`docs/AGENT_STATE_MACHINE.md`](./AGENT_STATE_MACHINE.md) | State transitions — changing breaks pipeline orchestration |
| [`docs/MCP.md`](./MCP.md) | MCP server tool definitions |
| [`docs/INVESTIGATION_STATE.md`](./INVESTIGATION_STATE.md) | State store ownership rules |
| [`docs/CODING_RULES.md`](./CODING_RULES.md) | Enforced conventions |

---

### Tier 3 — Living Documents (Can be updated with normal PR approval)

| File | When to Update |
|---|---|
| [`docs/ROADMAP.md`](./ROADMAP.md) | Each sprint completion |
| [`docs/PROMPT_REGISTRY.md`](./PROMPT_REGISTRY.md) | When prompts are added or versioned |
| [`docs/FEATURE_FLAGS.md`](./FEATURE_FLAGS.md) | When flags are added |
| [`docs/COST.md`](./COST.md) | When pricing changes or budget updates |
| [`docs/DEMO.md`](./DEMO.md) | When demo flow changes |
| [`docs/EVALUATION.md`](./EVALUATION.md) | When evaluation datasets grow |

---

## Why This Matters

The most dangerous thing an AI assistant can do in a complex project is **rewrite a contract that other components depend on**.

For example:
- If `AgentOutput` interface changes in `AGENT_CONTRACT.md`, all 16 agent plugins break
- If a new event topic format is introduced without updating `EVENT_BUS.md`, the pipeline breaks silently
- If an API endpoint changes response format without updating `API_SPEC.md`, the frontend breaks

By marking these files protected, every Antigravity prompt implicitly understands: **do not touch the contract files, only implement against them.**

---

## How to Request a Change

1. Open a GitHub Issue titled: `[ARCHITECTURE CHANGE] {description}`
2. Tag the Chief Software Architect
3. Create a draft ADR in `docs/adr/ADR-{NNN}-{title}.md` with status `Proposed`
4. Discuss in the issue
5. Upon approval, update the ADR status to `Accepted` and modify the protected file
6. Create a migration plan for any components that depend on the changed contract

---

## Enforcement in Git

```yaml
# .github/branch-protection.yml
protected_files:
  - docs/ENGINEERING_CONTRACT.md
  - docs/AGENT_CONTRACT.md
  - docs/API_SPEC.md
  - docs/EVENT_BUS.md
  - docs/ONTOLOGY.md
  - docs/AI_PROVIDER.md
  - docs/adr/**
required_reviewers:
  - chief-software-architect
require_approval_comment: "ARCHITECTURE APPROVED: ADR-{NNN}"
```

---

*This file itself is immutable. It cannot be modified without a new ADR.*  
*Last updated: Sprint -1 | Authority: Chief Software Architect*

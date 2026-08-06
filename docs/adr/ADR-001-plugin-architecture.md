# ADR-001 — Plugin Architecture for Investigation Agents

| Field | Value |
|---|---|
| **ID** | ADR-001 |
| **Title** | Plugin Architecture for Investigation Agents |
| **Status** | ✅ Accepted |
| **Date** | Sprint -1 |
| **Authority** | Chief Software Architect |
| **Deciders** | Chief Software Architect, Product Owner |

---

## Context

ACPIA requires 16 independent investigation agents, each with a distinct AI model, toolset, and responsibility. We needed to decide how to structure these agents within the monorepo and how the Chief Investigation Agent would coordinate them.

---

## Decision Drivers

- Agents must be independently testable and deployable
- Adding a new agent (Agent 17, 18...) must not require modifying core platform code
- A failing agent must not bring down the entire platform
- Different agents use different AI providers and tools — tight coupling is dangerous
- Future third-party agent contributions must be possible

---

## Considered Alternatives

### Option A: Monolith
All 16 agents in a single NestJS module within `apps/api`.

**Pros**: Simple to start, shared DI container  
**Cons**: One bad agent breaks all agents. No independent deployment. Testing one agent requires starting the entire API. Adding Agent 17 requires modifying core API code.

---

### Option B: Microservices
Each agent as a separate NestJS application with its own Docker container.

**Pros**: True isolation, independent scaling  
**Cons**: 16 separate repositories (or a very complex monorepo setup), 16 separate Docker containers for development, enormous operational overhead for a hackathon, complex service discovery, high latency from inter-service HTTP calls.

---

### Option C: Plugin System ✅ CHOSEN
Each agent as a plugin in `plugins/{name}-agent/`, implementing a shared `AgentPlugin` interface from `@acpia/agent-sdk`. The Chief Investigation Agent loads plugins dynamically at startup.

**Pros**:
- Independent testability (each plugin has its own test suite)
- Independent deployability (plugins can be loaded/unloaded at runtime via feature flags)
- Adding Agent 17 = creating a new folder, zero core code changes
- Clean interface contract — agents cannot break each other
- Plugin can be disabled for debugging without affecting other agents
- Fits naturally in a pnpm monorepo with Turborepo

**Cons**:
- Requires a well-defined `AgentPlugin` interface upfront (Sprint 14)
- Plugin loading mechanism adds startup complexity

---

## Decision

**Plugin Architecture** (Option C).

Every investigation agent is a plugin in `plugins/` that implements the `AgentPlugin` interface from `@acpia/agent-sdk`. The Chief Investigation Agent loads and orchestrates plugins. The platform API loads all enabled plugins at startup via the plugin registry.

---

## Consequences

### Positive
- ✅ New agents added without touching core code
- ✅ Agents independently testable in isolation
- ✅ Feature flags can disable individual agents at runtime
- ✅ Platform pitch: *"ACPIA is a plugin-based investigation operating system"*
- ✅ Clean answer to judge question: *"How do you extend this?"*

### Negative
- ⚠️ Plugin interface must be frozen early (Sprint 14) — changes are breaking
- ⚠️ Shared `AgentContext` becomes a dependency for all plugins — must be stable

### Neutral
- 🔄 Plugin loading adds ~100ms to platform startup (acceptable)

---

## Links

- [AGENT_CONTRACT.md](../AGENT_CONTRACT.md) — Full plugin interface specification
- [ARCHITECTURE_PRINCIPLES.md](../ARCHITECTURE_PRINCIPLES.md) — Principle 10

---

*Accepted: Sprint -1 | Cannot be reversed without Chief Software Architect approval + new ADR*

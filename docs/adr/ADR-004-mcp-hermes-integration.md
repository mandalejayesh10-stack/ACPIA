# ADR-004 — MCP (Model Context Protocol) via Hermes

| Field | Value |
|---|---|
| **ID** | ADR-004 |
| **Title** | Model Context Protocol (MCP) for Agent-Platform Integration |
| **Status** | ✅ Accepted |
| **Date** | Sprint -1 |
| **Authority** | Chief Software Architect |
| **Deciders** | Chief Software Architect, Product Owner |

---

## Context

AI agents need to access platform capabilities: retrieve evidence, query the knowledge graph, search vectors, read memory, write timeline events. The question is: **how should agents communicate with the platform?**

The answer determines whether our architecture is clean, auditable, and extensible — or tightly coupled and fragile.

---

## Decision Drivers

- Every agent capability access must be auditable (see SECURITY.md — audit log)
- Agents must not directly import or call platform services
- The same capability (e.g., "get evidence") must work identically whether called by an AI model or a programmatic agent step
- New capabilities must be addable without changing agent code
- Tool definitions must be usable directly with OpenAI's function calling / tool use API

---

## Considered Alternatives

### Option A: Direct Service Injection (NestJS DI)
Agents are NestJS providers that inject services directly.

```typescript
constructor(private readonly evidenceService: EvidenceService) {}
```

**Pros**: Simple, type-safe, familiar  
**Cons**: Tightly couples agents to the NestJS container. Agents cannot run outside the NestJS process. No standard interface for AI tool calling. No centralized audit of what agents access. Plugin architecture becomes impossible.

---

### Option B: Internal REST API
Agents call the NestJS REST API internally over HTTP.

**Pros**: Clean separation, API is already defined  
**Cons**: HTTP overhead for every tool call. No structured tool schema for AI function calling. Authentication complexity for internal calls. No streaming support for large evidence files.

---

### Option C: gRPC
Internal service mesh using Protocol Buffers and gRPC.

**Pros**: Fast, typed, streaming support  
**Cons**: Significant boilerplate. Proto files for every tool. Overkill for a hackathon. No native compatibility with AI function calling schemas.

---

### Option D: Model Context Protocol (MCP) with Hermes ✅ CHOSEN
The Model Context Protocol, implemented via the Hermes MCP framework, exposes platform capabilities as structured **tools** that AI agents can call. Each MCP server is a focused, auditable gateway to one platform capability.

**Pros**:
- Tools are defined in JSON Schema — directly compatible with OpenAI function calling and Claude tool use
- Each MCP server is an isolated process — no shared memory with agents
- Every tool call is intercepted at the MCP layer → automatic audit logging
- Tools can be added to an MCP server without changing agent code
- Agents describe what tools they need in their manifest — declarative
- Industry standard (backed by Anthropic, supported by OpenAI, widely adopted)
- Consistent interface whether the agent is an LLM or rule-based

**Cons**:
- Adds MCP server startup complexity
- Tool call latency slightly higher than direct function calls (~5–10ms per call)
- Requires Hermes framework setup

---

## Decision

**MCP via Hermes** for all agent-to-platform communication. 10 MCP servers are defined (see `MCP.md`), each responsible for one platform domain.

No agent may call a platform service by any means other than its declared MCP clients.

---

## MCP Server Ownership

| MCP Server | Owner Service | Sprint |
|---|---|---|
| Evidence MCP | Evidence Service | Sprint 11 |
| Vision MCP | AI Provider | Sprint 17 |
| Metadata MCP | Metadata Service | Sprint 6 |
| Graph MCP | Knowledge Graph Service | Sprint 6 |
| Timeline MCP | Timeline Service | Sprint 8 |
| Search MCP | Search Service | Sprint 19 |
| Risk MCP | Risk Service | Sprint 11 |
| Report MCP | Report Service | Sprint 11 |
| Audit MCP | Audit Service | Sprint 5 |
| Memory MCP | Memory Service | Sprint 15 |

---

## How Tool Calling Works

```typescript
// Agent declares required MCP servers in manifest
manifest: {
  requiredMcpServers: ['evidence', 'vision', 'graph', 'audit']
}

// At execution time, agent receives typed MCP clients in context
const evidence = await context.mcp.evidence.get_evidence(evidenceId)
// ↑ This call is:
// 1. Serialized as a JSON MCP tool call
// 2. Sent to the Evidence MCP Server process
// 3. Executed against the Evidence Service
// 4. Logged to the Audit MCP Server
// 5. Response returned to agent
```

---

## Consequences

### Positive
- ✅ Every agent capability access is audited automatically
- ✅ Tool schemas are compatible with OpenAI function calling
- ✅ Agents cannot break platform services (isolated processes)
- ✅ Adding a new tool = adding a method to an MCP server, zero agent changes
- ✅ Clean answer to judge question: *"How do agents access data?"*

### Negative
- ⚠️ MCP servers must be running before agents can start (health check dependency)
- ⚠️ Tool call overhead (~5–10ms per call) — acceptable for investigation workloads

---

## Links

- [MCP.md](../MCP.md) — All 10 MCP server specifications
- [AGENT_CONTRACT.md](../AGENT_CONTRACT.md) — `AgentContext.mcp` interface
- [ARCHITECTURE_PRINCIPLES.md](../ARCHITECTURE_PRINCIPLES.md) — Principle 1 (AI never accesses DB directly)

---

*Accepted: Sprint -1 | Cannot be reversed without Chief Software Architect approval + new ADR*

# ACPIA — Feature Flags

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Principle**: No code changes required to enable or disable any feature. One config toggle, one API call.

---

## Overview

ACPIA uses feature flags to:
1. Enable/disable expensive AI features during development
2. Control the demo experience at the hackathon
3. Support offline deployment (disable all external AI calls)
4. Roll out new agents gradually without redeployment
5. Quickly disable a malfunctioning agent without a hotfix

Feature flags are stored in PostgreSQL and cached in Redis (TTL: 30 seconds). The NestJS API and all agent plugins read flags via the `FeatureFlagClient`.

---

## Flag Storage

```sql
CREATE TABLE feature_flags (
  id           TEXT PRIMARY KEY,           -- 'ENABLE_VISION_ANALYSIS'
  description  TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT false,
  scope        TEXT NOT NULL DEFAULT 'GLOBAL',  -- 'GLOBAL' | 'CASE' | 'AGENT'
  metadata     JSONB,
  updated_by   UUID REFERENCES users(id),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Complete Flag Registry

### AI Provider Flags

| Flag ID | Default | Description |
|---|---|---|
| `ENABLE_AI_PROVIDER` | `true` | Master switch — all AI calls. Disable for fully offline. |
| `ENABLE_GPT4O` | `true` | Enable OpenAI GPT-4o for reasoning |
| `ENABLE_CLAUDE_FALLBACK` | `true` | Enable Anthropic Claude as fallback |
| `ENABLE_LOCAL_MODEL` | `false` | Enable Ollama local model (offline mode) |
| `ENABLE_VISION_ANALYSIS` | `true` | Enable AI vision for images/videos |
| `ENABLE_OCR` | `true` | Enable PaddleOCR text extraction |
| `ENABLE_SPEECH_TRANSCRIPTION` | `true` | Enable Whisper audio transcription |
| `ENABLE_EMBEDDINGS` | `true` | Enable OpenAI embeddings + Qdrant indexing |
| `ENABLE_CONTENT_MODERATION` | `true` | Enable OpenAI moderation API |

---

### Agent Flags

Each agent can be independently enabled/disabled:

| Flag ID | Default | Description |
|---|---|---|
| `AGENT_EVIDENCE_INTAKE` | `true` | Enable Evidence Intake Agent (1) |
| `AGENT_CONTENT_ANALYSIS` | `true` | Enable Content Analysis Agent (2) |
| `AGENT_THREAT_IDENTIFICATION` | `true` | Enable Threat Identification Agent (3) |
| `AGENT_CONTEXT_EXTRACTION` | `true` | Enable Context Extraction Agent (4) |
| `AGENT_ACTIVITY_PATTERN` | `true` | Enable Activity Pattern Agent (5) |
| `AGENT_METADATA_MAPPING` | `true` | Enable Metadata Mapping Agent (6) |
| `AGENT_SYNTHETIC_DETECTION` | `false` | Enable Synthetic Detection Agent (7) — disabled until Sprint 33 |
| `AGENT_TIMELINE_RECONSTRUCTION` | `true` | Enable Timeline Reconstruction Agent (8) |
| `AGENT_INTELLIGENT_RETRIEVAL` | `true` | Enable Intelligent Retrieval Agent (9) |
| `AGENT_AUTOMATED_REPORTING` | `true` | Enable Automated Reporting Agent (10) |
| `AGENT_RISK_ASSESSMENT` | `true` | Enable Risk Assessment Agent (11) |
| `AGENT_INTELLIGENCE_FUSION` | `true` | Enable Intelligence Fusion Agent (12) |
| `AGENT_HYPOTHESIS_GENERATION` | `true` | Enable Hypothesis Generation Agent (13) |
| `AGENT_VERIFICATION` | `true` | Enable Verification Agent (14) |
| `AGENT_COPILOT` | `true` | Enable Investigation Copilot Agent (15) |
| `AGENT_EXPLAINABILITY` | `true` | Enable Explainability Agent (16) |

---

### Infrastructure Flags

| Flag ID | Default | Description |
|---|---|---|
| `ENABLE_KNOWLEDGE_GRAPH` | `true` | Enable Neo4j knowledge graph |
| `ENABLE_VECTOR_SEARCH` | `true` | Enable Qdrant semantic search |
| `ENABLE_EVENT_BUS` | `true` | Enable RabbitMQ event bus |
| `ENABLE_REDIS_CACHE` | `true` | Enable Redis caching |
| `ENABLE_MINIO_STORAGE` | `true` | Enable MinIO evidence storage |

---

### Security Flags

| Flag ID | Default | Description |
|---|---|---|
| `ENABLE_MFA` | `true` | Require MFA for SUPERVISOR/ADMIN |
| `ENABLE_AUDIT_LOG` | `true` | Write all actions to audit log (never disable in production) |
| `ENABLE_VIRUS_SCAN` | `true` | ClamAV scan on evidence upload |
| `ENABLE_HASH_VERIFICATION` | `true` | Re-verify evidence hash before analysis |
| `ENABLE_RATE_LIMITING` | `true` | API rate limiting |

---

### UI Flags

| Flag ID | Default | Description |
|---|---|---|
| `ENABLE_KNOWLEDGE_GRAPH_UI` | `true` | Show knowledge graph visualization |
| `ENABLE_TIMELINE_UI` | `true` | Show timeline view |
| `ENABLE_MAP_UI` | `false` | Show map view (Sprint 55) |
| `ENABLE_AGENT_MONITORING_UI` | `true` | Show agent monitoring dashboard |
| `ENABLE_COST_DASHBOARD` | `true` | Show AI token usage and cost |
| `ENABLE_REALTIME_UPDATES` | `true` | WebSocket real-time pipeline updates |
| `ENABLE_SOUND_EFFECTS` | `false` | Subtle audio cues for agent events |

---

### Demo Flags

| Flag ID | Default | Description |
|---|---|---|
| `DEMO_MODE` | `false` | Enable hackathon demo mode |
| `DEMO_AUTO_ADVANCE` | `false` | Auto-advance pipeline without waits |
| `DEMO_FAST_AGENTS` | `false` | Mock instant agent responses |
| `DEMO_PRELOADED_CASE` | `false` | Load a prebuilt demo case on startup |
| `DEMO_PRESENTATION_MODE` | `false` | Hide navigation, focus on center workspace |

**Demo mode configuration for hackathon**:
```json
{
  "DEMO_MODE": true,
  "DEMO_AUTO_ADVANCE": false,
  "DEMO_FAST_AGENTS": false,
  "DEMO_PRELOADED_CASE": true,
  "DEMO_PRESENTATION_MODE": true,
  "ENABLE_SOUND_EFFECTS": true,
  "ENABLE_REALTIME_UPDATES": true
}
```

---

## Flag Access in Code

### Backend (NestJS)

```typescript
// Injected via DI
constructor(private readonly flags: FeatureFlagService) {}

// Usage
const visionEnabled = await this.flags.isEnabled('ENABLE_VISION_ANALYSIS')
if (!visionEnabled) {
  logger.warn('Vision analysis disabled by feature flag')
  return null
}
```

### Agent SDK

```typescript
// Available on AgentContext
const visionEnabled = context.flags.isEnabled('ENABLE_VISION_ANALYSIS')
```

### Frontend (Next.js)

```typescript
// Server component — fetched at render time
const flags = await getFeatureFlags()
if (flags.ENABLE_KNOWLEDGE_GRAPH_UI) {
  return <KnowledgeGraphView />
}
```

---

## Flag Management API

```
GET  /feature-flags           → list all flags [ADMIN]
GET  /feature-flags/:id       → get single flag [ADMIN]
PATCH /feature-flags/:id      → update flag { enabled: boolean } [ADMIN]
POST /feature-flags/bulk      → update multiple flags at once [ADMIN]
```

All flag changes are logged in the audit log.

---

## Flag Evaluation Rules

1. If `ENABLE_AI_PROVIDER` is `false`, all AI agent flags are effectively `false`
2. If `ENABLE_EVENT_BUS` is `false`, pipeline cannot run (critical dependency)
3. If an agent flag is `false`, the agent is excluded from pipeline orchestration
4. Flags are evaluated at execution time, not at startup — a flag change takes effect within 30 seconds (Redis TTL)
5. `ENABLE_AUDIT_LOG` can never be set to `false` via the API — requires direct DB access

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

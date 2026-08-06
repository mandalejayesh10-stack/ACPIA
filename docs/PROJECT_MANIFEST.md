# ACPIA — Project Manifest

> **Read this file first.**  
> **Version**: 1.0.0 | **Status**: LOCKED  
> **Authority**: Chief Software Architect  
>
> Every Antigravity prompt begins with:  
> *"Read PROJECT_MANIFEST.md and follow all referenced architecture documents before implementing this sprint."*

---

## Vision

ACPIA — the **AI-powered Criminal and Paedophile Investigation Assistant** — is a government-grade, AI-driven criminal investigation platform designed for Kerala Police and similar law enforcement agencies. It transforms raw digital evidence into structured intelligence, actionable timelines, and legally reviewable investigation reports — automatically, in real time.

ACPIA is not a chatbot. It is not a dashboard. It is an **investigation operating system**: a platform that ingests evidence, activates specialized AI agents, builds a living knowledge graph, reconstructs timelines, assesses risk, and guides investigators through complex criminal cases — particularly those involving crimes against children.

The platform is designed to look and operate like it was built by the same organization as Hac'KP: dark, precise, government-grade, and technically uncompromising.

---

## Mission Statement

> *To give investigators the intelligence of a hundred analysts in the time it takes to upload a file.*

---

## Non-Goals

These are things ACPIA explicitly will **not** do in this version:

| Non-Goal | Reason |
|---|---|
| Real-time CCTV or surveillance integration | Out of scope for hackathon |
| Social media monitoring / OSINT crawling | Requires separate legal framework |
| Autonomous arrest recommendations | Human decision always required |
| Cross-jurisdiction data sharing | Out of scope |
| Mobile-first design | Desktop-first (judges use laptops) |
| Light mode UI | Dark mode only |
| Replacing human investigators | AI assists, humans decide |

---

## Hac'KP 2026 Problem Statement Alignment

| ACPIA Capability | Hac'KP Theme |
|---|---|
| Child safety evidence analysis | Cybercrime against children |
| Grooming / threat detection | Digital predator identification |
| Synthetic media detection | AI-generated CSAM detection |
| Knowledge graph of criminal networks | Organised crime intelligence |
| Chain of custody | Forensic evidence integrity |
| AI-powered reporting | Investigation efficiency |

---

## The 16 Investigation Agents

| # | Agent | Responsibility | Primary AI |
|---|---|---|---|
| 0 | Chief Investigation Agent | Orchestration, routing, human interaction | GPT-4o (Responses API) |
| 1 | Evidence Intake Agent | Upload, validate, hash, store evidence | No LLM (rule-based) |
| 2 | Content Analysis Agent | Understand images, video, audio, documents | GPT-4o Vision + Whisper |
| 3 | Threat Identification Agent | Detect grooming, blackmail, sextortion | GPT-4o |
| 4 | Context Extraction Agent | Extract landmarks, vehicles, uniforms, locations | GPT-4o Vision |
| 5 | Activity Pattern Agent | Behaviour analytics, communication patterns | GPT-4o + NetworkX |
| 6 | Metadata Mapping Agent | Extract EXIF, GPS, IMEI, device info | No LLM (ExifTool, Tika) |
| 7 | Synthetic Detection Agent | Deepfake and AI-generated media detection | Specialized models |
| 8 | Timeline Reconstruction Agent | Merge all signals into chronological narrative | GPT-4o + Neo4j |
| 9 | Intelligent Retrieval Agent | Semantic search across all investigation data | OpenAI Embeddings + Qdrant |
| 10 | Automated Reporting Agent | Generate investigation reports | GPT-4o Structured Output |
| 11 | Risk Assessment Agent | Score victim risk, evidence strength, suspect danger | GPT-4o + Python engine |
| 12 | Intelligence Fusion Agent | Merge all agent outputs into unified intelligence | GPT-4o + Neo4j + Qdrant |
| 13 | Hypothesis Generation Agent | Generate evidence-backed investigative hypotheses | GPT-4o |
| 14 | Verification Agent | Cross-check all findings, detect hallucinations | GPT-4o + Neo4j + Qdrant |
| 15 | Investigation Copilot | Interactive AI assistant for investigators | GPT-4o (streaming) |
| 16 | Explainability & Legal Agent | Explain findings for legal review | GPT-4o Structured Output |

---

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework |
| TypeScript 5 (strict) | Type safety |
| CSS Custom Properties | Design system |
| Framer Motion | Animations |
| Space Grotesk + Inter | Typography |
| Lucide React | Icons |
| React Query | Data fetching |

### Backend
| Technology | Purpose |
|---|---|
| NestJS 10 | API framework |
| TypeScript 5 (strict) | Type safety |
| Prisma | PostgreSQL ORM |
| Zod | Runtime validation |
| OpenTelemetry | Observability |
| Swagger / OpenAPI | API documentation |

### Databases
| Database | Purpose |
|---|---|
| PostgreSQL 16 | Primary relational store |
| Neo4j 5 | Knowledge graph |
| Qdrant | Vector / semantic search |
| Redis 7 | Cache, memory, sessions |
| MinIO | Evidence file storage |
| RabbitMQ | Event bus |

### AI
| Service | Purpose |
|---|---|
| OpenAI Responses API (gpt-4o) | Reasoning, vision, planning |
| OpenAI Whisper-1 | Audio transcription |
| OpenAI text-embedding-3-large | Semantic embeddings |
| Anthropic Claude 3.5 | Fallback reasoning |
| PaddleOCR | Text extraction |
| Specialized detection models | Synthetic media detection |
| Ollama (Llama 3) | Offline fallback |

### Infrastructure
| Tool | Purpose |
|---|---|
| pnpm 9 | Package manager |
| Turborepo | Monorepo build orchestration |
| Docker Compose | Local development |
| GitHub Actions | CI/CD |
| Husky + commitlint | Git hooks |
| Prometheus + Grafana | Monitoring |

---

## Architecture Summary

```
Browser (Next.js)
    │ HTTPS
    ▼
NestJS API (apps/api)
    │
    ├── Auth Service (JWT RS256)
    ├── Case Service
    ├── Evidence Service
    ├── Pipeline Orchestrator
    │       │
    │       ▼
    │   RabbitMQ (Event Bus)
    │       │
    │       ▼
    │   Plugin Registry
    │       ├── plugins/evidence-agent/
    │       ├── plugins/content-agent/
    │       ├── plugins/threat-agent/
    │       └── ... (16 agent plugins)
    │               │
    │               ▼
    │           MCP Servers (10 servers)
    │               │
    │               ├── PostgreSQL
    │               ├── Neo4j
    │               ├── Qdrant
    │               ├── Redis
    │               ├── MinIO
    │               └── AI Provider Layer
    │                       │
    │                       ├── OpenAI
    │                       ├── Anthropic (fallback)
    │                       └── Ollama (offline)
    │
    └── WebSocket Gateway (real-time updates → browser)
```

---

## Plugin Philosophy

ACPIA is a **plugin-based investigation operating system**.

Every investigation agent is a plugin that:
1. Implements the `AgentPlugin` interface from `@acpia/agent-sdk`
2. Declares its capabilities in a manifest
3. Communicates with the platform exclusively through MCP servers
4. Communicates with other agents exclusively through RabbitMQ events
5. Can be enabled or disabled via feature flags without redeployment
6. Can be added or replaced without touching core platform code

**Answer to the judge question "How do you extend this platform?"**:  
*"ACPIA is a plugin-based investigation operating system. A new investigative capability is delivered by creating a new plugin in the `plugins/` directory that implements the `AgentPlugin` interface. No core code changes required."*

---

## Development Rules Summary

1. **No `any`** — TypeScript strict mode everywhere
2. **No hardcoded prompts** — Prompt Registry only
3. **No direct AI SDK calls** — AI Provider Layer only
4. **No DB access from agents** — MCP servers only
5. **No direct agent-to-agent calls** — Event Bus only
6. **No AI calls from the frontend** — NestJS API only
7. **No raw SQL** — Prisma ORM only (except pre-approved)
8. **No modifying protected files** — see DO_NOT_TOUCH.md
9. **No TODO without tracking** — format: `// TODO(SPRINT-XX):`
10. **Every PR answers**: Business Goal, Technical Goal, Architecture Impact, Testing, Rollback Plan

Full rules: [CODING_RULES.md](./CODING_RULES.md)

---

## Document Index (Complete)

Read in this order for context. Detailed specifications available in each document.

| Priority | Document | Purpose |
|---|---|---|
| 1 | **[PROJECT_MANIFEST.md](./PROJECT_MANIFEST.md)** | This file — start here |
| 2 | [ENGINEERING_CONTRACT.md](./ENGINEERING_CONTRACT.md) | Master governance |
| 3 | [ARCHITECTURE_PRINCIPLES.md](./ARCHITECTURE_PRINCIPLES.md) | 14 immovable rules |
| 4 | [ONTOLOGY.md](./ONTOLOGY.md) | All investigation entities |
| 5 | [AGENT_CONTRACT.md](./AGENT_CONTRACT.md) | Plugin interface |
| 6 | [API_SPEC.md](./API_SPEC.md) | All REST endpoints |
| 7 | [EVENT_BUS.md](./EVENT_BUS.md) | Agent communication |
| 8 | [AI_PROVIDER.md](./AI_PROVIDER.md) | Unified AI interface |
| 9 | [MCP.md](./MCP.md) | 10 MCP servers |
| 10 | [SECURITY.md](./SECURITY.md) | Auth, encryption, audit |
| 11 | [AI_SAFETY.md](./AI_SAFETY.md) | Hallucination, bias, gates |
| 12 | [AGENT_STATE_MACHINE.md](./AGENT_STATE_MACHINE.md) | Agent lifecycle |
| 13 | [INVESTIGATION_STATE.md](./INVESTIGATION_STATE.md) | Shared state stores |
| 14 | [PROMPT_REGISTRY.md](./PROMPT_REGISTRY.md) | All AI prompts |
| 15 | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, typography, components |
| 16 | [OBSERVABILITY.md](./OBSERVABILITY.md) | Logs, metrics, traces |
| 17 | [FEATURE_FLAGS.md](./FEATURE_FLAGS.md) | All feature toggles |
| 18 | [CODING_RULES.md](./CODING_RULES.md) | TypeScript + Git rules |
| 19 | [EVALUATION.md](./EVALUATION.md) | Agent quality metrics |
| 20 | [COST.md](./COST.md) | AI cost management |
| 21 | [DO_NOT_TOUCH.md](./DO_NOT_TOUCH.md) | Protected files |
| 22 | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) | Sprint completion criteria |
| 23 | [DEMO.md](./DEMO.md) | Hackathon demo script |
| 24 | [ROADMAP.md](./ROADMAP.md) | All 68 sprints |
| — | [adr/](./adr/) | Architecture Decision Records |

---

## Architecture Freeze Status

| Item | Status |
|---|---|
| Sprint -1 (Documentation) | ✅ COMPLETE |
| Architecture Freeze | ✅ LOCKED |
| Modification Policy | ADR required for any change to Tier 1 documents |

---

*Version 1.0.0 — Sprint -1 APPROVED — Architecture Freeze: ✅ COMPLETE*  
*Chief Software Architect signature: LOCKED*

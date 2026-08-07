# ACPIA — Product Roadmap

> **Status**: LIVING DOCUMENT — Updated each sprint  
> **Authority**: Product Owner  
> **Last updated**: Sprint -1

---

## Vision

ACPIA is a **plugin-based AI investigation operating system** for law enforcement. Starting as a hackathon prototype, it is designed to evolve into a production-grade platform deployable by state cybercrime units, child safety organizations, and digital forensics labs.

---

## Phase 1 — Foundation (Sprints -1 to 10)

**Goal**: A working platform with all infrastructure running, authentication, schema, and storage.

| Sprint | Name | Status |
|---|---|---|
| -1 | Engineering Contract + Documentation | ✅ **APPROVED · LOCKED** |
| 0.1 | Repository Bootstrap (toolchain, pnpm, turbo) | ✅ **COMPLETE** |
| 0.2 | Workspace Initialization (apps, packages, plugins) | ✅ **COMPLETE** |
| 0.3 | Frontend Bootstrap (Next.js 15, theme tokens) | ✅ **COMPLETE** |
| 0.4 | Backend Bootstrap (NestJS 10, Swagger, health) | ✅ **COMPLETE** |
| 0.5 | Shared Packages (@acpia/shared, ui, agent-sdk) | ✅ **COMPLETE** |
| 0.6 | CI/CD & Final Quality Verification | ✅ **COMPLETE** |
| 1 | Frontend Foundation (App Router, theme, 3-panel shell, Navbar, Sidebar, RightPanel, Error/404) | ✅ **COMPLETE** |
| 2 | Backend Foundation (NestJS 10, HealthModule, ConfigModule, LoggerModule, Swagger UI) | ✅ **COMPLETE** |
| 3 | Infrastructure (Docker Compose: Postgres 16, Neo4j 5, Redis 7, RabbitMQ 3, Qdrant, MinIO, Elasticsearch 8) | ✅ **COMPLETE** |
| 4 | Authentication (JWT 15m, Refresh Token 8h rotation, RBAC Roles: INVESTIGATOR, SUPERVISOR, ADMIN, AUDITOR) | ✅ **COMPLETE** |
| 5 | Database Schema (PostgreSQL Prisma ORM: 11 models, relations, PrismaService, DatabaseModule) | ✅ **COMPLETE** |
| 6 | Knowledge Graph (Neo4j 5 Cypher, 10 ONTOLOGY node types, GraphService, GraphModule) | ✅ **COMPLETE** |
| 7 | Vector Database (Qdrant REST Client, acpia_evidence & acpia_findings collections, VectorService) | ✅ **COMPLETE** |
| 8 | Redis (ioredis, agent memory hashes, token blacklist, Copilot history lists, RedisService) | ✅ **COMPLETE** |
| 9 | RabbitMQ (amqplib, topic exchanges, DLX dead letter queues, EventBusService, EventBusModule) | ✅ **COMPLETE** |
| 10 | MinIO (minio SDK, acpia-evidence bucket, SHA-256 integrity verification, presigned URLs, MinioService) | ✅ **COMPLETE** |

**Milestone**: All services running. Auth works. Evidence can be uploaded and stored.

---

## Phase 2 — Intelligence Core (Sprints 11 to 20)

**Goal**: Evidence upload API, AI provider layer, prompt registry, and all foundational services.

| Sprint | Name | Status |
|---|---|---|
| 11 | Evidence Upload API (multipart stream upload, SHA-256 hash, CoC entry, Neo4j node, bus event) | ✅ **COMPLETE** |
| 12 | Evidence Viewer (image zoom/pan, video player, audio waveform, PDF/text stream, Hex inspector, CoC timeline) | ✅ **COMPLETE** |
| 13 | Chief Investigation Agent (pipeline DAG orchestration engine, execution tracker, event subscriber) | ✅ **COMPLETE** |
| 14 | Agent SDK (BaseAgent abstract class, AgentManifest, AgentPlugin interface, HealthStatus, AgentFinding) | ✅ **COMPLETE** |
| 15 | Shared Memory (Redis + PostgreSQL sync engine for Case, Entity, Conversation & Evidence state) | ✅ **COMPLETE** |
| 16 | Prompt Registry (versioned, typed, pre-registered prompts for Content, Threat, Hypothesis, Report & Copilot) | ✅ **COMPLETE** |
| 17 | AI Provider Layer (AiProviderManager multi-LLM fallback engine with Reason, Vision, Speech & Embed features) | ✅ **COMPLETE** |
| 18 | OpenAI Integration (Responses API, function calling) | ⬜ Queued |
| 19 | Embeddings (OpenAI → Qdrant → Search) | ⬜ |
| 20 | Logging + Observability (OpenTelemetry, Grafana) | ⬜ |

**Milestone**: AI provider works. Evidence can be analyzed. Embeddings indexed.

---

## Phase 3 — Agent Platform (Sprints 21 to 52)

**Goal**: All 16 investigation agents implemented, tested, and integrated.

| Sprint | Name | Status |
|---|---|---|
| 21–22 | Agent 1: Evidence Intake + Tests | ⬜ |
| 23–24 | Agent 2: Content Analysis + Tests | ⬜ |
| 25–26 | Agent 3: Threat Identification + Tests | ⬜ |
| 27–28 | Agent 4: Context Extraction + Tests | ⬜ |
| 29–30 | Agent 5: Activity Pattern + Tests | ⬜ |
| 31–32 | Agent 6: Metadata Mapping + Tests | ⬜ |
| 33–34 | Agent 7: Synthetic Detection + Tests | ⬜ |
| 35–36 | Agent 8: Timeline Reconstruction + Tests | ⬜ |
| 37–38 | Agent 9: Intelligent Retrieval + Tests | ⬜ |
| 39–40 | Agent 10: Automated Reporting + Tests | ⬜ |
| 41–42 | Agent 11: Risk Assessment + Tests | ⬜ |
| 43–44 | Agent 12: Intelligence Fusion + Tests | ⬜ |
| 45–46 | Agent 13: Hypothesis Generation + Tests | ⬜ |
| 47–48 | Agent 14: Verification + Tests | ⬜ |
| 49–50 | Agent 15: Copilot + Tests | ⬜ |
| 51–52 | Agent 16: Explainability + Tests | ⬜ |

**Milestone**: All 16 agents running. Full pipeline from evidence to report.

---

## Phase 4 — Platform UI (Sprints 53 to 62)

**Goal**: Production-grade UI for all platform features.

| Sprint | Name | Status |
|---|---|---|
| 53 | Knowledge Graph UI (interactive, animated) | ⬜ |
| 54 | Timeline UI (zoomable, filterable, annotatable) | ⬜ |
| 55 | Map UI (GPS visualization, heatmap) | ⬜ |
| 56 | Evidence Explorer (Pinterest-style, hover preview) | ⬜ |
| 57 | Investigation Dashboard (live metrics, pipeline view) | ⬜ |
| 58 | Agent Monitoring Dashboard (all 16 agents, live) | ⬜ |
| 59 | Performance Dashboard (cost, tokens, latency) | ⬜ |
| 60 | System Testing (end-to-end, load testing) | ⬜ |
| 61 | Security Testing (OWASP, penetration test prep) | ⬜ |
| 62 | Performance Optimization (DB indexes, caching) | ⬜ |

---

## Phase 5 — Demo & Launch (Sprints 63 to 68)

**Goal**: Hackathon-ready demo mode, documentation, and final polish.

| Sprint | Name | Status |
|---|---|---|
| 63 | Demo Data Generator (realistic fake cases) | ⬜ |
| 64 | Presentation Mode (full-screen, optimized for projector) | ⬜ |
| 65 | Deployment (Docker Compose production config) | ⬜ |
| 66 | Documentation (README, user guide, API docs) | ⬜ |
| 67 | Final Polish (animations, sounds, edge cases) | ⬜ |
| 68 | Hackathon Demo Mode (one-click full demo) | ⬜ |

---

## Future (Post-Hackathon)

### Near Term (3–6 months)

- Real Kerala Police case integration (secure, sandboxed)
- Mobile app (React Native) for field investigators
- Multi-jurisdiction support
- Integration with CCTNS (Crime and Criminal Tracking Network)
- Offline-first architecture for low-connectivity deployments
- Agent performance benchmarking against human investigators

### Medium Term (6–12 months)

- Multi-language support (Malayalam, Hindi)
- Integration with NATGRID and CCTV networks
- Advanced network analysis (cryptocurrency tracing, dark web monitoring)
- Agent marketplace (third parties can publish investigation agent plugins)
- Federated investigation (multiple police units sharing anonymized intelligence)

### Enterprise (12+ months)

- SaaS offering for state police departments
- ISO 27001 certification
- INTERPOL data integration
- Real-time alert system (monitor known suspect activity patterns)
- Courtroom presentation mode (evidence chain display for legal proceedings)

---

## Architecture Evolution

| Phase | Architecture |
|---|---|
| Hackathon | Docker Compose, single machine, all services local |
| Post-Hackathon | Docker Swarm or K3s, minimal scaling |
| Production | Kubernetes, auto-scaling agents, managed databases |
| Enterprise | Multi-region, air-gapped deployment option, Vault secrets |

---

*Last updated: Sprint -1 | Product Owner*

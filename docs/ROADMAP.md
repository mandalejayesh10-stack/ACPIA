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
| 2 | Backend Foundation (NestJS, health, swagger) | ⬜ Queued |
| 3 | Infrastructure (Docker, all services) | ⬜ Queued |
| 4 | Authentication (JWT, RBAC, refresh tokens) | ⬜ |
| 5 | Database Schema (all tables) | ⬜ |
| 6 | Knowledge Graph (Neo4j nodes + queries) | ⬜ |
| 7 | Vector Database (Qdrant, embeddings API) | ⬜ |
| 8 | Redis (cache, memory, sessions) | ⬜ |
| 9 | RabbitMQ (topics, consumers, workers) | ⬜ |
| 10 | MinIO (buckets, evidence, preview, hash) | ⬜ |

**Milestone**: All services running. Auth works. Evidence can be uploaded and stored.

---

## Phase 2 — Intelligence Core (Sprints 11 to 20)

**Goal**: Evidence upload API, AI provider layer, prompt registry, and all foundational services.

| Sprint | Name | Status |
|---|---|---|
| 11 | Evidence Upload API (upload, preview, delete, hash, CoC) | ⬜ |
| 12 | Evidence Viewer (image, video, audio, PDF, text) | ⬜ |
| 13 | Chief Investigation Agent (orchestration, no AI yet) | ⬜ |
| 14 | Agent SDK (BaseAgent, plugin interface, manifest) | ⬜ |
| 15 | Shared Memory (case, entity, conversation, evidence) | ⬜ |
| 16 | Prompt Registry (versioned, typed, tested) | ⬜ |
| 17 | AI Provider Layer (reason, vision, ocr, speech, embed) | ⬜ |
| 18 | OpenAI Integration (Responses API, function calling) | ⬜ |
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

# ACPIA

> **AI-powered Criminal & Paedophile Investigation Assistant**  
> Government-grade criminal investigation intelligence platform — built for Hac'KP 2026

[![CI](https://github.com/acpia/acpia/actions/workflows/ci.yml/badge.svg)](https://github.com/acpia/acpia/actions/workflows/ci.yml)
[![Architecture Freeze](https://img.shields.io/badge/architecture-frozen-blue)](./docs/ENGINEERING_CONTRACT.md)
[![Sprint](https://img.shields.io/badge/sprint-0.1-brightgreen)](./docs/ROADMAP.md)

---

## What is ACPIA?

ACPIA transforms raw digital evidence into structured criminal intelligence. Upload evidence → 16 specialized AI agents activate → knowledge graph builds → timeline reconstructs → risk assessed → report generated. In real time.

It is not a dashboard. It is not a chatbot. It is a **plugin-based AI investigation operating system**.

---

## Architecture Freeze: ✅ COMPLETE

Sprint -1 documentation is complete and locked. All 26 engineering documents are in [`/docs`](./docs/).

**Start here**: [docs/PROJECT_MANIFEST.md](./docs/PROJECT_MANIFEST.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 · TypeScript · CSS Custom Properties |
| Backend | NestJS 10 · TypeScript · Prisma |
| Knowledge Graph | Neo4j |
| Vector Search | Qdrant |
| Cache / Memory | Redis |
| Evidence Storage | MinIO |
| Event Bus | RabbitMQ |
| AI | OpenAI (gpt-4o, Whisper, Embeddings) · Anthropic (fallback) |
| Monorepo | pnpm · Turborepo |

---

## Project Structure

```
acpia/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── agent-sdk/    # Plugin interface (@acpia/agent-sdk)
│   ├── ai-provider/  # Unified AI abstraction (@acpia/ai-provider)
│   ├── shared/       # Types, schemas, constants (@acpia/shared)
│   └── ui/           # Design system (@acpia/ui)
├── plugins/          # 16 investigation agent plugins
│   ├── evidence-agent/
│   ├── content-agent/
│   └── ...
├── docs/             # All engineering documentation
└── infra/            # Docker Compose, deployment
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop (for Sprint 3 infrastructure)

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Lint

```bash
pnpm lint
```

### Type Check

```bash
pnpm typecheck
```

### Test

```bash
pnpm test
```

### Build

```bash
pnpm build
```

---

## Contributing

1. Read [docs/PROJECT_MANIFEST.md](./docs/PROJECT_MANIFEST.md)
2. Read [docs/ENGINEERING_CONTRACT.md](./docs/ENGINEERING_CONTRACT.md)
3. Read [docs/CODING_RULES.md](./docs/CODING_RULES.md)
4. Check [docs/DO_NOT_TOUCH.md](./docs/DO_NOT_TOUCH.md) before modifying any doc
5. Use the PR template — all fields are required

---

## License

MIT — See [LICENSE](./LICENSE)

---

*Built for [Hac'KP 2026](https://hackp.kerala.gov.in/) — Kerala Police & Cyberdome*

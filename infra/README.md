# ACPIA Infrastructure

> Docker Compose services, deployment configs, and environment templates.

This directory is initialized in **Sprint 3** with Docker Compose bringing up all platform services:

| Service | Image | Port |
|---|---|---|
| PostgreSQL 16 | `postgres:16-alpine` | 5432 |
| Neo4j 5 | `neo4j:5-community` | 7474, 7687 |
| Redis 7 | `redis:7-alpine` | 6379 |
| RabbitMQ 3 | `rabbitmq:3-management` | 5672, 15672 |
| Qdrant | `qdrant/qdrant` | 6333 |
| MinIO | `minio/minio` | 9000, 9001 |
| Elasticsearch | `elasticsearch:8` | 9200 |

## Usage (Sprint 3+)

```bash
docker compose up -d
```

## Environment

Copy `.env.example` to `.env` and fill in values before starting services.

```bash
cp .env.example .env
```

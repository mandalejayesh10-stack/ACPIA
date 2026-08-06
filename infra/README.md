# ACPIA Infrastructure Blueprint

> **Status**: Sprint 3 Complete  
> **Containers**: 7 Services  
> **Command**: `docker compose -f infra/docker-compose.yml up -d`

---

## Service Directory

| # | Service | Container | Ports | Access URL / UI | Credentials (Dev) |
|---|---|---|---|---|---|
| 1 | PostgreSQL 16 | `acpia-postgres` | `5432` | `localhost:5432` | `acpia_admin` / `acpia_secure_password_2026` |
| 2 | Neo4j 5 | `acpia-neo4j` | `7474`, `7687` | `http://localhost:7474` | `neo4j` / `acpia_neo4j_password_2026` |
| 3 | Redis 7 | `acpia-redis` | `6379` | `localhost:6379` | `:acpia_redis_password_2026` |
| 4 | RabbitMQ 3 | `acpia-rabbitmq` | `5672`, `15672` | `http://localhost:15672` | `acpia_bus` / `acpia_rabbitmq_password_2026` |
| 5 | Qdrant | `acpia-qdrant` | `6333` | `http://localhost:6333/dashboard` | None (dev) |
| 6 | MinIO | `acpia-minio` | `9000`, `9001` | `http://localhost:9001` | `acpia_minio_admin` / `acpia_minio_password_2026` |
| 7 | Elasticsearch 8 | `acpia-elasticsearch` | `9200` | `http://localhost:9200` | Security disabled in dev |

---

## Quick Start

### 1. Configure Environment

```bash
cp .env.example .env
```

### 2. Start All Containers

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3. Check Health Status

```bash
docker compose -f infra/docker-compose.yml ps
```

### 4. Stop Infrastructure

```bash
docker compose -f infra/docker-compose.yml down
```

---

*Governed by docs/ENGINEERING_CONTRACT.md & docs/SECURITY.md*

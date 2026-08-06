# ACPIA — Security Blueprint

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Compliance Target**: Government-grade deployment, Kerala Police  
> **Classification**: Internal Engineering Document

---

## Overview

ACPIA handles sensitive criminal investigation data, including child safety evidence. Security is not a feature — it is the foundation. This document defines every security boundary in the platform.

---

## 1. Authentication

### 1.1 Mechanism
- **JWT (JSON Web Tokens)** with RS256 asymmetric signing
- Access token lifetime: **15 minutes**
- Refresh token lifetime: **8 hours** (shift-aligned for police operations)
- Refresh tokens are stored server-side (Redis), enabling revocation
- Refresh token rotation: every use issues a new refresh token and invalidates the old one

### 1.2 Token Structure
```json
{
  "sub": "user-uuid",
  "role": "INVESTIGATOR | SUPERVISOR | ADMIN",
  "caseAccess": ["CASE-001", "CASE-002"],
  "sessionId": "session-uuid",
  "iat": 1700000000,
  "exp": 1700000900
}
```

### 1.3 Multi-Factor Authentication
- MFA is **mandatory** for SUPERVISOR and ADMIN roles
- TOTP (Time-based One-Time Password) via authenticator app
- Backup codes stored encrypted (AES-256)

### 1.4 Session Management
- Concurrent session limit: **2 devices** per user
- Idle timeout: **30 minutes**
- Forced logout on role change or account suspension
- All active sessions visible in user security dashboard

---

## 2. Authorization (RBAC)

### 2.1 Roles

| Role | Description | Permissions |
|---|---|---|
| `INVESTIGATOR` | Field investigator | Create/view cases assigned to them, upload evidence, run agents |
| `SUPERVISOR` | Investigation lead | All investigator permissions + assign cases + view all cases in department |
| `ADMIN` | System administrator | Full platform access + user management + audit log access |
| `AUDITOR` | Read-only compliance | View audit logs + reports only, no data modification |

### 2.2 Case-Level Access Control
Beyond role-based permissions, access to specific cases is restricted by **case assignment**. An INVESTIGATOR cannot view a case they are not assigned to, even if they share the same role as the assignee.

### 2.3 Evidence Access
- Evidence files require both **role permission** AND **case assignment**
- Evidence download is logged every time with user ID, timestamp, IP, and user agent
- Bulk download is disabled for INVESTIGATOR role

### 2.4 Agent Execution
- Only INVESTIGATOR, SUPERVISOR, and ADMIN may trigger agent pipelines
- Agent results are scoped to the case — cross-case contamination is architecturally impossible

---

## 3. Encryption

### 3.1 Data in Transit
- All HTTP traffic: **TLS 1.3** minimum
- Internal service-to-service: mTLS (mutual TLS) in production
- WebSocket connections: WSS only

### 3.2 Data at Rest
- PostgreSQL: **AES-256** column-level encryption for PII fields (names, phone numbers, GPS coordinates)
- MinIO evidence storage: **SSE-S3** (Server-Side Encryption) with AES-256
- Redis: encrypted at-rest using OS-level disk encryption
- Qdrant vectors: encryption at rest enabled

### 3.3 Evidence File Integrity
Every evidence file has:
1. **SHA-256 hash** computed at upload
2. Hash stored in PostgreSQL `evidence` table
3. Hash re-verified before every agent analysis
4. Any hash mismatch → evidence marked TAMPERED, pipeline halted, alert raised

---

## 4. Secrets Management

### 4.1 Development
- Secrets stored in `.env.local` (gitignored)
- `.env.example` committed with placeholder values only
- Never hardcode any key, password, or token

### 4.2 Production
- All secrets stored in **HashiCorp Vault** (or cloud equivalent: AWS Secrets Manager / Azure Key Vault)
- Services fetch secrets at startup via Vault API
- Secret rotation handled by Vault — no service restart required
- Vault audit log tracks every secret access

### 4.3 Secret Categories
| Secret | Storage | Rotation |
|---|---|---|
| OpenAI API Key | Vault | Monthly |
| DB Passwords | Vault | Monthly |
| JWT Private Key | Vault | Quarterly |
| MinIO Access Keys | Vault | Monthly |
| RabbitMQ Credentials | Vault | Monthly |
| MFA Backup Codes | Encrypted DB | On demand |

---

## 5. Audit Logging

Every user action and every agent action is written to the immutable `audit_log` table.

### 5.1 Audit Log Schema
```sql
CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_type    TEXT NOT NULL,  -- 'USER' | 'AGENT' | 'SYSTEM'
  actor_id      UUID NOT NULL,
  action        TEXT NOT NULL,  -- 'EVIDENCE_UPLOAD' | 'AGENT_EXECUTED' | ...
  resource_type TEXT NOT NULL,  -- 'CASE' | 'EVIDENCE' | 'REPORT' | ...
  resource_id   UUID,
  case_id       UUID,
  ip_address    INET,
  user_agent    TEXT,
  metadata      JSONB,
  signature     TEXT NOT NULL   -- HMAC-SHA256 of record contents
);
```

### 5.2 Tamper Detection
Each record includes an HMAC-SHA256 signature computed from all other fields plus a server-side secret. Periodic background jobs validate all signatures. Any invalid record triggers an ADMIN alert.

### 5.3 Retention
- Audit logs: **7 years** (regulatory requirement for criminal investigations)
- Never deleted via application code — deletion requires DBA + ADMIN dual authorization

---

## 6. Data Retention

| Data Type | Retention Period | Deletion Method |
|---|---|---|
| Evidence files | Case lifetime + 5 years | Secure wipe (DoD 5220.22-M) |
| Case records | Case closure + 7 years | Soft delete then archive |
| Audit logs | 7 years | Never deleted |
| AI outputs / reports | Case lifetime + 5 years | Soft delete then archive |
| Refresh tokens | 8 hours | Automatic expiry |
| Session data | 30 minutes idle | Automatic expiry |
| Redis cache | TTL per key | Automatic expiry |

---

## 7. Chain of Custody

Chain of custody is the legal record that evidence has not been altered from collection to court presentation.

### 7.1 Evidence Lifecycle Events
Every evidence item records the following events:
- `COLLECTED` — Initial upload with hash
- `ANALYZED` — Each agent analysis run
- `VIEWED` — Each user access
- `DOWNLOADED` — Each download
- `EXPORTED` — Included in report
- `ARCHIVED` — Case closed
- `TRANSFERRED` — Jurisdiction change

### 7.2 CoC Record Format
```json
{
  "evidenceId": "EV-2024-001",
  "event": "ANALYZED",
  "timestamp": "2024-01-15T10:30:00Z",
  "actor": { "type": "AGENT", "id": "content-analysis-agent-v1.2" },
  "hash": "sha256:abc123...",
  "previousHash": "sha256:xyz789...",
  "details": { "agentOutput": "..." }
}
```

### 7.3 Blockchain-Ready Design
The CoC chain is designed so that each record references the previous hash, creating an append-only cryptographic chain. This is compatible with future blockchain anchoring.

---

## 8. API Security

### 8.1 Rate Limiting
| Endpoint Category | Limit |
|---|---|
| Authentication | 5 requests / minute |
| Evidence upload | 10 files / minute |
| Agent trigger | 5 / minute |
| General API | 100 requests / minute |
| AI endpoints | 20 requests / minute |

### 8.2 Input Validation
- All inputs validated with Zod schemas at the API boundary
- File uploads: MIME type validation + magic bytes check (not just extension)
- SQL injection: ORM parameterized queries only (Prisma)
- XSS: Content-Security-Policy headers + output encoding

### 8.3 CORS Policy
```
Allowed Origins: [ACPIA_FRONTEND_URL]
Allowed Methods: GET, POST, PUT, DELETE, PATCH
Allowed Headers: Authorization, Content-Type, X-Trace-Id
Credentials: true
```

### 8.4 Security Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: [strict policy]
Referrer-Policy: no-referrer
```

---

## 9. MCP Security

MCP (Model Context Protocol) servers expose tools to AI agents. Security for MCP:

- MCP servers run as isolated processes with no direct DB access
- MCP tools are **read-only** by default; write tools require explicit `WRITE_ALLOWED` flag
- All MCP tool calls are logged in the audit log with agent ID and input/output
- MCP servers authenticate using internal service tokens (not user JWTs)
- MCP tool inputs are validated with JSON Schema before execution
- Output size limits enforced to prevent data exfiltration via context

---

## 10. Evidence Integrity

### 10.1 Upload Integrity
1. Client uploads file → NestJS receives stream
2. SHA-256 hash computed server-side during streaming
3. File written to MinIO with hash as object tag
4. Hash stored in PostgreSQL `evidence.hash`
5. ClamAV scan triggered (async)
6. Upload confirmed only after hash stored

### 10.2 Analysis Integrity
Before every agent analysis:
1. Re-download evidence from MinIO
2. Recompute SHA-256
3. Compare to stored hash
4. If mismatch → HALT, create `INTEGRITY_VIOLATION` audit record, alert ADMIN

### 10.3 Report Integrity
Every generated report:
1. Rendered as PDF + JSON
2. SHA-256 of both computed
3. Both hashes stored in `reports.hash`
4. Report PDF digitally signed with platform certificate

---

## 11. Vulnerability Management

- **Dependency scanning**: `pnpm audit` + `npm audit` run in CI on every PR
- **SAST**: ESLint security rules + CodeQL (GitHub Actions)
- **DAST**: OWASP ZAP scan before each major release
- **Penetration testing**: Required before production deployment to Kerala Police

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

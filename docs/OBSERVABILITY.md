# ACPIA — Observability & Monitoring

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Stack**: OpenTelemetry + Prometheus + Grafana + Loki + Tempo

---

## Overview

Every component of ACPIA is observable. Logs, metrics, and traces are collected from the moment the platform starts. The platform is never debugged by guessing — only by data.

```
ACPIA Services
   │
   ├── Logs      → OpenTelemetry → Loki → Grafana
   ├── Metrics   → OpenTelemetry → Prometheus → Grafana
   └── Traces    → OpenTelemetry → Tempo → Grafana
```

---

## 1. Logging

### Log Format (Structured JSON)

Every log entry across every service uses this exact format:

```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "service": "acpia.agents.content-analysis",
  "version": "1.2.0",
  "environment": "production",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "executionId": "exec-uuid",
  "caseId": "CASE-2024-0001",
  "agentId": "content-analysis-agent",
  "message": "Image analysis completed",
  "meta": {
    "evidenceId": "EV-2024-001",
    "durationMs": 1234,
    "confidence": 0.94
  }
}
```

### Log Levels

| Level | When to Use |
|---|---|
| `ERROR` | Unhandled exceptions, failed operations that require human attention |
| `WARN` | Recoverable issues, fallback activations, threshold breaches |
| `INFO` | Normal operational events (agent start, completion, gate requests) |
| `DEBUG` | Detailed execution flow (development only — never in production) |

### What Never Appears in Logs

- API keys or secrets
- JWT tokens
- Evidence file content
- PII (names, phone numbers, addresses)
- Full AI prompt text (only prompt ID + version)

### Log Retention

| Environment | Retention |
|---|---|
| Production | 90 days (application logs) / 7 years (audit logs in PostgreSQL) |
| Staging | 14 days |
| Development | 3 days |

---

## 2. Metrics

All metrics use OpenTelemetry and are exported to Prometheus.

### Platform Metrics

```
# Investigation pipeline
acpia_investigations_total{status}           # total investigations run
acpia_investigations_active                  # currently running
acpia_pipeline_duration_seconds{status}      # histogram

# Agent metrics
acpia_agent_executions_total{agentId, status}
acpia_agent_duration_seconds{agentId}        # histogram
acpia_agent_retries_total{agentId, reason}
acpia_agent_queue_depth{agentId}
acpia_agent_health{agentId}                  # 1=HEALTHY, 0.5=DEGRADED, 0=UNHEALTHY

# AI Provider metrics
acpia_ai_tokens_total{provider, model, method}
acpia_ai_cost_usd_total{provider, model, method}
acpia_ai_latency_seconds{provider, model, method}
acpia_ai_errors_total{provider, method, errorCode}
acpia_ai_fallbacks_total{provider, method, reason}

# Evidence metrics
acpia_evidence_uploaded_total{type}
acpia_evidence_analyzed_total{type}
acpia_evidence_integrity_failures_total
acpia_evidence_size_bytes{type}              # histogram

# API metrics
acpia_http_requests_total{method, route, status}
acpia_http_duration_seconds{method, route}  # histogram
acpia_http_active_requests

# Event bus metrics
acpia_rabbitmq_messages_published_total{topic}
acpia_rabbitmq_messages_consumed_total{topic, status}
acpia_rabbitmq_queue_depth{queue}
acpia_rabbitmq_dlq_depth{queue}

# System metrics
acpia_db_connections{pool}
acpia_cache_hits_total
acpia_cache_misses_total
acpia_minio_operations_total{operation}
```

---

## 3. Distributed Tracing

Every request gets a `traceId` at the API boundary. This trace propagates through:

```
HTTP Request → NestJS API → Event Bus → Agent → MCP Server → AI Provider
     │               │           │          │         │            │
  Span 1          Span 2      Span 3     Span 4    Span 5       Span 6
     └───────────────────────────────────────────────────────────────┘
                           One full trace
```

Traces are stored in Tempo and viewable in Grafana.

### Trace Context Propagation

Using W3C Trace Context standard (`traceparent` header):
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

---

## 4. Grafana Dashboards

### Dashboard 1: Platform Overview

**Purpose**: Real-time health of the entire ACPIA platform

Panels:
- Active investigations (gauge)
- Agent health matrix (heatmap — all 16 agents)
- Pipeline success rate (gauge)
- API request rate (time series)
- API error rate (time series)
- Event bus queue depths (time series)
- DB connection pool utilization (gauge)

---

### Dashboard 2: Agent Monitoring

**Purpose**: Per-agent performance and status

Panels:
- Agent status table (all 16 agents with status, last run, avg duration)
- Execution duration per agent (histogram)
- Error rate per agent (time series)
- Queue depth per agent (time series)
- Retry rate per agent (time series)
- DLQ depth (gauge with alert)

---

### Dashboard 3: AI Token Usage & Cost

**Purpose**: Track AI spending per case, per agent, per model

Panels:
- Total cost today / this week / this month (gauges)
- Cost per case (table — most expensive at top)
- Cost per agent (bar chart)
- Cost per model (pie chart)
- Token usage over time (time series)
- Estimated monthly cost projection (gauge)
- Fallback rate per provider (time series)

---

### Dashboard 4: Investigation Dashboard

**Purpose**: Case-level investigation metrics

Panels:
- Cases by status (pie chart)
- Cases by priority (bar chart)
- Evidence uploaded per day (time series)
- Average pipeline completion time (gauge)
- Risk score distribution (histogram)
- Agent output quality (confidence scores over time)

---

### Dashboard 5: Security Dashboard [ADMIN only]

**Purpose**: Security events and anomalies

Panels:
- Failed login attempts (time series)
- Evidence integrity failures (counter with alert)
- DLQ events (table)
- Audit log events per hour (time series)
- API rate limit hits (time series)
- Human gate approvals vs rejections (bar chart)

---

## 5. Alert Rules

### Critical Alerts (PagerDuty / immediate notification)

| Alert | Condition | Response |
|---|---|---|
| Evidence Tampered | `acpia_evidence_integrity_failures_total > 0` | Halt pipeline, alert ADMIN immediately |
| DLQ Overflow | `acpia_rabbitmq_dlq_depth > 50` | Alert ADMIN, investigate failed agents |
| Agent Down | `acpia_agent_health{agentId} == 0 for 2m` | Alert ADMIN, failover |
| DB Unreachable | DB connection pool at 0 | Alert ADMIN, all operations blocked |
| API Error Rate | `> 10% for 5m` | Alert ADMIN |

### Warning Alerts (Slack notification)

| Alert | Condition | Response |
|---|---|---|
| High AI Cost | Daily cost > budget threshold | Alert ADMIN |
| Slow Pipeline | Pipeline > 10 minutes | Investigate bottleneck agent |
| Degraded Agent | `acpia_agent_health == 0.5 for 5m` | Alert ADMIN |
| High Retry Rate | `acpia_agent_retries_total > 20/hour` | Check agent and provider |
| Low Confidence | Average confidence < 0.6 | Review prompt quality |

---

## 6. Agent Monitoring

Each agent exposes a `/health` endpoint (polled every 30 seconds):

```json
{
  "status": "HEALTHY",
  "agent": "content-analysis-agent",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": [
    { "name": "mcp_evidence", "status": "OK", "latencyMs": 12 },
    { "name": "ai_provider", "status": "OK", "latencyMs": 234 },
    { "name": "event_bus", "status": "OK", "latencyMs": 8 },
    { "name": "memory", "status": "OK", "latencyMs": 5 }
  ],
  "metrics": {
    "executionsToday": 47,
    "averageLatencyMs": 3200,
    "errorRatePercent": 0.0,
    "lastExecutedAt": "2024-01-15T10:28:00Z"
  }
}
```

---

## 7. OpenTelemetry Configuration

```typescript
// telemetry.config.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME,
  traceExporter: new OTLPTraceExporter({ url: process.env.OTLP_ENDPOINT }),
  metricReader: new PrometheusExporter({ port: 9464 }),
})

sdk.start()
```

---

## 8. Health Check Endpoint

`GET /health` (public — no authentication)

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": [
    { "name": "postgres", "status": "OK", "latencyMs": 3 },
    { "name": "neo4j", "status": "OK", "latencyMs": 8 },
    { "name": "redis", "status": "OK", "latencyMs": 2 },
    { "name": "rabbitmq", "status": "OK", "latencyMs": 5 },
    { "name": "qdrant", "status": "OK", "latencyMs": 12 },
    { "name": "minio", "status": "OK", "latencyMs": 15 },
    { "name": "ai_provider", "status": "OK", "latencyMs": 340 }
  ],
  "agents": [
    { "id": "evidence-intake-agent", "status": "HEALTHY" },
    { "id": "content-analysis-agent", "status": "HEALTHY" },
    ...
  ]
}
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*

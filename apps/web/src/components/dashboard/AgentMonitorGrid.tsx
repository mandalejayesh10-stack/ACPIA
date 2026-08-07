'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Layers,
  Search,
} from 'lucide-react'

export interface AgentStatusInfo {
  id: string
  name: string
  sprint: number
  status: 'ONLINE' | 'RUNNING' | 'IDLE'
  confidence: number
  avgLatencyMs: number
  tokensUsed: number
  lastEventPublished: string
}

const ALL_16_AGENTS: AgentStatusInfo[] = [
  {
    id: 'evidence-agent',
    name: 'Agent 1 — Evidence Intake',
    sprint: 21,
    status: 'ONLINE',
    confidence: 1.0,
    avgLatencyMs: 120,
    tokensUsed: 0,
    lastEventPublished: 'acpia.agents.evidence.completed',
  },
  {
    id: 'content-agent',
    name: 'Agent 2 — Content Analysis',
    sprint: 23,
    status: 'ONLINE',
    confidence: 0.94,
    avgLatencyMs: 1450,
    tokensUsed: 3420,
    lastEventPublished: 'acpia.agents.content-analysis.completed',
  },
  {
    id: 'threat-agent',
    name: 'Agent 3 — Threat Identification',
    sprint: 25,
    status: 'ONLINE',
    confidence: 0.96,
    avgLatencyMs: 980,
    tokensUsed: 2150,
    lastEventPublished: 'acpia.agents.threat.completed',
  },
  {
    id: 'context-agent',
    name: 'Agent 4 — Context Extraction',
    sprint: 27,
    status: 'ONLINE',
    confidence: 0.89,
    avgLatencyMs: 1820,
    tokensUsed: 4100,
    lastEventPublished: 'acpia.agents.context.completed',
  },
  {
    id: 'activity-agent',
    name: 'Agent 5 — Activity Pattern',
    sprint: 29,
    status: 'ONLINE',
    confidence: 0.91,
    avgLatencyMs: 1100,
    tokensUsed: 2890,
    lastEventPublished: 'acpia.agents.activity.completed',
  },
  {
    id: 'metadata-agent',
    name: 'Agent 6 — Metadata Mapping',
    sprint: 31,
    status: 'ONLINE',
    confidence: 1.0,
    avgLatencyMs: 45,
    tokensUsed: 0,
    lastEventPublished: 'acpia.agents.metadata.completed',
  },
  {
    id: 'synthetic-agent',
    name: 'Agent 7 — Synthetic Detection',
    sprint: 33,
    status: 'ONLINE',
    confidence: 0.92,
    avgLatencyMs: 1650,
    tokensUsed: 3900,
    lastEventPublished: 'acpia.agents.synthetic.completed',
  },
  {
    id: 'timeline-agent',
    name: 'Agent 8 — Timeline Reconstruction',
    sprint: 35,
    status: 'ONLINE',
    confidence: 0.93,
    avgLatencyMs: 1240,
    tokensUsed: 3120,
    lastEventPublished: 'acpia.agents.timeline.completed',
  },
  {
    id: 'retrieval-agent',
    name: 'Agent 9 — Intelligent Retrieval',
    sprint: 37,
    status: 'ONLINE',
    confidence: 0.95,
    avgLatencyMs: 310,
    tokensUsed: 1540,
    lastEventPublished: 'acpia.agents.retrieval.completed',
  },
  {
    id: 'reporting-agent',
    name: 'Agent 10 — Automated Reporting',
    sprint: 39,
    status: 'ONLINE',
    confidence: 0.97,
    avgLatencyMs: 2400,
    tokensUsed: 6200,
    lastEventPublished: 'acpia.agents.reporting.completed',
  },
  {
    id: 'risk-agent',
    name: 'Agent 11 — Risk Assessment',
    sprint: 41,
    status: 'ONLINE',
    confidence: 0.91,
    avgLatencyMs: 890,
    tokensUsed: 2050,
    lastEventPublished: 'acpia.agents.risk.completed',
  },
  {
    id: 'fusion-agent',
    name: 'Agent 12 — Intelligence Fusion',
    sprint: 43,
    status: 'ONLINE',
    confidence: 0.91,
    avgLatencyMs: 1950,
    tokensUsed: 4800,
    lastEventPublished: 'acpia.agents.fusion.completed',
  },
  {
    id: 'hypothesis-agent',
    name: 'Agent 13 — Hypothesis Generation',
    sprint: 45,
    status: 'ONLINE',
    confidence: 0.92,
    avgLatencyMs: 1580,
    tokensUsed: 3750,
    lastEventPublished: 'acpia.agents.hypothesis.completed',
  },
  {
    id: 'verification-agent',
    name: 'Agent 14 — Verification',
    sprint: 47,
    status: 'ONLINE',
    confidence: 0.97,
    avgLatencyMs: 1120,
    tokensUsed: 2600,
    lastEventPublished: 'acpia.agents.verification.completed',
  },
  {
    id: 'copilot-agent',
    name: 'Agent 15 — Investigation Copilot',
    sprint: 49,
    status: 'ONLINE',
    confidence: 0.94,
    avgLatencyMs: 840,
    tokensUsed: 1980,
    lastEventPublished: 'acpia.agents.copilot.completed',
  },
  {
    id: 'explainability-agent',
    name: 'Agent 16 — Explainability & Legal',
    sprint: 51,
    status: 'ONLINE',
    confidence: 0.98,
    avgLatencyMs: 760,
    tokensUsed: 1820,
    lastEventPublished: 'acpia.agents.explainability.completed',
  },
]

export const AgentMonitorGrid: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Overview Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="glass-card" style={{ padding: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <Cpu style={{ width: '16px', height: '16px', color: 'var(--color-accent-cyan)' }} />
            Total Pipeline Agents
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px' }}>16 / 16 READY</div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <CheckCircle2
              style={{ width: '16px', height: '16px', color: 'var(--color-success)' }}
            />
            Pipeline Health
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              marginTop: '6px',
              color: 'var(--color-success)',
            }}
          >
            100% OPERATIONAL
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <Zap style={{ width: '16px', height: '16px', color: 'var(--color-warning)' }} />
            Avg DAG Latency
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px' }}>1.14s / agent</div>
        </div>

        <div className="glass-card" style={{ padding: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <Activity style={{ width: '16px', height: '16px', color: 'var(--color-purple)' }} />
            Total Tokens Consumed
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px' }}>44,510</div>
        </div>
      </div>

      {/* Grid of 16 Agents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {ALL_16_AGENTS.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="glass-card"
            style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--color-success-dim)',
                  color: 'var(--color-success)',
                }}
              >
                {agent.status}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                Sprint {agent.sprint}
              </span>
            </div>

            <h4
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {agent.name}
            </h4>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                padding: '8px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Confidence:</span>
                <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 600 }}>
                  {(agent.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Avg Latency:</span>
                <span>{agent.avgLatencyMs} ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Tokens Used:</span>
                <span>{agent.tokensUsed ? agent.tokensUsed.toLocaleString() : '0 (No-LLM)'}</span>
              </div>
            </div>

            <span
              style={{
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              PUB: {agent.lastEventPublished}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { Bot, ShieldAlert, Sparkles, Send } from 'lucide-react'
import { RiskBadge, StatusChip } from '@acpia/ui'

export const RightPanel: React.FC = () => {
  const [copilotQuery, setCopilotQuery] = React.useState('')

  return (
    <aside
      style={{
        width: '320px',
        background: 'var(--color-bg-surface)',
        borderLeft: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        height: 'calc(100vh - 56px)',
        position: 'sticky',
        top: '56px',
        overflowY: 'auto',
      }}
    >
      {/* Top: Chief Agent Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div
          className="glass-card"
          style={{
            padding: 'var(--space-4)',
            border: '1px solid var(--color-border-accent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Bot style={{ width: '22px', height: '22px', color: 'var(--color-accent-cyan)' }} />
            <div>
              <h3 style={{ fontSize: '14px', margin: 0 }}>Chief Orchestration Agent</h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                GPT-4o Responses API
              </span>
            </div>
          </div>
          <StatusChip status="running" label="Analyzing 8 evidence files..." />
        </div>

        {/* Risk Score Gauge */}
        <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert
                style={{ width: '18px', height: '18px', color: 'var(--color-danger)' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>CASE RISK LEVEL</span>
            </div>
            <RiskBadge score={8.7} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Threat: Grooming pattern detected (94% confidence). Requires SUPERVISOR approval.
          </div>
        </div>

        {/* Recent Agent Activity */}
        <div>
          <h4
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            AGENT ACTIVITY STREAM
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <div
              style={{
                padding: '8px',
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '2px solid var(--color-success)',
              }}
            >
              <div style={{ fontWeight: 500 }}>Agent 1: Evidence Intake</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                Validated 8 files · Hashes verified
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '2px solid var(--color-accent-cyan)',
              }}
            >
              <div style={{ fontWeight: 500 }}>Agent 2: Content Analysis</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
                3 faces detected · Audio transcribed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Copilot Prompt Input */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Sparkles style={{ width: '16px', height: '16px', color: 'var(--color-purple)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-purple)' }}>
            INVESTIGATION COPILOT
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-bg-input)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 10px',
          }}
        >
          <input
            type="text"
            placeholder="Ask Copilot a question..."
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              width: '100%',
            }}
          />
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Send style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>
    </aside>
  )
}

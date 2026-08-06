'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Button, StatusChip, RiskBadge } from '@acpia/ui'
import { Play, Package, Network, Clock, ShieldAlert } from 'lucide-react'

export default function Home() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Header Title & Run Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Investigation Overview</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Case 2024-001 · Kerala Cyberdome Division
            </p>
          </div>

          <Button variant="primary" size="md">
            <Play style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Run Full Pipeline
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
            >
              <Package
                style={{ width: '20px', height: '20px', color: 'var(--color-accent-cyan)' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Evidence Files
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>8</div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
            >
              <Clock style={{ width: '20px', height: '20px', color: 'var(--color-warning)' }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Timeline Events
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>12</div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
            >
              <Network style={{ width: '20px', height: '20px', color: 'var(--color-purple)' }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Graph Entities
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>15</div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-4)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
            >
              <ShieldAlert
                style={{ width: '20px', height: '20px', color: 'var(--color-danger)' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Threat Score
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RiskBadge score={8.7} />
            </div>
          </div>
        </div>

        {/* Main Content Workspace Preview */}
        <div
          className="glass-card"
          style={{
            padding: 'var(--space-6)',
            minHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <StatusChip status="running" label="Investigation Pipeline Ready" />
          <h2 style={{ fontSize: '20px', marginTop: '16px', marginBottom: '8px' }}>
            Interactive Workspace Foundation
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', fontSize: '14px' }}>
            Upload evidence files to begin automated AI agent orchestration across Neo4j, Qdrant,
            and PostgreSQL state stores.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

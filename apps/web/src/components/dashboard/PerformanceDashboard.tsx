'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  DollarSign,
  Cpu,
  Clock,
  TrendingUp,
  Server,
  Database,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'

export const PerformanceDashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top 4 Performance KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="glass-card" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <DollarSign style={{ width: '18px', height: '18px', color: 'var(--color-success)' }} />
            Total Case AI Cost
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginTop: '6px',
              color: 'var(--color-text-primary)',
            }}
          >
            $0.142 USD
          </div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px',
            }}
          >
            <TrendingUp style={{ width: '12px', height: '12px' }} /> 98% lower than manual forensics
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <Cpu style={{ width: '18px', height: '18px', color: 'var(--color-accent-cyan)' }} />
            GPT-4o Tokens Used
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginTop: '6px',
              color: 'var(--color-text-primary)',
            }}
          >
            44,510
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
            Prompt: 31.2k · Completion: 13.3k
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <Clock style={{ width: '18px', height: '18px', color: 'var(--color-warning)' }} />
            End-to-End Pipeline Time
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginTop: '6px',
              color: 'var(--color-text-primary)',
            }}
          >
            18.2s
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-warning)', marginTop: '4px' }}>
            16 Parallel & DAG Agents
          </span>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
            }}
          >
            <ShieldCheck style={{ width: '18px', height: '18px', color: 'var(--color-purple)' }} />
            Air-Gapped Fallback
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginTop: '6px',
              color: 'var(--color-success)',
            }}
          >
            READY
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
            Llama3.1 70B Local Engine
          </span>
        </div>
      </div>

      {/* Latency & Token Breakdown by Component */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Latency Breakdown Bar Chart Visual */}
        <div
          className="glass-card"
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <BarChart3
                style={{ width: '18px', height: '18px', color: 'var(--color-accent-cyan)' }}
              />
              Agent Latency Breakdown (ms)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                name: 'Agent 2: Content Analysis (Vision)',
                latency: 1450,
                color: 'var(--color-accent-cyan)',
              },
              { name: 'Agent 4: Context Extraction', latency: 1820, color: 'var(--color-purple)' },
              {
                name: 'Agent 7: Synthetic Detection',
                latency: 1650,
                color: 'var(--color-warning)',
              },
              {
                name: 'Agent 10: Automated Reporting',
                latency: 2400,
                color: 'var(--color-danger)',
              },
              { name: 'Agent 12: Intelligence Fusion', latency: 1950, color: '#ec4899' },
            ].map((item) => (
              <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                    {item.latency} ms
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(item.latency / 2500) * 100}%`,
                      background: item.color,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-out',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure & Database Health */}
        <div
          className="glass-card"
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Server style={{ width: '18px', height: '18px', color: 'var(--color-success)' }} />
            Data Layer Latency & Cache Hit Ratio
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    PostgreSQL (Relational State)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    Prisma ORM · Index Optimized
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-success)' }}>
                2.4 ms
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database style={{ width: '16px', height: '16px', color: '#a855f7' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Neo4j (Knowledge Graph)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    Cypher Queries · Bolt Protocol
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-success)' }}>
                4.1 ms
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database style={{ width: '16px', height: '16px', color: '#06b6d4' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Qdrant (Vector Database)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    Cosine Similarity · 1536-dim
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-success)' }}>
                6.8 ms
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    Redis (Shared Memory Cache)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    94.2% Cache Hit Ratio
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-success)' }}>
                0.8 ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

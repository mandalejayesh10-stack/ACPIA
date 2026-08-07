'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { AgentMonitorGrid } from '@/components/dashboard/AgentMonitorGrid'

export default function AgentsDashboardPage() {
  return (
    <AppLayout activeTab="agents">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
            16 Investigation Agents Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Real-Time Agent DAG Monitoring, Metrics & Event Pipeline State
          </p>
        </div>

        <AgentMonitorGrid />
      </div>
    </AppLayout>
  )
}

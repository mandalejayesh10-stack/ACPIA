'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PerformanceDashboard } from '@/components/dashboard/PerformanceDashboard'

export default function PerformancePage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
            System Performance & AI Cost Metrics
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Real-Time Token Usage, Model Latency & Data Layer Performance · Case 2024-001
          </p>
        </div>

        <PerformanceDashboard />
      </div>
    </AppLayout>
  )
}

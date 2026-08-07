'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { TimelineViewer } from '@/components/timeline/TimelineViewer'

export default function TimelinePage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
            Chronological Investigation Timeline
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Event Reconstruction & Annotatable Timeline · Case 2024-001
          </p>
        </div>

        <TimelineViewer />
      </div>
    </AppLayout>
  )
}

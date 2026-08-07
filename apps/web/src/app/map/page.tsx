'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { GeoMapViewer } from '@/components/map/GeoMapViewer'

export default function MapPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Geospatial Intelligence Map</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            GPS Visualization, Cell Tower Triangulation & Crime Density Heatmap · Case 2024-001
          </p>
        </div>

        <GeoMapViewer />
      </div>
    </AppLayout>
  )
}

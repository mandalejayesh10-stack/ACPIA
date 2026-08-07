'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph'

export default function KnowledgeGraphPage() {
  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>Knowledge Graph</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Interactive Neo4j Entity Relationship Visualization · Case 2024-001
          </p>
        </div>

        <KnowledgeGraph />
      </div>
    </AppLayout>
  )
}

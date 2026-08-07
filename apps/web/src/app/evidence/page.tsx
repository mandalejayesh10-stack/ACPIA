'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { EvidenceList } from '@/components/evidence/EvidenceList'
import { EvidenceGrid } from '@/components/evidence/EvidenceGrid'
import { EvidenceViewer, EvidenceItem } from '@/components/evidence/EvidenceViewer'
import { Upload, LayoutGrid, List } from 'lucide-react'

const MOCK_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'EV-2024-0001',
    caseId: 'CASE-2024-0001',
    fileName: 'Suspect_Chat_Log_Export.json',
    mimeType: 'application/json',
    sizeBytes: 1542000,
    hashSha256: 'a4f891b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    status: 'VALIDATED',
    createdAt: '2026-08-07T01:30:00.000Z',
  },
  {
    id: 'EV-2024-0002',
    caseId: 'CASE-2024-0001',
    fileName: 'Landmark_Land_Rover_GPS.png',
    mimeType: 'image/png',
    sizeBytes: 3420000,
    hashSha256: 'b8f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
    status: 'ANALYZED',
    createdAt: '2026-08-07T01:45:00.000Z',
  },
  {
    id: 'EV-2024-0003',
    caseId: 'CASE-2024-0001',
    fileName: 'Extracted_Voicemail_Threat.mp3',
    mimeType: 'audio/mp3',
    sizeBytes: 8900000,
    hashSha256: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
    status: 'FLAGGED',
    createdAt: '2026-08-07T02:00:00.000Z',
  },
]

export default function EvidencePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null)

  return (
    <AppLayout activeTab="evidence">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>
              Evidence Explorer
            </h1>
            <p
              style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}
            >
              Case: <strong style={{ color: 'var(--color-accent-cyan)' }}>CASE-2024-0001</strong> ·
              Cryptographic Chain of Custody active
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '2px',
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'grid' ? 'var(--color-accent-cyan-dim)' : 'transparent',
                  color:
                    viewMode === 'grid' ? 'var(--color-accent-cyan)' : 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                <LayoutGrid style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === 'list' ? 'var(--color-accent-cyan-dim)' : 'transparent',
                  color:
                    viewMode === 'list' ? 'var(--color-accent-cyan)' : 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                <List style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--color-accent-cyan)',
                color: '#050816',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Upload style={{ width: '16px', height: '16px' }} />
              <span>Upload New Evidence</span>
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        {viewMode === 'grid' ? (
          <EvidenceGrid />
        ) : (
          <EvidenceList
            items={MOCK_EVIDENCE_ITEMS}
            onSelectEvidence={(item) => setSelectedItem(item)}
          />
        )}

        {selectedItem && (
          <EvidenceViewer evidence={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </div>
    </AppLayout>
  )
}

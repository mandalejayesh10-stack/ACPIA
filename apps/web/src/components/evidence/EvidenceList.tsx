'use client'

import React, { useState } from 'react'
import { Search, Grid, List, Image as ImageIcon, Video, FileText } from 'lucide-react'
import { StatusChip } from '@acpia/ui'
import { EvidenceItem } from './EvidenceViewer'

export interface EvidenceListProps {
  items: EvidenceItem[]
  onSelectEvidence: (item: EvidenceItem) => void
}

export const EvidenceList: React.FC<EvidenceListProps> = ({ items, onSelectEvidence }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedFilter === 'ALL') return matchesSearch
    if (selectedFilter === 'IMAGE') return matchesSearch && item.mimeType.startsWith('image/')
    if (selectedFilter === 'VIDEO') return matchesSearch && item.mimeType.startsWith('video/')
    if (selectedFilter === 'AUDIO') return matchesSearch && item.mimeType.startsWith('audio/')
    return matchesSearch
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'var(--color-bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              flex: 1,
              maxWidth: '400px',
            }}
          >
            <Search
              style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }}
            />
            <input
              type="text"
              placeholder="Search evidence files by name, hash, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#FFF',
                fontSize: '13px',
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'IMAGE', 'VIDEO', 'AUDIO'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: selectedFilter === filter ? 600 : 400,
                  background:
                    selectedFilter === filter
                      ? 'var(--color-accent-cyan-dim)'
                      : 'var(--color-bg-card)',
                  border:
                    selectedFilter === filter
                      ? '1px solid var(--color-border-accent)'
                      : '1px solid var(--color-border-default)',
                  color:
                    selectedFilter === filter
                      ? 'var(--color-accent-cyan)'
                      : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'grid' ? 'var(--color-bg-card)' : 'transparent',
              border: 'none',
              color:
                viewMode === 'grid' ? 'var(--color-accent-cyan)' : 'var(--color-text-tertiary)',
              cursor: 'pointer',
            }}
          >
            <Grid style={{ width: '18px', height: '18px' }} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'list' ? 'var(--color-bg-card)' : 'transparent',
              border: 'none',
              color:
                viewMode === 'list' ? 'var(--color-accent-cyan)' : 'var(--color-text-tertiary)',
              cursor: 'pointer',
            }}
          >
            <List style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEvidence(item)}
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  height: '140px',
                  background: '#040715',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid var(--color-border-default)',
                }}
              >
                {item.mimeType.startsWith('image/') ? (
                  <ImageIcon
                    style={{ width: '40px', height: '40px', color: 'var(--color-accent-cyan)' }}
                  />
                ) : item.mimeType.startsWith('video/') ? (
                  <Video
                    style={{ width: '40px', height: '40px', color: 'var(--color-accent-cyan)' }}
                  />
                ) : (
                  <FileText
                    style={{ width: '40px', height: '40px', color: 'var(--color-accent-cyan)' }}
                  />
                )}
              </div>

              <div style={{ padding: '12px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#FFF',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.fileName}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </div>
                <StatusChip status="completed" label={item.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEvidence(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText style={{ color: 'var(--color-accent-cyan)' }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#FFF', fontSize: '13px' }}>
                    {item.fileName}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    SHA-256: {item.hashSha256}
                  </div>
                </div>
              </div>

              <StatusChip status="completed" label={item.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

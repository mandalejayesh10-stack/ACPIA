'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  FileCode,
  ShieldCheck,
  Hash,
  Eye,
  Download,
  Copy,
  Check,
  Filter,
  Search,
} from 'lucide-react'

export interface EvidenceGridItem {
  id: string
  fileName: string
  mimeType: string
  sizeFormatted: string
  hashSha256: string
  status: 'VALIDATED' | 'ANALYZED' | 'FLAGGED' | 'CRITICAL'
  createdAt: string
  thumbnailBg?: string
  extractedTextPreview?: string
  riskScore?: number
}

const GRID_ITEMS: EvidenceGridItem[] = [
  {
    id: 'EVD-001',
    fileName: 'Telegram_Chat_Export.json',
    mimeType: 'application/json',
    sizeFormatted: '2.4 MB',
    hashSha256: 'a4f891b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    status: 'FLAGGED',
    createdAt: '2026-07-12T14:32:00Z',
    extractedTextPreview: 'Suspect: "Pay 0.5 BTC or images will be shared online within 24h..."',
    riskScore: 92,
  },
  {
    id: 'EVD-002',
    fileName: 'Landmark_Land_Rover_GPS.png',
    mimeType: 'image/png',
    sizeFormatted: '3.4 MB',
    hashSha256: 'b8f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
    status: 'ANALYZED',
    createdAt: '2026-07-13T09:15:00Z',
    thumbnailBg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    extractedTextPreview:
      'GPT-4o Vision: Detected vehicle registration KL-07-CC-4912 near Chinese Fishing Nets.',
    riskScore: 78,
  },
  {
    id: 'EVD-003',
    fileName: 'Voicemail_Extortion_Threat.mp3',
    mimeType: 'audio/mp3',
    sizeFormatted: '8.9 MB',
    hashSha256: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
    status: 'CRITICAL',
    createdAt: '2026-07-14T21:44:00Z',
    extractedTextPreview:
      'Whisper AI Audio Transcript: "I am giving you until tomorrow morning..."',
    riskScore: 96,
  },
  {
    id: 'EVD-004',
    fileName: 'Device_Syslog_Dump.log',
    mimeType: 'text/plain',
    sizeFormatted: '1.1 MB',
    hashSha256: 'd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
    status: 'VALIDATED',
    createdAt: '2026-07-15T08:00:00Z',
    extractedTextPreview: 'System Log: Bluetooth MAC connection established with Galaxy S22.',
  },
]

export const EvidenceGrid: React.FC = () => {
  const [items] = useState<EvidenceGridItem[]>(GRID_ITEMS)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'IMAGES' && item.mimeType.startsWith('image/')) ||
      (filterType === 'AUDIO' && item.mimeType.startsWith('audio/')) ||
      (filterType === 'TEXT' && (item.mimeType.includes('json') || item.mimeType.includes('plain')))
    return matchesSearch && matchesFilter
  })

  const getMimeIcon = (mime: string) => {
    if (mime.startsWith('image/')) return ImageIcon
    if (mime.startsWith('audio/')) return Music
    if (mime.startsWith('video/')) return Video
    if (mime.includes('json') || mime.includes('log')) return FileCode
    return FileText
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Search & Filter Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}
        >
          <Search style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search evidence files, hashes, SHA-256..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
          {['ALL', 'IMAGES', 'AUDIO', 'TEXT'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                border:
                  filterType === f ? '1px solid var(--color-accent-cyan)' : '1px solid transparent',
                background:
                  filterType === f ? 'var(--color-accent-cyan-dim)' : 'rgba(255,255,255,0.03)',
                color:
                  filterType === f ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Pinterest-Style Masonry Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {filtered.map((item, idx) => {
          const Icon = getMimeIcon(item.mimeType)

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--color-border-default)',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Media Thumbnail Box */}
              <div
                style={{
                  height: '140px',
                  background:
                    item.thumbnailBg ||
                    'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.7) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Icon style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.7)' }} />

                {/* Risk Badge */}
                {item.riskScore && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background:
                        item.riskScore > 90 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(234, 179, 8, 0.9)',
                      color: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    Risk {item.riskScore}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div
                style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span
                    style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent-cyan)' }}
                  >
                    {item.id}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {item.sizeFormatted}
                  </span>
                </div>

                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    wordBreak: 'break-all',
                  }}
                >
                  {item.fileName}
                </h4>

                {item.extractedTextPreview && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.extractedTextPreview}
                  </p>
                )}

                {/* Hash Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
                    SHA256: {item.hashSha256.slice(0, 10)}...
                  </span>
                  <button
                    onClick={() => handleCopyHash(item.id, item.hashSha256)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent-cyan)',
                      cursor: 'pointer',
                    }}
                    title="Copy SHA-256 Hash"
                  >
                    {copiedId === item.id ? (
                      <Check style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <Copy style={{ width: '12px', height: '12px' }} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

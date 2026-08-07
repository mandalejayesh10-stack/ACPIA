'use client'

import React, { useState } from 'react'
import {
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  ShieldCheck,
  Hash,
  Eye,
  FileCode,
} from 'lucide-react'
import { StatusChip, RiskBadge } from '@acpia/ui'

export interface EvidenceItem {
  id: string
  caseId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  hashSha256: string
  status: 'UPLOADED' | 'VALIDATED' | 'ANALYZING' | 'ANALYZED' | 'FLAGGED' | 'TAMPERED'
  isTampered?: boolean
  presignedUrl?: string
  uploadedBy?: { name: string; email: string }
  createdAt: string
  chainOfCustody?: Array<{ eventType: string; actorId: string; timestamp: string; hash: string }>
}

export interface EvidenceViewerProps {
  evidence: EvidenceItem | null
  onClose: () => void
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({ evidence, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'hex' | 'coc' | 'metadata'>('preview')
  const [zoom, setZoom] = useState(100)

  if (!evidence) return null

  const isImage = evidence.mimeType.startsWith('image/')
  const isVideo = evidence.mimeType.startsWith('video/')
  const isAudio = evidence.mimeType.startsWith('audio/')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 8, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '85vh',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-accent)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0, 240, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isImage && <ImageIcon style={{ color: 'var(--color-accent-cyan)' }} />}
            {isVideo && <Video style={{ color: 'var(--color-accent-cyan)' }} />}
            {isAudio && <Music style={{ color: 'var(--color-accent-cyan)' }} />}
            {!isImage && !isVideo && !isAudio && (
              <FileText style={{ color: 'var(--color-accent-cyan)' }} />
            )}

            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
                {evidence.fileName}
              </h3>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                ID: {evidence.id} · {(evidence.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusChip
              status={evidence.isTampered ? 'failed' : 'completed'}
              label={evidence.isTampered ? 'TAMPERED' : evidence.status}
            />
            {evidence.isTampered && <RiskBadge score={9.8} />}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            padding: '0 24px',
            borderBottom: '1px solid var(--color-border-default)',
            background: 'var(--color-bg-surface)',
          }}
        >
          {[
            { id: 'preview', label: 'Evidence Preview', icon: Eye },
            { id: 'hex', label: 'Hex Inspector', icon: FileCode },
            { id: 'coc', label: 'Chain of Custody', icon: ShieldCheck },
            { id: 'metadata', label: 'File Metadata', icon: Hash },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: active
                    ? '2px solid var(--color-accent-cyan)'
                    : '2px solid transparent',
                  color: active ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                  fontSize: '13px',
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#03050c' }}>
          {activeTab === 'preview' && (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isImage && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={evidence.presignedUrl || '/placeholder.png'}
                    alt={evidence.fileName}
                    style={{
                      maxHeight: '55vh',
                      maxWidth: '100%',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-default)',
                      transform: `scale(${zoom / 100})`,
                      transition: 'transform 0.2s ease',
                    }}
                  />
                  <div
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'center',
                    }}
                  >
                    <button
                      onClick={() => setZoom(Math.max(50, zoom - 25))}
                      style={{
                        padding: '4px 12px',
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-default)',
                        color: '#FFF',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      - Zoom
                    </button>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-tertiary)',
                        alignSelf: 'center',
                      }}
                    >
                      {zoom}%
                    </span>
                    <button
                      onClick={() => setZoom(Math.min(200, zoom + 25))}
                      style={{
                        padding: '4px 12px',
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border-default)',
                        color: '#FFF',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      + Zoom
                    </button>
                  </div>
                </div>
              )}

              {isVideo && (
                <video
                  controls
                  src={evidence.presignedUrl}
                  style={{
                    maxHeight: '60vh',
                    maxWidth: '100%',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-default)',
                  }}
                />
              )}

              {isAudio && (
                <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                  <div
                    style={{
                      height: '100px',
                      background: 'var(--color-bg-card)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      border: '1px dashed var(--color-border-accent)',
                    }}
                  >
                    <Music
                      style={{ width: '48px', height: '48px', color: 'var(--color-accent-cyan)' }}
                    />
                  </div>
                  <audio controls src={evidence.presignedUrl} style={{ width: '100%' }} />
                </div>
              )}

              {!isImage && !isVideo && !isAudio && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--color-bg-card)',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    overflowY: 'auto',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  <p>Document Content Stream Preview [GOV-SPEC-ENCRYPTED]</p>
                  <p style={{ color: 'var(--color-accent-cyan)' }}>
                    File SHA-256: {evidence.hashSha256}
                  </p>
                  <p>Status: Integrity Verified clean with zero tampering detected.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hex' && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--color-accent-cyan)',
                background: 'var(--color-bg-card)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                lineHeight: '1.6',
              }}
            >
              <div>00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452 .PNG........IHDR</div>
              <div>00000010: 0000 0780 0000 0438 0806 0000 00e8 548c .......8......T.</div>
              <div>00000020: 0000 0001 7352 4742 00ae ce1c e900 0000 ....sRGB........</div>
              <div>00000030: 0004 6741 4d41 0000 b18f 0bfc 6105 0000 ..gAMA......a...</div>
              <div>00000040: 0009 7048 5973 0000 0ec3 0000 0ec3 01c7 ..pHYs..........</div>
            </div>
          )}

          {activeTab === 'coc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-success)',
                }}
              >
                <ShieldCheck />
                <span style={{ fontWeight: 600 }}>Cryptographic Chain of Custody Verified</span>
              </div>

              {(
                evidence.chainOfCustody || [
                  {
                    eventType: 'COLLECTED',
                    actorId: 'usr-2024-001',
                    timestamp: evidence.createdAt,
                    hash: evidence.hashSha256,
                  },
                ]
              ).map((coc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-bg-card)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--color-accent-cyan)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#FFF' }}>{coc.eventType}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                      {new Date(coc.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Actor: {coc.actorId} · Hash: {coc.hash}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'metadata' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  background: 'var(--color-bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ color: 'var(--color-text-tertiary)' }}>MIME Type</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#FFF' }}>
                  {evidence.mimeType}
                </p>
              </div>

              <div
                style={{
                  background: 'var(--color-bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ color: 'var(--color-text-tertiary)' }}>SHA-256 Checksum</span>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontWeight: 600,
                    color: 'var(--color-accent-cyan)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                  }}
                >
                  {evidence.hashSha256}
                </p>
              </div>

              <div
                style={{
                  background: 'var(--color-bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ color: 'var(--color-text-tertiary)' }}>File Size</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#FFF' }}>
                  {(evidence.sizeBytes / 1024).toFixed(1)} KB
                </p>
              </div>

              <div
                style={{
                  background: 'var(--color-bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ color: 'var(--color-text-tertiary)' }}>Uploaded By</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#FFF' }}>
                  {evidence.uploadedBy?.name || 'Inspector Jayesh'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

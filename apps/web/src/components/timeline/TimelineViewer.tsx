'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Filter,
  Search,
  Plus,
  MessageSquare,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react'

export interface TimelineEventItem {
  id: string
  timestamp: string
  title: string
  description: string
  category: 'COMMUNICATION' | 'EVIDENCE' | 'THREAT' | 'LOCATION' | 'SYSTEM'
  actor: string
  confidence: number
  evidenceRef?: string
  annotations?: string[]
}

const INITIAL_EVENTS: TimelineEventItem[] = [
  {
    id: 'evt-1',
    timestamp: '2026-07-12T14:32:00Z',
    title: 'First Contact via Telegram',
    description: 'Suspect @dark_phantom_99 initiated conversation with victim via encrypted chat.',
    category: 'COMMUNICATION',
    actor: 'Vikram "Phantom" S.',
    confidence: 0.95,
    evidenceRef: 'EVD-001',
    annotations: ['Verified by Telegram metadata export', 'Matching IP 185.220.101.4'],
  },
  {
    id: 'evt-2',
    timestamp: '2026-07-13T09:15:22Z',
    title: 'Media Transfer — Screenshot Sent',
    description: 'Victim transmitted requested photo file under coercive influence.',
    category: 'EVIDENCE',
    actor: 'Ananya R. (Victim)',
    confidence: 0.98,
    evidenceRef: 'EVD-002',
    annotations: ['EXIF extraction places location at Ernakulam Tower cell zone'],
  },
  {
    id: 'evt-3',
    timestamp: '2026-07-14T21:44:10Z',
    title: 'Extortion Demand Issued',
    description: 'Suspect demanded 0.5 BTC ransom payment with threat of public release.',
    category: 'THREAT',
    actor: 'Vikram "Phantom" S.',
    confidence: 0.92,
    evidenceRef: 'EVD-003',
    annotations: ['Flagged by Threat Identification Agent (Sprint 25)'],
  },
  {
    id: 'evt-4',
    timestamp: '2026-07-15T08:00:00Z',
    title: 'Cyberdome Evidence Intake',
    description: 'Official case registration and evidence hash verification in ACPIA platform.',
    category: 'SYSTEM',
    actor: 'Kerala Cyberdome Agent 1',
    confidence: 1.0,
    evidenceRef: 'EVD-004',
  },
]

const CATEGORY_COLORS: Record<TimelineEventItem['category'], string> = {
  COMMUNICATION: 'var(--color-accent-cyan)',
  EVIDENCE: 'var(--color-purple)',
  THREAT: 'var(--color-danger)',
  LOCATION: 'var(--color-success)',
  SYSTEM: 'var(--color-warning)',
}

export const TimelineViewer: React.FC = () => {
  const [events, setEvents] = useState<TimelineEventItem[]>(INITIAL_EVENTS)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [newAnnotation, setNewAnnotation] = useState<Record<string, string>>({})

  const filteredEvents = events.filter((evt) => {
    const matchesCategory = selectedCategory === 'ALL' || evt.category === selectedCategory
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.actor.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addAnnotation = (eventId: string) => {
    const text = newAnnotation[eventId]
    if (!text?.trim()) return

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, annotations: [...(e.annotations || []), text.trim()] } : e
      )
    )
    setNewAnnotation((prev) => ({ ...prev, [eventId]: '' }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Filter Bar */}
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
            placeholder="Search timeline events, actors..."
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
          {['ALL', 'COMMUNICATION', 'EVIDENCE', 'THREAT', 'LOCATION', 'SYSTEM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                border:
                  selectedCategory === cat
                    ? '1px solid var(--color-accent-cyan)'
                    : '1px solid transparent',
                background:
                  selectedCategory === cat
                    ? 'var(--color-accent-cyan-dim)'
                    : 'rgba(255,255,255,0.03)',
                color:
                  selectedCategory === cat
                    ? 'var(--color-accent-cyan)'
                    : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Event Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        {/* Timeline Center Line */}
        <div
          style={{
            position: 'absolute',
            left: '28px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            background:
              'linear-gradient(180deg, var(--color-accent-cyan) 0%, rgba(6, 182, 212, 0.1) 100%)',
          }}
        />

        {filteredEvents.map((evt, idx) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card"
            style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              marginLeft: '12px',
              position: 'relative',
            }}
          >
            {/* Timeline Dot */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-bg-surface)',
                border: `2px solid ${CATEGORY_COLORS[evt.category]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 2,
              }}
            >
              <Clock
                style={{ width: '14px', height: '14px', color: CATEGORY_COLORS[evt.category] }}
              />
            </div>

            {/* Event Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {evt.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: `${CATEGORY_COLORS[evt.category]}22`,
                      color: CATEGORY_COLORS[evt.category],
                    }}
                  >
                    {evt.category}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  <Calendar style={{ width: '13px', height: '13px' }} />
                  {new Date(evt.timestamp).toUTCString().slice(0, 22)}
                </div>
              </div>

              <p
                style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
              >
                {evt.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  marginTop: '4px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User style={{ width: '13px', height: '13px' }} /> {evt.actor}
                </span>
                {evt.evidenceRef && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--color-accent-cyan)',
                    }}
                  >
                    <FileText style={{ width: '13px', height: '13px' }} /> {evt.evidenceRef}
                  </span>
                )}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--color-success)',
                  }}
                >
                  <CheckCircle2 style={{ width: '13px', height: '13px' }} /> Confidence:{' '}
                  {(evt.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Annotations Section */}
              {evt.annotations && evt.annotations.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    Investigator Annotations:
                  </span>
                  {evt.annotations.map((note, nIdx) => (
                    <div
                      key={nIdx}
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <MessageSquare
                        style={{ width: '12px', height: '12px', color: 'var(--color-accent-cyan)' }}
                      />
                      {note}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Annotation Input */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  placeholder="Add investigator note..."
                  value={newAnnotation[evt.id] || ''}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, [evt.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && addAnnotation(evt.id)}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => addAnnotation(evt.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--color-accent-cyan-dim)',
                    border: '1px solid var(--color-border-accent)',
                    color: 'var(--color-accent-cyan)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} /> Note
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

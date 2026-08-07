'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  User,
  ShieldAlert,
  HardDrive,
  MapPin,
  FileText,
  Radio,
  X,
  ExternalLink,
  Filter,
} from 'lucide-react'

export interface GraphNode {
  id: string
  label: string
  type: 'SUSPECT' | 'VICTIM' | 'EVIDENCE' | 'LOCATION' | 'DEVICE' | 'THREAT'
  x: number
  y: number
  riskScore?: number
  details: Record<string, string | number | boolean>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
}

const INITIAL_NODES: GraphNode[] = [
  {
    id: 'suspect-1',
    label: 'Vikram "Phantom" S.',
    type: 'SUSPECT',
    x: 400,
    y: 180,
    riskScore: 88,
    details: {
      Role: 'Primary Extortionist',
      IPAddress: '185.220.101.4',
      TelegramHandle: '@dark_phantom_99',
      Status: 'Active Target',
    },
  },
  {
    id: 'victim-1',
    label: 'Ananya R. (Minor)',
    type: 'VICTIM',
    x: 220,
    y: 320,
    riskScore: 92,
    details: {
      AgeCategory: 'Minor (16)',
      ProtectionLevel: 'CRITICAL',
      FirstContactDate: '2026-07-12',
      Location: 'Kochi, Kerala',
    },
  },
  {
    id: 'evidence-1',
    label: 'Chat_Log_Export.txt',
    type: 'EVIDENCE',
    x: 320,
    y: 220,
    details: {
      Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      Size: '2.4 MB',
      CoCStatus: 'Verified SHA-256',
    },
  },
  {
    id: 'evidence-2',
    label: 'Screenshot_Extortion.png',
    type: 'EVIDENCE',
    x: 480,
    y: 300,
    details: {
      Hash: '8f4e2b109c37d6e4a8123456789abcdef123456789abcdef123456789abcdef',
      Resolution: '1170x2532',
      ExifExtracted: true,
    },
  },
  {
    id: 'device-1',
    label: 'Samsung Galaxy S22',
    type: 'DEVICE',
    x: 600,
    y: 160,
    details: {
      IMEI: '358291048201948',
      OS: 'Android 14',
      MAC: 'A4:C3:F0:12:34:56',
    },
  },
  {
    id: 'location-1',
    label: 'Ernakulam Tower Cell Tower',
    type: 'LOCATION',
    x: 180,
    y: 160,
    details: {
      GPS: '9.9816° N, 76.2999° E',
      CoverageRadius: '1.2 km',
      Operator: 'Airtel Cyber Cell',
    },
  },
  {
    id: 'threat-1',
    label: 'Financial Extortion Scheme',
    type: 'THREAT',
    x: 420,
    y: 420,
    riskScore: 95,
    details: {
      Pattern: 'Grooming -> Sextortion -> Crypto Demand',
      TargetAmount: '0.5 BTC',
      ThreatLevel: 'CRITICAL',
    },
  },
]

const INITIAL_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'suspect-1', target: 'evidence-1', label: 'SENT' },
  { id: 'e2', source: 'victim-1', target: 'evidence-1', label: 'RECEIVED' },
  { id: 'e3', source: 'suspect-1', target: 'evidence-2', label: 'CREATED' },
  { id: 'e4', source: 'suspect-1', target: 'device-1', label: 'USED_DEVICE' },
  { id: 'e5', source: 'victim-1', target: 'location-1', label: 'LOCATED_NEAR' },
  { id: 'e6', source: 'suspect-1', target: 'threat-1', label: 'OPERATES' },
  { id: 'e7', source: 'threat-1', target: 'victim-1', label: 'TARGETS' },
]

const TYPE_COLORS: Record<GraphNode['type'], string> = {
  SUSPECT: '#ef4444',
  VICTIM: '#eab308',
  EVIDENCE: '#06b6d4',
  LOCATION: '#22c55e',
  DEVICE: '#a855f7',
  THREAT: '#f97316',
}

const TYPE_ICONS: Record<GraphNode['type'], React.FC<{ style?: React.CSSProperties }>> = {
  SUSPECT: User,
  VICTIM: User,
  EVIDENCE: FileText,
  LOCATION: MapPin,
  DEVICE: HardDrive,
  THREAT: ShieldAlert,
}

export const KnowledgeGraph: React.FC = () => {
  const [nodes] = useState<GraphNode[]>(INITIAL_NODES)
  const [edges] = useState<GraphEdge[]>(INITIAL_EDGES)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [zoom, setZoom] = useState(1)

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'ALL' || n.type === selectedType
    return matchesSearch && matchesType
  })

  const getNodePos = (id: string) => {
    const n = nodes.find((node) => node.id === id)
    return n ? { x: n.x, y: n.y } : { x: 0, y: 0 }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        height: 'calc(100vh - 120px)',
        position: 'relative',
      }}
    >
      {/* Controls Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          gap: '12px',
          flexWrap: 'wrap',
          zIndex: 10,
        }}
      >
        {/* Search */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}
        >
          <Search style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search entities, IPs, hashes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter style={{ width: '14px', height: '14px', color: 'var(--color-text-tertiary)' }} />
          {['ALL', 'SUSPECT', 'VICTIM', 'EVIDENCE', 'LOCATION', 'DEVICE', 'THREAT'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                border:
                  selectedType === t
                    ? '1px solid var(--color-accent-cyan)'
                    : '1px solid transparent',
                background:
                  selectedType === t ? 'var(--color-accent-cyan-dim)' : 'rgba(255,255,255,0.03)',
                color:
                  selectedType === t ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
            title="Zoom In"
          >
            <ZoomIn style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
            title="Zoom Out"
          >
            <ZoomOut style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={() => {
              setZoom(1)
              setSearchQuery('')
              setSelectedType('ALL')
              setSelectedNode(null)
            }}
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
            title="Reset View"
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'grab',
          background:
            'radial-gradient(circle at center, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.95) 100%)',
        }}
      >
        <svg
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
          }}
          viewBox="0 0 800 500"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="28"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(148, 163, 184, 0.5)" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((edge) => {
            const src = getNodePos(edge.source)
            const tgt = getNodePos(edge.target)
            const midX = (src.x + tgt.x) / 2
            const midY = (src.y + tgt.y) / 2

            return (
              <g key={edge.id}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="rgba(148, 163, 184, 0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrow)"
                />
                <rect
                  x={midX - 35}
                  y={midY - 9}
                  width="70"
                  height="18"
                  rx="4"
                  fill="rgba(15, 23, 42, 0.85)"
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="0.5"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="600"
                  letterSpacing="0.5px"
                >
                  {edge.label}
                </text>
              </g>
            )
          })}

          {/* Render Nodes */}
          {filteredNodes.map((node) => {
            const Icon = TYPE_ICONS[node.type]
            const color = TYPE_COLORS[node.type]
            const isSelected = selectedNode?.id === node.id

            return (
              <g key={node.id} onClick={() => setSelectedNode(node)} style={{ cursor: 'pointer' }}>
                {/* Glow ring if selected */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="28"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="24;32;24"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Main Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={color}
                  strokeWidth={isSelected ? '3' : '2'}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Icon inside circle */}
                <foreignObject x={node.x - 10} y={node.y - 10} width="20" height="20">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Icon style={{ width: '14px', height: '14px', color }} />
                  </div>
                </foreignObject>

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y + 34}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="500"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Entity Details Drawer Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="glass-card"
            style={{
              position: 'absolute',
              right: '16px',
              top: '80px',
              width: '320px',
              padding: '20px',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: `${TYPE_COLORS[selectedNode.type]}22`,
                  color: TYPE_COLORS[selectedNode.type],
                  border: `1px solid ${TYPE_COLORS[selectedNode.type]}55`,
                }}
              >
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '4px',
                }}
              >
                {selectedNode.label}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                ID: {selectedNode.id}
              </p>
            </div>

            {selectedNode.riskScore && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <span style={{ fontSize: '12px', color: '#fca5a5' }}>Threat Risk Score</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>
                  {selectedNode.riskScore}/100
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span
                style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}
              >
                Properties & Metadata
              </span>
              {Object.entries(selectedNode.details).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{key}</span>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '6px',
                background: 'var(--color-accent-cyan-dim)',
                border: '1px solid var(--color-border-accent)',
                color: 'var(--color-accent-cyan)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
              View Related Evidence (Neo4j)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

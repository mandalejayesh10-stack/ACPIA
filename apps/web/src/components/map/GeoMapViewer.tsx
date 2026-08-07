'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Layers,
  Search,
  Navigation,
  ZoomIn,
  ZoomOut,
  Radio,
  User,
  ShieldAlert,
  HardDrive,
  X,
  ExternalLink,
  Flame,
} from 'lucide-react'

export interface GeoLocationMarker {
  id: string
  title: string
  type: 'VICTIM_LOCATION' | 'SUSPECT_PING' | 'CELL_TOWER' | 'IP_GEOLOCATION' | 'CRIME_SCENE'
  lat: number
  lng: number
  address: string
  timestamp: string
  accuracyMeters: number
  evidenceRef: string
  details: Record<string, string | number>
}

const INITIAL_MARKERS: GeoLocationMarker[] = [
  {
    id: 'geo-1',
    title: 'Victim Primary Residence',
    type: 'VICTIM_LOCATION',
    lat: 9.9816,
    lng: 76.2999,
    address: 'Kaloor, Kochi, Kerala 682017',
    timestamp: '2026-07-12T14:32:00Z',
    accuracyMeters: 15,
    evidenceRef: 'EVD-001 (EXIF)',
    details: {
      LocationMethod: 'EXIF Metadata + GPS',
      ProtectionPriority: 'HIGH',
      Subdistrict: 'Kanayannur',
    },
  },
  {
    id: 'geo-2',
    title: 'Cell Tower BSSID-4912',
    type: 'CELL_TOWER',
    lat: 9.9925,
    lng: 76.3082,
    address: 'Ernakulam North, Kochi, Kerala',
    timestamp: '2026-07-13T09:15:00Z',
    accuracyMeters: 800,
    evidenceRef: 'EVD-003 (CDR Log)',
    details: {
      Carrier: 'Airtel Cyber Cell',
      SignalStrength: '-72 dBm',
      Azimuth: '120°',
    },
  },
  {
    id: 'geo-3',
    title: 'Suspect VPN Exit IP Ping',
    type: 'IP_GEOLOCATION',
    lat: 10.015,
    lng: 76.341,
    address: 'Kalamassery Tech Zone, Kochi',
    timestamp: '2026-07-14T21:44:00Z',
    accuracyMeters: 2500,
    evidenceRef: 'EVD-005 (Network Log)',
    details: {
      IP: '185.220.101.4',
      ISP: 'Tor Exit Node / Cyber Infra',
      RiskRating: '94/100',
    },
  },
  {
    id: 'geo-4',
    title: 'Suspect Secondary Sight Pin',
    type: 'SUSPECT_PING',
    lat: 9.965,
    lng: 76.285,
    address: 'Fort Kochi Waterfront, Kerala',
    timestamp: '2026-07-15T02:10:00Z',
    accuracyMeters: 50,
    evidenceRef: 'EVD-007 (Vision Agent)',
    details: {
      ExtractedLandmark: 'Chinese Fishing Nets Landmark',
      Confidence: '91% (GPT-4o Vision)',
    },
  },
]

const TYPE_COLORS: Record<GeoLocationMarker['type'], string> = {
  VICTIM_LOCATION: '#eab308',
  SUSPECT_PING: '#ef4444',
  CELL_TOWER: '#a855f7',
  IP_GEOLOCATION: '#06b6d4',
  CRIME_SCENE: '#f97316',
}

export const GeoMapViewer: React.FC = () => {
  const [markers] = useState<GeoLocationMarker[]>(INITIAL_MARKERS)
  const [selectedMarker, setSelectedMarker] = useState<GeoLocationMarker | null>(null)
  const [heatmapMode, setHeatmapMode] = useState(false)
  const [search, setSearch] = useState('')
  const [zoom, setZoom] = useState(1)

  const filtered = markers.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.address.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase())
  )

  // Map canvas coordinate normalization to SVG 800x500
  const mapToCanvas = (lat: number, lng: number) => {
    const minLat = 9.95,
      maxLat = 10.03
    const minLng = 76.26,
      maxLng = 76.36
    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50
    const y = 500 - (((lat - minLat) / (maxLat - minLat)) * 400 + 50)
    return { x, y }
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
      {/* Map Control Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          gap: '12px',
          zIndex: 10,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}
        >
          <Search style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search GPS pins, addresses, cell towers..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              border: heatmapMode ? '1px solid #f97316' : '1px solid transparent',
              background: heatmapMode ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.05)',
              color: heatmapMode ? '#f97316' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Flame style={{ width: '14px', height: '14px' }} />
            {heatmapMode ? 'Heatmap Density Active' : 'Enable Heatmap'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 2.2))}
              style={{
                padding: '6px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <ZoomIn style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
              style={{
                padding: '6px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <ZoomOut style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Cyber GIS Map SVG Canvas */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)',
        }}
      >
        {/* Synthetic Cyber Map Grid Overlay */}
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
          {/* Map Grid Lines */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 60}
              x2="800"
              y2={i * 60}
              stroke="rgba(30, 41, 59, 0.5)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 65}
              y1="0"
              x2={i * 65}
              y2="500"
              stroke="rgba(30, 41, 59, 0.5)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}

          {/* Heatmap Density Gradients */}
          {heatmapMode &&
            filtered.map((m) => {
              const pos = mapToCanvas(m.lat, m.lng)
              return (
                <circle
                  key={`heat-${m.id}`}
                  cx={pos.x}
                  cy={pos.y}
                  r="70"
                  fill={`url(#heatGrad-${m.id})`}
                  opacity="0.6"
                />
              )
            })}

          <defs>
            {filtered.map((m) => (
              <radialGradient key={`heatGrad-${m.id}`} id={`heatGrad-${m.id}`}>
                <stop offset="0%" stopColor={TYPE_COLORS[m.type]} stopOpacity="0.8" />
                <stop offset="50%" stopColor={TYPE_COLORS[m.type]} stopOpacity="0.3" />
                <stop offset="100%" stopColor={TYPE_COLORS[m.type]} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Pin Markers */}
          {filtered.map((m) => {
            const pos = mapToCanvas(m.lat, m.lng)
            const isSelected = selectedMarker?.id === m.id
            const color = TYPE_COLORS[m.type]

            return (
              <g key={m.id} onClick={() => setSelectedMarker(m)} style={{ cursor: 'pointer' }}>
                {/* Accuracy Radius Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={Math.min(m.accuracyMeters / 15, 60)}
                  fill={`${color}15`}
                  stroke={`${color}44`}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Pulse Glow */}
                <circle cx={pos.x} cy={pos.y} r="18" fill="none" stroke={color} opacity="0.6">
                  <animate
                    attributeName="r"
                    values="14;24;14"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.1;0.8"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Pin Icon Base */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '14' : '11'}
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke={color}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                <foreignObject x={pos.x - 7} y={pos.y - 7} width="14" height="14">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <MapPin style={{ width: '10px', height: '10px', color }} />
                  </div>
                </foreignObject>

                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 24}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="600"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {m.title}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Marker Detail Modal */}
      <AnimatePresence>
        {selectedMarker && (
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
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: `${TYPE_COLORS[selectedMarker.type]}22`,
                  color: TYPE_COLORS[selectedMarker.type],
                  border: `1px solid ${TYPE_COLORS[selectedMarker.type]}55`,
                }}
              >
                {selectedMarker.type}
              </span>
              <button
                onClick={() => setSelectedMarker(null)}
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
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '4px',
                }}
              >
                {selectedMarker.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {selectedMarker.address}
              </p>
            </div>

            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Coordinates:</span>
                <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 600 }}>
                  {selectedMarker.lat}° N, {selectedMarker.lng}° E
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Accuracy Radius:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  ±{selectedMarker.accuracyMeters}m
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-tertiary)' }}>Evidence Source:</span>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {selectedMarker.evidenceRef}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span
                style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}
              >
                GIS Attributes
              </span>
              {Object.entries(selectedMarker.details).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{k}</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

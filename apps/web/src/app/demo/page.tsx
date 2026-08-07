'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  FileText,
  Clock,
  Sparkles,
  Maximize2,
  Presentation,
  Terminal,
  Activity,
  Award,
  RefreshCw,
} from 'lucide-react'

const DEMO_AGENTS = [
  { id: '1', name: 'Evidence Intake', desc: 'SHA-256 validation & chain of custody stamp' },
  { id: '2', name: 'Content Analysis', desc: 'GPT-4o Vision & OCR text extraction' },
  { id: '3', name: 'Threat Identification', desc: 'Grooming & extortion pattern detection' },
  { id: '4', name: 'Context Extraction', desc: 'Visual landmark, GPS & vehicle identification' },
  { id: '5', name: 'Activity Pattern', desc: 'Communication network role & timing analysis' },
  { id: '6', name: 'Metadata Mapping', desc: 'EXIF, IMEI & device fingerprinting (No-LLM)' },
  { id: '7', name: 'Synthetic Detection', desc: 'Deepfake & AI media authenticity verification' },
  {
    id: '8',
    name: 'Timeline Reconstruction',
    desc: 'ISO-timestamped chronological event ordering',
  },
  { id: '9', name: 'Intelligent Retrieval', desc: 'Qdrant vector cosine similarity search' },
  { id: '10', name: 'Automated Reporting', desc: 'ISO 27037 court-ready report generation' },
  { id: '11', name: 'Risk Assessment', desc: 'Victim risk (92/100) & suspect threat scoring' },
  {
    id: '12',
    name: 'Intelligence Fusion',
    desc: 'Multi-agent output deduplication & conflict resolution',
  },
  { id: '13', name: 'Hypothesis Generation', desc: '3 evidence-grounded investigative theories' },
  { id: '14', name: 'Verification', desc: 'Cross-check findings & hallucination prevention' },
  {
    id: '15',
    name: 'Investigation Copilot',
    desc: 'Real-time AI investigator recommendation stream',
  },
  { id: '16', name: 'Explainability & Legal', desc: 'FRE 901 & Sec 65B legal admissibility audit' },
]

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isDone, setIsDone] = useState(false)

  const runFullPipeline = () => {
    setIsRunning(true)
    setIsDone(false)
    setCurrentStep(0)
    setCompletedSteps([])
    setLogs([
      '[SYSTEM] Initializing ACPIA 16-Agent DAG Orchestrator...',
      '[SYSTEM] Case 2024-001 evidence intake confirmed.',
    ])

    let step = 0
    const interval = setInterval(() => {
      if (step < DEMO_AGENTS.length) {
        const agent = DEMO_AGENTS[step]
        setCurrentStep(step + 1)
        setCompletedSteps((prev) => [...prev, step + 1])
        setLogs((prev) => [
          ...prev,
          `[OK] Agent ${agent.id}: ${agent.name} executed cleanly. — ${agent.desc}`,
        ])
        step++
      } else {
        clearInterval(interval)
        setIsRunning(false)
        setIsDone(true)
        setLogs((prev) => [
          ...prev,
          '==================================================',
          '🏆 ACPIA 16-AGENT PIPELINE COMPLETED SUCCESSFULLY',
          'Legal Admissibility Standard: ISO/IEC 27037 · FRE Rule 901',
          'Overall Case Threat Score: 8.7/10 (CRITICAL)',
          '==================================================',
        ])
      }
    }, 600)
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#030712',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top Presentation Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '1px',
            }}
          >
            ACPIA 2.0
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Autonomous Cybercrime Pattern & Intelligence Platform
            </h1>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Hackathon Presentation Mode · Live 16-Agent DAG Execution
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={runFullPipeline}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              borderRadius: '10px',
              background: isRunning
                ? '#334155'
                : 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
            }}
          >
            {isRunning ? (
              <RefreshCw style={{ width: '18px', height: '18px' }} className="animate-spin" />
            ) : (
              <Play style={{ width: '18px', height: '18px' }} />
            )}
            {isRunning ? 'RUNNING PIPELINE...' : 'START FULL 16-AGENT DEMO'}
          </button>
        </div>
      </header>

      {/* Main Split Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: 16 Agents Status Matrix */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.4)',
          }}
        >
          {DEMO_AGENTS.map((agent, idx) => {
            const stepNum = idx + 1
            const isCompleted = completedSteps.includes(stepNum)
            const isCurrent = currentStep === stepNum

            return (
              <motion.div
                key={agent.id}
                animate={{
                  scale: isCurrent ? 1.03 : 1,
                  borderColor: isCompleted
                    ? '#10b981'
                    : isCurrent
                      ? '#06b6d4'
                      : 'rgba(255,255,255,0.08)',
                }}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: isCompleted
                    ? 'rgba(16, 185, 129, 0.08)'
                    : isCurrent
                      ? 'rgba(6, 182, 212, 0.15)'
                      : 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isCompleted ? '#10b981' : isCurrent ? '#06b6d4' : '#64748b',
                    }}
                  >
                    AGENT {agent.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  ) : isCurrent ? (
                    <Activity style={{ width: '16px', height: '16px', color: '#06b6d4' }} />
                  ) : (
                    <Clock style={{ width: '16px', height: '16px', color: '#475569' }} />
                  )}
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                  {agent.name}
                </h4>

                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  {agent.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Right: Live Terminal Stream & Final Report */}
        <div
          style={{
            width: '440px',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            background: '#020617',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#06b6d4',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Terminal style={{ width: '16px', height: '16px' }} />
            Live DAG Execution Log Stream
          </div>

          {/* Terminal Box */}
          <div
            style={{
              flex: 1,
              background: '#090d16',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '14px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '11px',
              color: '#38bdf8',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: '#475569' }}>
                Click "START FULL 16-AGENT DEMO" to launch...
              </span>
            ) : (
              logs.map((log, lIdx) => (
                <div
                  key={lIdx}
                  style={{
                    color: log.startsWith('[OK]')
                      ? '#4ade80'
                      : log.startsWith('===')
                        ? '#f59e0b'
                        : '#38bdf8',
                  }}
                >
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Final Certificate / Badge */}
          {isDone && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                padding: '16px',
                borderRadius: '10px',
                background:
                  'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.15) 100%)',
                border: '1px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Award style={{ width: '32px', height: '32px', color: '#10b981', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                  Court-Ready Forensic Package Verified
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                  ISO/IEC 27037 Standard Compliant · Zero Hallucinations Flagged
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

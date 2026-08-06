import React from 'react'
import { Shield, Bell, ChevronDown, UserCircle, Activity } from 'lucide-react'

export interface NavbarProps {
  caseId?: string
  status?: string
}

export const Navbar: React.FC<NavbarProps> = ({
  caseId = 'CASE-2024-0001',
  status = 'LIVE PIPELINE',
}) => {
  return (
    <header
      style={{
        height: '56px',
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left Branding & Case Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Shield style={{ width: '22px', height: '22px', color: 'var(--color-accent-cyan)' }} />
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}
          >
            ACPIA
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent-cyan-dim)',
              color: 'var(--color-accent-cyan)',
              marginLeft: '4px',
            }}
          >
            GOV-SPEC
          </span>
        </div>

        <div
          style={{
            height: '20px',
            width: '1px',
            background: 'var(--color-border-default)',
          }}
        />

        {/* Case Badge Dropdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '4px 10px',
            background: 'var(--color-bg-input)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)' }}>ACTIVE CASE:</span>
          <span style={{ color: 'var(--color-accent-cyan)', fontWeight: 600 }}>{caseId}</span>
          <ChevronDown
            style={{ width: '14px', height: '14px', color: 'var(--color-text-secondary)' }}
          />
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-success-dim)',
            border: '1px solid rgba(0, 255, 157, 0.2)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-success)',
          }}
        >
          <Activity style={{ width: '12px', height: '12px' }} />
          <span>{status}</span>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Notifications"
        >
          <Bell style={{ width: '18px', height: '18px' }} />
        </button>

        <div
          style={{
            height: '20px',
            width: '1px',
            background: 'var(--color-border-default)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <UserCircle
            style={{ width: '24px', height: '24px', color: 'var(--color-text-secondary)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.2 }}>
              Inspector Jayesh
            </span>
            <span
              style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.2 }}
            >
              Cybercrime Unit
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

import { Shield, Cpu, Activity } from 'lucide-react'

export default function Page() {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        textAlign: 'center',
        background:
          'radial-gradient(circle at 50% 20%, rgba(0, 217, 255, 0.08) 0%, transparent 60%)',
      }}
    >
      <div className="glass-card" style={{ padding: '40px', maxWidth: '640px', width: '100%' }}>
        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}
        >
          <Shield style={{ width: '40px', height: '40px', color: 'var(--color-accent-cyan)' }} />
          <Cpu style={{ width: '40px', height: '40px', color: 'var(--color-purple)' }} />
          <Activity style={{ width: '40px', height: '40px', color: 'var(--color-success)' }} />
        </div>

        <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>ACPIA</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
          AI-powered Criminal &amp; Paedophile Investigation Assistant
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'var(--color-accent-cyan-dim)',
            border: '1px solid var(--color-border-accent)',
            fontSize: '13px',
            color: 'var(--color-accent-cyan)',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-accent-cyan)',
              display: 'inline-block',
            }}
          />
          Sprint 0.3 — Frontend Foundation Initialized
        </div>
      </div>
    </main>
  )
}

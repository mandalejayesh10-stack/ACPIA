import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@acpia/ui'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-6)',
      }}
    >
      <div className="glass-card" style={{ padding: '40px', maxWidth: '480px', width: '100%' }}>
        <ShieldAlert
          style={{
            width: '48px',
            height: '48px',
            color: 'var(--color-warning)',
            marginBottom: '16px',
          }}
        />
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>404</h1>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
          Investigation Route Not Found
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          The requested investigation resource or view does not exist in this environment.
        </p>

        <Link href="/">
          <Button variant="primary" size="md">
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@acpia/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
      <div
        className="glass-card"
        style={{
          padding: '40px',
          maxWidth: '520px',
          width: '100%',
          borderColor: 'var(--color-danger-dim)',
        }}
      >
        <AlertTriangle
          style={{
            width: '48px',
            height: '48px',
            color: 'var(--color-danger)',
            marginBottom: '16px',
          }}
        />
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>System Exception Captured</h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          {error.message || 'An unexpected error occurred within the investigation pipeline.'}
        </p>

        <Button variant="danger" size="md" onClick={reset}>
          <RefreshCw style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Retry Pipeline Operation
        </Button>
      </div>
    </div>
  )
}

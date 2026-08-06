'use client'

import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'

export interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = React.useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar caseId="CASE-2024-0001" status="16 AGENTS READY" />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main
          style={{
            flex: 1,
            padding: 'var(--space-6)',
            overflowY: 'auto',
            background: 'var(--color-bg-base)',
          }}
        >
          {children}
        </main>

        <RightPanel />
      </div>
    </div>
  )
}

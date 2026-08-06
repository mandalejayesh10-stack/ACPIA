'use client'

import React from 'react'
import {
  LayoutDashboard,
  Package,
  Clock,
  Network,
  Cpu,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export interface SidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'evidence', label: 'Evidence Files', icon: Package, badge: '8' },
  { id: 'timeline', label: 'Timeline', icon: Clock, badge: '12' },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'agents', label: '16 AI Agents', icon: Cpu, badge: 'READY' },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'dashboard', onTabChange }) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside
      style={{
        width: collapsed ? '64px' : '240px',
        transition: 'width var(--duration-normal) var(--ease-default)',
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-2)',
        userSelect: 'none',
        height: 'calc(100vh - 56px)',
        position: 'sticky',
        top: '56px',
      }}
    >
      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'space-between',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--color-accent-cyan-dim)' : 'transparent',
                border: isActive ? '1px solid var(--color-border-accent)' : '1px solid transparent',
                color: isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all var(--duration-fast) var(--ease-default)',
                width: '100%',
              }}
              title={collapsed ? item.label : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background:
                      item.badge === 'READY' ? 'var(--color-success-dim)' : 'var(--color-bg-card)',
                    color:
                      item.badge === 'READY'
                        ? 'var(--color-success)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {collapsed ? (
          <ChevronRight style={{ width: '18px', height: '18px' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span>COLLAPSE</span>
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
          </div>
        )}
      </button>
    </aside>
  )
}

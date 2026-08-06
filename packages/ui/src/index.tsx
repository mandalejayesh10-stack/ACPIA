/**
 * @acpia/ui — Component Library Stubs
 * Governed by docs/DESIGN_SYSTEM.md
 */

import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
      {children}
    </button>
  )
}

export interface StatusChipProps {
  status: 'running' | 'completed' | 'waiting' | 'queued' | 'failed' | 'paused'
  label: string
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label }) => {
  return (
    <div className={`status-chip status-${status}`}>
      <span className="status-dot" />
      <span>{label}</span>
    </div>
  )
}

export interface RiskBadgeProps {
  score: number // 0 - 10
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score }) => {
  const level = score >= 9 ? 'critical' : score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low'
  return (
    <div className={`risk-badge risk-${level}`}>
      <span>SCORE: {score.toFixed(1)}</span>
    </div>
  )
}

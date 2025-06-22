import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }
  return formatCurrency(amount)
}

export function calculateRiskScore(probability: number, impact: number): number {
  return probability * impact
}

export function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score <= 5) return 'Low'
  if (score <= 10) return 'Medium'
  if (score <= 15) return 'High'
  return 'Critical'
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function generateWBSCode(parentCode: string, position: number): string {
  return parentCode ? `${parentCode}.${position}` : `${position}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    TODO: 'bg-slate-100 text-slate-800 border border-slate-200',
    IN_PROGRESS: 'status-in-progress',
    UAT: 'status-uat',
    DONE: 'status-done',
    BLOCKED: 'status-cancelled',
    PLANNING: 'status-planning',
    ON_HOLD: 'bg-amber-100 text-amber-800 border border-amber-200',
    COMPLETED: 'status-done',
    CANCELLED: 'status-cancelled'
  }
  return colors[status] || 'bg-slate-100 text-slate-800 border border-slate-200'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'priority-low',
    MEDIUM: 'priority-medium',
    HIGH: 'priority-high',
    URGENT: 'priority-urgent'
  }
  return colors[priority] || 'bg-slate-100 text-slate-800 border border-slate-200'
} 
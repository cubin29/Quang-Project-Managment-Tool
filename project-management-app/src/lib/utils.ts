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
    IN_PROGRESS: 'bg-blue-200 text-blue-900 border border-blue-300',
    UAT: 'bg-purple-200 text-purple-900 border border-purple-300',
    DONE: 'bg-emerald-200 text-emerald-900 border border-emerald-300',
    BLOCKED: 'bg-red-200 text-red-900 border border-red-300',
    PLANNING: 'bg-amber-200 text-amber-900 border border-amber-300',
    ON_HOLD: 'bg-amber-100 text-amber-800 border border-amber-200',
    COMPLETED: 'bg-emerald-200 text-emerald-900 border border-emerald-300',
    CANCELLED: 'bg-red-200 text-red-900 border border-red-300'
  }
  return colors[status] || 'bg-slate-100 text-slate-800 border border-slate-200'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-slate-200 text-slate-900 border border-slate-300',
    MEDIUM: 'bg-blue-200 text-blue-900 border border-blue-300',
    HIGH: 'bg-orange-200 text-orange-900 border border-orange-300',
    URGENT: 'bg-red-200 text-red-900 border border-red-300'
  }
  return colors[priority] || 'bg-slate-100 text-slate-800 border border-slate-200'
} 
'use client'

import { useState } from 'react'
import { Project, ProjectHealthStatus } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, ExternalLink, Calendar, User, Building, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProjectDetailsHeaderProps {
  project: Project
  projectHealth: ProjectHealthStatus | null
  onProjectUpdate: (project: Project) => void
}

export default function ProjectDetailsHeader({ 
  project, 
  projectHealth, 
  onProjectUpdate 
}: ProjectDetailsHeaderProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  const getHealthBadge = () => {
    if (!projectHealth) return null

    const { status, overdueTasksPercentage, openHighRisksCount } = projectHealth

    const statusConfig = {
      green: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Healthy',
        icon: '✅'
      },
      yellow: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'At Risk',
        icon: '⚠️'
      },
      red: { 
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Critical',
        icon: '🚨'
      }
    }

    const config = statusConfig[status]

    return (
      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
        {overdueTasksPercentage > 0 && (
          <span className="ml-2 text-xs">
            {Math.round(overdueTasksPercentage)}% overdue
          </span>
        )}
        {openHighRisksCount > 0 && (
          <span className="ml-2 text-xs">
            {openHighRisksCount} high risks
          </span>
        )}
      </div>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={priorityConfig[priority as keyof typeof priorityConfig]}>
        {priority}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PLANNING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      UAT: 'bg-yellow-100 text-yellow-800',
      DONE: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig]}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'Not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {project.name}
            </h1>
            <div className="flex items-center gap-3">
              {getStatusBadge(project.status)}
              {getPriorityBadge(project.priority)}
              {getHealthBadge()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Project
          </Button>
        </div>
      </div>

      {/* Project Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Timeline */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </h3>
          <div className="text-sm text-gray-600">
            <div>Start: {formatDate(project.startDate)}</div>
            <div>End: {formatDate(project.endDate)}</div>
          </div>
        </div>

        {/* Team Information */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4" />
            Team & Ownership
          </h3>
          <div className="text-sm text-gray-600">
            <div>PIC: {project.pic || 'Not assigned'}</div>
            <div>Team: {project.team || 'Not set'}</div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Location
          </h3>
          <div className="text-sm text-gray-600">
            <div>Country: {project.country || 'Not set'}</div>
          </div>
        </div>

        {/* Business Impact */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Impact
          </h3>
          <div className="text-sm text-gray-600">
            <div>Impact: {project.businessImpact}/10</div>
            <div>Effort: {project.techEffort}/10</div>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      {(project.projectValue || project.revenueUplift || project.headcountSaving) && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-700 mb-3">Financial Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.projectValue && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(project.projectValue)}
                </div>
                <div className="text-sm text-gray-600">Project Value</div>
              </div>
            )}
            {project.revenueUplift && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(project.revenueUplift)}
                </div>
                <div className="text-sm text-gray-600">Revenue Uplift</div>
              </div>
            )}
            {project.headcountSaving && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(project.headcountSaving)}
                </div>
                <div className="text-sm text-gray-600">HC Saving/Month</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* External Links */}
      {(project.jiraUrl || project.wikiUrl) && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-700 mb-3">Documentation</h3>
          <div className="flex flex-wrap gap-3">
            {project.jiraUrl && (
              <a
                href={project.jiraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Jira Ticket
              </a>
            )}
            {project.wikiUrl && (
              <a
                href={project.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Wiki Documentation
              </a>
            )}
          </div>
        </div>
      )}
    </Card>
  )
} 
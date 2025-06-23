'use client'

import { ActivityLog, Project } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, User, Calendar, Edit, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'

interface ActivityLogPanelProps {
  activityLogs: ActivityLog[]
  project: Project
}

export default function ActivityLogPanel({ activityLogs, project }: ActivityLogPanelProps) {
  const sortedLogs = [...activityLogs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const getActivityIcon = (action: string) => {
    const actionLower = action.toLowerCase()
    
    if (actionLower.includes('status')) {
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    } else if (actionLower.includes('assigned') || actionLower.includes('pic')) {
      return <UserPlus className="h-4 w-4 text-green-500" />
    } else if (actionLower.includes('due') || actionLower.includes('eta')) {
      return <Calendar className="h-4 w-4 text-orange-500" />
    } else if (actionLower.includes('priority')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    } else {
      return <Edit className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (action: string) => {
    const actionLower = action.toLowerCase()
    
    if (actionLower.includes('status')) {
      return 'border-l-blue-400'
    } else if (actionLower.includes('assigned') || actionLower.includes('pic')) {
      return 'border-l-green-400'
    } else if (actionLower.includes('due') || actionLower.includes('eta')) {
      return 'border-l-orange-400'
    } else if (actionLower.includes('priority')) {
      return 'border-l-red-400'
    } else {
      return 'border-l-gray-400'
    }
  }

  const formatDate = (date: Date | string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    } else if (diffInMinutes < 10080) { // 7 days
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d ago`
    } else {
      return activityDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: activityDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const formatValue = (value: string | null | undefined) => {
    if (!value) return 'None'
    
    // Handle status formatting
    if (value.includes('_')) {
      return value.replace('_', ' ').toLowerCase()
    }
    
    // Handle date formatting
    if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    return value
  }

  const getChangeDescription = (log: ActivityLog) => {
    const { action, field, oldValue, newValue } = log
    
    if (field && oldValue && newValue) {
      return (
        <span>
          {action}: <span className="font-medium">{formatValue(oldValue)}</span>
          {' → '}
          <span className="font-medium text-blue-600">{formatValue(newValue)}</span>
        </span>
      )
    } else if (field && newValue) {
      return (
        <span>
          {action}: <span className="font-medium text-blue-600">{formatValue(newValue)}</span>
        </span>
      )
    } else {
      return action
    }
  }

  const groupLogsByDate = (logs: ActivityLog[]) => {
    const groups: { [key: string]: ActivityLog[] } = {}
    
    logs.forEach(log => {
      const dateKey = new Date(log.createdAt).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(log)
    })
    
    return groups
  }

  const logGroups = groupLogsByDate(sortedLogs)

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Activity Log</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total Activities: {activityLogs.length}</span>
            {activityLogs.length > 0 && (
              <span>
                Last activity: {formatDate(sortedLogs[0]?.createdAt)}
              </span>
            )}
          </div>
        </div>
        <Activity className="h-6 w-6 text-gray-400" />
      </div>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {Object.keys(logGroups).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-500">
              Activity will appear here as team members work on tasks and make changes.
            </p>
          </div>
        ) : (
          Object.entries(logGroups).map(([dateKey, logs]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-sm font-medium text-gray-900">
                  {new Date(dateKey).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <Badge variant="outline" className="text-xs">
                  {logs.length} activities
                </Badge>
              </div>

              {/* Activities for this date */}
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 ${getActivityColor(log.action)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          <span className="font-medium">
                            {log.user.name || log.user.username}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(log.createdAt)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-900">
                        {getChangeDescription(log)}
                      </div>
                      
                      {log.taskId && (
                        <div className="text-xs text-blue-600 mt-1">
                          Task activity
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity Summary */}
      {activityLogs.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-3">Activity Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {activityLogs.filter(log => log.action.toLowerCase().includes('status')).length}
              </div>
              <div className="text-xs text-gray-600">Status Changes</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {activityLogs.filter(log => log.action.toLowerCase().includes('assigned')).length}
              </div>
              <div className="text-xs text-gray-600">Assignments</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-semibold text-orange-600">
                {activityLogs.filter(log => log.action.toLowerCase().includes('date')).length}
              </div>
              <div className="text-xs text-gray-600">Date Changes</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {new Set(activityLogs.map(log => log.userId)).size}
              </div>
              <div className="text-xs text-gray-600">Contributors</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
} 
'use client'

import { Task, TaskFilters, TaskStatus, Priority } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Filter } from 'lucide-react'

interface TaskFiltersPanelProps {
  filters: TaskFilters
  tasks: Task[]
  onFiltersChange: (filters: TaskFilters) => void
  onClose: () => void
}

export default function TaskFiltersPanel({ 
  filters, 
  tasks, 
  onFiltersChange, 
  onClose 
}: TaskFiltersPanelProps) {
  
  // Get unique values for filter options
  const getUniqueAssignees = () => {
    const assignees = tasks
      .filter(task => task.assignee)
      .map(task => task.assignee!)
    
    const uniqueAssignees = assignees.filter((assignee, index, self) => 
      index === self.findIndex(a => a.id === assignee.id)
    )
    
    return uniqueAssignees
  }

  const getUniqueMilestones = () => {
    const milestones = tasks
      .filter(task => task.milestone)
      .map(task => task.milestone!)
    
    return Array.from(new Set(milestones))
  }

  const handleStatusToggle = (status: TaskStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    onFiltersChange({ ...filters, status: newStatuses })
  }

  const handlePriorityToggle = (priority: Priority) => {
    const currentPriorities = filters.priority || []
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority]
    
    onFiltersChange({ ...filters, priority: newPriorities })
  }

  const handleAssigneeToggle = (assigneeId: string) => {
    const currentAssignees = filters.assigneeId || []
    const newAssignees = currentAssignees.includes(assigneeId)
      ? currentAssignees.filter(id => id !== assigneeId)
      : [...currentAssignees, assigneeId]
    
    onFiltersChange({ ...filters, assigneeId: newAssignees })
  }

  const handleMilestoneToggle = (milestone: string) => {
    const currentMilestones = filters.milestone || []
    const newMilestones = currentMilestones.includes(milestone)
      ? currentMilestones.filter(m => m !== milestone)
      : [...currentMilestones, milestone]
    
    onFiltersChange({ ...filters, milestone: newMilestones })
  }

  const handleOverdueToggle = () => {
    onFiltersChange({ ...filters, overdue: !filters.overdue })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = () => {
    return (filters.status && filters.status.length > 0) ||
           (filters.priority && filters.priority.length > 0) ||
           (filters.assigneeId && filters.assigneeId.length > 0) ||
           (filters.milestone && filters.milestone.length > 0) ||
           filters.overdue
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'DONE':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'LOW':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const uniqueAssignees = getUniqueAssignees()
  const uniqueMilestones = getUniqueMilestones()

  return (
    <Card className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filter Tasks</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'] as TaskStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusToggle(status)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filters.status?.includes(status)
                    ? `${getStatusColor(status)} border-current`
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityToggle(priority)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filters.priority?.includes(priority)
                    ? `${getPriorityColor(priority)} border-current`
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Assignee Filter */}
        {uniqueAssignees.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueAssignees.map((assignee) => (
                <button
                  key={assignee.id}
                  onClick={() => handleAssigneeToggle(assignee.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.assigneeId?.includes(assignee.id)
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {assignee.name || assignee.username}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Milestone Filter */}
        {uniqueMilestones.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Milestone
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueMilestones.map((milestone) => (
                <button
                  key={milestone}
                  onClick={() => handleMilestoneToggle(milestone)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.milestone?.includes(milestone)
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {milestone}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Overdue Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Filters
          </label>
          <button
            onClick={handleOverdueToggle}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              filters.overdue
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Overdue Only
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-1">
            {filters.status?.map(status => (
              <Badge key={status} variant="outline" className="text-xs">
                Status: {status.replace('_', ' ')}
              </Badge>
            ))}
            {filters.priority?.map(priority => (
              <Badge key={priority} variant="outline" className="text-xs">
                Priority: {priority}
              </Badge>
            ))}
            {filters.assigneeId?.map(assigneeId => {
              const assignee = uniqueAssignees.find(a => a.id === assigneeId)
              return (
                <Badge key={assigneeId} variant="outline" className="text-xs">
                  Assignee: {assignee?.name || assignee?.username}
                </Badge>
              )
            })}
            {filters.milestone?.map(milestone => (
              <Badge key={milestone} variant="outline" className="text-xs">
                Milestone: {milestone}
              </Badge>
            ))}
            {filters.overdue && (
              <Badge variant="outline" className="text-xs">
                Overdue Only
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  )
} 
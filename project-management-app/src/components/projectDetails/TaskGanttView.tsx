'use client'

import { useMemo, memo } from 'react'
import { Task } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Calendar, User } from 'lucide-react'

interface TaskGanttViewProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
}

const TaskGanttView = memo(function TaskGanttView({ tasks, onTaskUpdate }: TaskGanttViewProps) {
  // Memoize valid tasks filtering
  const validTasks = useMemo(() => {
    return tasks.filter(task => task.startDate && task.eta)
  }, [tasks])

  // Memoize timeline calculations
  const timelineData = useMemo(() => {
    if (validTasks.length === 0) return null

    const allDates = validTasks.flatMap(task => [
      new Date(task.startDate!),
      new Date(task.eta!)
    ])
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    // Add padding to the timeline
    const timelineStart = new Date(minDate)
    timelineStart.setDate(timelineStart.getDate() - 7)
    const timelineEnd = new Date(maxDate)
    timelineEnd.setDate(timelineEnd.getDate() + 7)
    
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))

    return { timelineStart, timelineEnd, totalDays }
  }, [validTasks])

  // Memoize timeline headers
  const timelineHeaders = useMemo(() => {
    if (!timelineData) return []
    
    const headers = []
    const current = new Date(timelineData.timelineStart)
    
    while (current <= timelineData.timelineEnd) {
      headers.push(new Date(current))
      current.setDate(current.getDate() + 7) // Weekly intervals
    }
    
    return headers
  }, [timelineData])

  // Memoize task positions
  const taskPositions = useMemo(() => {
    if (!timelineData) return new Map()
    
    const positions = new Map()
    
    validTasks.forEach(task => {
      const taskStart = new Date(task.startDate!)
      const taskEnd = new Date(task.eta!)
      
      const startOffset = Math.ceil((taskStart.getTime() - timelineData.timelineStart.getTime()) / (1000 * 60 * 60 * 24))
      const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))
      
      const leftPercent = (startOffset / timelineData.totalDays) * 100
      const widthPercent = (duration / timelineData.totalDays) * 100
      
      positions.set(task.id, { leftPercent, widthPercent, duration })
    })
    
    return positions
  }, [validTasks, timelineData])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      case 'MEDIUM':
        return 'bg-blue-500'
      case 'LOW':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusOpacity = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'opacity-60'
      case 'BLOCKED':
        return 'opacity-40 border-2 border-red-300'
      default:
        return 'opacity-90'
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (validTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data</h3>
        <p className="text-gray-500">
          Tasks need both start dates and ETAs to appear in the Gantt view.
        </p>
      </div>
    )
  }

  if (!timelineData) return null

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Project Timeline</h3>
          <div className="text-sm text-gray-500">
            {formatDate(timelineData.timelineStart)} - {formatDate(timelineData.timelineEnd)}
          </div>
        </div>
        
        {/* Date headers */}
        <div className="relative h-8 border-b border-gray-200">
          <div className="flex absolute inset-0">
            {timelineHeaders.map((date, index) => (
              <div
                key={index}
                className="flex-1 text-xs text-gray-600 border-r border-gray-200 px-1"
                style={{ minWidth: `${100 / timelineHeaders.length}%` }}
              >
                {formatDate(date)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="space-y-3">
        {validTasks.map((task) => {
          const position = taskPositions.get(task.id)
          if (!position) return null
          
          const isOverdue = task.eta && new Date(task.eta) < new Date() && task.status !== 'DONE'
          
          return (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {/* Task Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{task.assignee.name || task.assignee.username}</span>
                      </div>
                    )}
                    {task.milestone && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        {task.milestone}
                      </Badge>
                    )}
                    <span>{position.duration} days</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${
                    task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </Badge>
                  <Badge className={`text-xs ${
                    task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="relative h-8 bg-gray-100 rounded">
                <div
                  className={`absolute top-1 bottom-1 rounded ${getPriorityColor(task.priority)} ${getStatusOpacity(task.status)} ${
                    isOverdue ? 'animate-pulse border-2 border-red-400' : ''
                  }`}
                  style={{
                    left: `${position.leftPercent}%`,
                    width: `${position.widthPercent}%`,
                  }}
                >
                  <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                    {position.duration}d
                  </div>
                </div>
                
                {/* Today indicator */}
                {(() => {
                  const today = new Date()
                  const todayOffset = Math.ceil((today.getTime() - timelineData.timelineStart.getTime()) / (1000 * 60 * 60 * 24))
                  const todayPercent = (todayOffset / timelineData.totalDays) * 100
                  
                  if (todayPercent >= 0 && todayPercent <= 100) {
                    return (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: `${todayPercent}%` }}
                      >
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Task Dates */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Start: {formatDate(task.startDate!)}</span>
                <span>End: {formatDate(task.eta!)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default TaskGanttView 
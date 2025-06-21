'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { format, differenceInDays, isAfter, isBefore, isToday } from 'date-fns'

interface TimelineItem {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  progress: number
  team?: string[]
}

interface TimelineChartProps {
  data: TimelineItem[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PLANNING': return 'bg-blue-500'
    case 'IN_PROGRESS': return 'bg-green-500'
    case 'COMPLETED': return 'bg-purple-500'
    case 'ON_HOLD': return 'bg-yellow-500'
    case 'CANCELLED': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH': return 'border-red-500 text-red-700 bg-red-50'
    case 'MEDIUM': return 'border-yellow-500 text-yellow-700 bg-yellow-50'
    case 'LOW': return 'border-green-500 text-green-700 bg-green-50'
    default: return 'border-gray-500 text-gray-700 bg-gray-50'
  }
}

const isOverdue = (endDate: Date, status: string) => {
  return isAfter(new Date(), endDate) && status !== 'COMPLETED'
}

const getDaysRemaining = (endDate: Date) => {
  const today = new Date()
  const days = differenceInDays(endDate, today)
  return days
}

const calculateTimelinePosition = (item: TimelineItem, minDate: Date, maxDate: Date) => {
  const totalDays = differenceInDays(maxDate, minDate)
  const startOffset = differenceInDays(item.startDate, minDate)
  const duration = differenceInDays(item.endDate, item.startDate)
  
  const leftPercent = (startOffset / totalDays) * 100
  const widthPercent = (duration / totalDays) * 100
  
  return { left: `${Math.max(0, leftPercent)}%`, width: `${Math.max(1, widthPercent)}%` }
}

export default function TimelineChart({ data }: TimelineChartProps) {
  // Calculate the overall timeline range
  const minDate = new Date(Math.min(...data.map(item => item.startDate.getTime())))
  const maxDate = new Date(Math.max(...data.map(item => item.endDate.getTime())))
  const totalDays = differenceInDays(maxDate, minDate)
  
  // Generate month markers
  const months = []
  const currentDate = new Date(minDate)
  currentDate.setDate(1) // Start from first day of month
  
  while (isBefore(currentDate, maxDate)) {
    months.push(new Date(currentDate))
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Project Timeline
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(minDate, 'MMM yyyy')} - {format(maxDate, 'MMM yyyy')}
            </Badge>
            <Badge variant="outline">
              {data.length} Projects
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Gantt chart showing project schedules and progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline Header */}
          <div className="relative">
            <div className="flex border-b pb-2">
              <div className="w-64 text-sm font-medium text-gray-600">Project</div>
              <div className="flex-1 relative">
                <div className="flex justify-between text-xs text-gray-500">
                  {months.map((month, index) => (
                    <div key={index} className="flex-1 text-center">
                      {format(month, 'MMM yyyy')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="space-y-4">
            {data.map((item) => {
              const position = calculateTimelinePosition(item, minDate, maxDate)
              const daysRemaining = getDaysRemaining(item.endDate)
              const overdue = isOverdue(item.endDate, item.status)
              
              return (
                <div key={item.id} className="flex items-center">
                  {/* Project Info */}
                  <div className="w-64 pr-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {format(item.startDate, 'MMM dd')} - {format(item.endDate, 'MMM dd')}
                      </div>
                      {overdue && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          Overdue by {Math.abs(daysRemaining)} days
                        </div>
                      )}
                      {!overdue && item.status !== 'COMPLETED' && (
                        <div className="text-xs text-gray-500">
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Due today'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="flex-1 relative h-8">
                    <div className="absolute inset-0 bg-gray-100 rounded-full">
                      {/* Month grid lines */}
                      {months.map((month, index) => {
                        const monthPosition = (differenceInDays(month, minDate) / totalDays) * 100
                        return (
                          <div
                            key={index}
                            className="absolute h-full border-l border-gray-200"
                            style={{ left: `${monthPosition}%` }}
                          />
                        )
                      })}
                      
                      {/* Project bar */}
                      <div
                        className={`absolute h-full rounded-full ${getStatusColor(item.status)} ${
                          overdue ? 'ring-2 ring-red-500' : ''
                        }`}
                        style={position}
                      >
                        {/* Progress indicator */}
                        <div
                          className="h-full bg-white bg-opacity-30 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        />
                        
                        {/* Status indicator */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {item.progress}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Today indicator */}
                      {isAfter(new Date(), item.startDate) && isBefore(new Date(), item.endDate) && (
                        <div
                          className="absolute h-full w-0.5 bg-red-500 z-10"
                          style={{ 
                            left: `${(differenceInDays(new Date(), minDate) / totalDays) * 100}%` 
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="w-24 ml-4">
                    <Badge 
                      variant={item.status === 'COMPLETED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-600">Planning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-xs text-gray-600">On Hold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-3 bg-red-500" />
              <span className="text-xs text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
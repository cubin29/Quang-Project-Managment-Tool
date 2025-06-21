'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, User, Calendar, AlertCircle } from 'lucide-react'
import { formatDate, getPriorityColor } from '@/lib/utils'

interface KanbanTaskProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
}

export default function KanbanTask({
  task
}: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-white border-2 border-dashed border-gray-300"
      >
        <CardContent className="p-3">
          <div className="h-16"></div>
        </CardContent>
      </Card>
    )
  }

  const impactEffortScore = (task.impact || 1) * (task.effort || 1)
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">
            {task.title}
          </h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge 
            variant="outline" 
            className={`text-xs ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </Badge>
          
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Overdue
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  {task.assignee.name || task.assignee.email}
                </span>
              </div>
            )}
          </div>
          
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? 'text-red-600' : ''}>
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex gap-2 text-xs">
            <span className="text-gray-500">
              Impact: {task.impact || 1}
            </span>
            <span className="text-gray-500">
              Effort: {task.effort || 1}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Score: {impactEffortScore}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
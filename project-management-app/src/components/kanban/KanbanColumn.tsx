'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { KanbanColumn, Task } from '@/types'
import KanbanTask from './KanbanTask'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  column: KanbanColumn
  onTaskCreate: (columnId: string) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
}

export default function KanbanColumnComponent({
  column,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg w-80 h-96 opacity-50"
      />
    )
  }

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="w-80 flex-shrink-0 bg-gray-50 border-gray-200"
    >
      <CardHeader 
        {...attributes} 
        {...listeners}
        className="pb-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">
            {column.title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {column.tasks.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3 min-h-[200px]">
          {column.tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTaskCreate(column.id)}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 border-dashed border-2 border-gray-300 hover:border-gray-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </CardContent>
    </Card>
  )
} 
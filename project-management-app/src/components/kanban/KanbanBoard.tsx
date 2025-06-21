'use client'

import React, { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import { KanbanColumn, Task } from '@/types'
import KanbanColumnComponent from './KanbanColumn'
import KanbanTask from './KanbanTask'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KanbanBoardProps {
  columns: KanbanColumn[]
  onTaskMove: (taskId: string, columnId: string, newPosition: number) => void
  onTaskCreate: (columnId: string) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
}

export default function KanbanBoard({
  columns,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
      return
    }

    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column)
      return
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    setActiveColumn(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === 'Task'
    const isOverATask = over.data.current?.type === 'Task'

    if (!isActiveATask) return

    // Task over task
    if (isActiveATask && isOverATask) {
      const overIndex = over.data.current?.sortable?.index
      const activeColumnId = active.data.current?.task?.columnId
      const overColumnId = over.data.current?.task?.columnId

      if (activeColumnId === overColumnId) {
        onTaskMove(activeId as string, activeColumnId, overIndex)
      } else {
        onTaskMove(activeId as string, overColumnId, overIndex)
      }
    }

    // Task over column
    const isOverAColumn = over.data.current?.type === 'Column'
    if (isActiveATask && isOverAColumn) {
      const overColumnId = overId as string
      const activeTask = active.data.current?.task
      
      if (activeTask && activeTask.columnId !== overColumnId) {
        onTaskMove(activeId as string, overColumnId, 0)
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === 'Task'
    const isOverATask = over.data.current?.type === 'Task'

    if (!isActiveATask) return

    // Task over task
    if (isActiveATask && isOverATask) {
      const activeColumnId = active.data.current?.task?.columnId
      const overColumnId = over.data.current?.task?.columnId

      if (activeColumnId !== overColumnId) {
        const overIndex = over.data.current?.sortable?.index
        onTaskMove(activeId as string, overColumnId, overIndex)
      }
    }

    // Task over column
    const isOverAColumn = over.data.current?.type === 'Column'
    if (isActiveATask && isOverAColumn) {
      const overColumnId = overId as string
      const activeTask = active.data.current?.task
      
      if (activeTask && activeTask.columnId !== overColumnId) {
        onTaskMove(activeId as string, overColumnId, 0)
      }
    }
  }

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <Button onClick={() => onTaskCreate(columns[0]?.id)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          <SortableContext items={columns.map(col => col.id)}>
            {columns.map((column) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                onTaskCreate={onTaskCreate}
                onTaskUpdate={onTaskUpdate}
                onTaskDelete={onTaskDelete}
              />
            ))}
          </SortableContext>
        </div>

        {createPortal(
          <DragOverlay>
            {activeTask && (
              <KanbanTask
                task={activeTask}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
              />
            )}
            {activeColumn && (
              <KanbanColumnComponent
                column={activeColumn}
                onTaskCreate={onTaskCreate}
                onTaskUpdate={onTaskUpdate}
                onTaskDelete={onTaskDelete}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
} 
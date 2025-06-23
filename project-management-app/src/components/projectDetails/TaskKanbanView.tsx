'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, User, Calendar, AlertTriangle } from 'lucide-react'
import TaskDetailModal from './TaskDetailModal'

interface TaskKanbanViewProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
}

const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100 border-gray-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'DONE', title: 'Done', color: 'bg-green-50 border-green-200' },
  { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-50 border-red-200' }
]

export default function TaskKanbanView({ tasks, onTaskUpdate, onTaskDelete }: TaskKanbanViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
      .sort((a, b) => a.position - b.position)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isTaskOverdue = (task: Task) => {
    return task.eta && new Date(task.eta) < new Date() && task.status !== 'DONE'
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const updatedTask = { ...draggedTask, status: newStatus }
      await updateTaskStatus(updatedTask)
      onTaskUpdate(updatedTask)
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setDraggedTask(null)
    }
  }

  const updateTaskStatus = async (task: Task) => {
    const response = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: task.status,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update task status')
    }

    return response.json()
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card
      className={`p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow ${
        isTaskOverdue(task) ? 'border-red-300 bg-red-50' : ''
      }`}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onClick={() => setSelectedTask(task)}
    >
      <div className="space-y-3">
        {/* Title and Priority */}
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 pr-2">
            {task.title}
          </h4>
          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Milestone */}
        {task.milestone && (
          <div className="flex items-center gap-1">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              {task.milestone}
            </span>
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignee.name || task.assignee.username}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isTaskOverdue(task) && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
            {task.eta && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={isTaskOverdue(task) ? 'text-red-600 font-medium' : ''}>
                  {formatDate(task.eta)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dependencies indicator */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div className="text-xs text-blue-600">
            Depends on {task.dependencies.length} task(s)
          </div>
        )}
      </div>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {KANBAN_COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id)
        
        return (
          <div
            key={column.id}
            className={`rounded-lg border-2 border-dashed p-4 min-h-[500px] ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">
                {column.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                {columnTasks.length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No tasks in {column.title.toLowerCase()}
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        )
      })}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
} 
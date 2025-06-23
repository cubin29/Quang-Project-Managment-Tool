'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import { Task, Project, TaskViewMode, TaskFilters, User } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Filter, LayoutGrid, Table, Calendar } from 'lucide-react'
import TaskCreateModal from './TaskCreateModal'
import TaskFiltersPanel from './TaskFiltersPanel'

// Lazy load heavy task views
const TaskKanbanView = lazy(() => import('./TaskKanbanView'))
const TaskTableView = lazy(() => import('./TaskTableView'))
const TaskGanttView = lazy(() => import('./TaskGanttView'))

interface TaskManagementProps {
  tasks: Task[]
  project: Project
  viewMode: TaskViewMode
  filters: TaskFilters
  onViewModeChange: (mode: TaskViewMode) => void
  onFiltersChange: (filters: TaskFilters) => void
  onTaskCreate: (task: Task) => void
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
}

export default function TaskManagement({
  tasks,
  project,
  viewMode,
  filters,
  onViewModeChange,
  onFiltersChange,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}: TaskManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Memoize filtered tasks to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false
      }
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false
      }
      if (filters.assigneeId && filters.assigneeId.length > 0 && 
          (!task.assigneeId || !filters.assigneeId.includes(task.assigneeId))) {
        return false
      }
      if (filters.milestone && filters.milestone.length > 0 && 
          (!task.milestone || !filters.milestone.includes(task.milestone))) {
        return false
      }
      if (filters.overdue && task.eta && new Date(task.eta) >= new Date()) {
        return false
      }
      return true
    })
  }, [tasks, filters])

  // Memoize task statistics
  const taskStats = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter(task => task.status === 'DONE').length
    const inProgress = filteredTasks.filter(task => task.status === 'IN_PROGRESS').length
    const overdue = filteredTasks.filter(task => 
      task.eta && new Date(task.eta) < new Date() && task.status !== 'DONE'
    ).length

    return { total, completed, inProgress, overdue }
  }, [filteredTasks])

  // Memoize active filters check
  const hasActiveFilters = useMemo(() => {
    return (filters.status && filters.status.length > 0) ||
           (filters.priority && filters.priority.length > 0) ||
           (filters.assigneeId && filters.assigneeId.length > 0) ||
           (filters.milestone && filters.milestone.length > 0) ||
           filters.overdue
  }, [filters])

  const getViewModeIcon = (mode: TaskViewMode) => {
    switch (mode) {
      case 'kanban':
        return <LayoutGrid className="h-4 w-4" />
      case 'table':
        return <Table className="h-4 w-4" />
      case 'gantt':
        return <Calendar className="h-4 w-4" />
    }
  }

  const ViewLoadingFallback = () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Management</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {taskStats.total}</span>
            <span>Completed: {taskStats.completed}</span>
            <span>In Progress: {taskStats.inProgress}</span>
            {taskStats.overdue > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {taskStats.overdue} Overdue
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="bg-blue-600 text-white text-xs">
                Active
              </Badge>
            )}
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <TaskFiltersPanel
            filters={filters}
            tasks={tasks}
            onFiltersChange={onFiltersChange}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(['kanban', 'table', 'gantt'] as TaskViewMode[]).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange(mode)}
            className={`flex items-center gap-2 ${
              viewMode === mode 
                ? 'bg-white shadow-sm' 
                : 'hover:bg-gray-200'
            }`}
          >
            {getViewModeIcon(mode)}
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
        ))}
      </div>

      {/* Task Views - Lazy Loaded */}
      <div className="min-h-[400px]">
        {viewMode === 'kanban' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <TaskKanbanView
              tasks={filteredTasks}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
            />
          </Suspense>
        )}

        {viewMode === 'table' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <TaskTableView
              tasks={filteredTasks}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
            />
          </Suspense>
        )}

        {viewMode === 'gantt' && (
          <Suspense fallback={<ViewLoadingFallback />}>
            <TaskGanttView
              tasks={filteredTasks}
              onTaskUpdate={onTaskUpdate}
            />
          </Suspense>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskCreateModal
          project={project}
          tasks={tasks}
          onTaskCreate={onTaskCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </Card>
  )
} 
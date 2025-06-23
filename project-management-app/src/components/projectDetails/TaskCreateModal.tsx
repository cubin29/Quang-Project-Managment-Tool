'use client'

import { useState, useEffect } from 'react'
import { Task, Project, Priority, User, CreateTaskForm } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Save, User as UserIcon, Calendar } from 'lucide-react'

interface TaskCreateModalProps {
  project: Project
  tasks: Task[]
  onTaskCreate: (task: Task) => void
  onClose: () => void
}

export default function TaskCreateModal({ 
  project, 
  tasks, 
  onTaskCreate, 
  onClose 
}: TaskCreateModalProps) {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    milestone: '',
    priority: 'MEDIUM',
    impact: 3,
    effort: 3,
    startDate: undefined,
    eta: undefined,
    dueDate: undefined,
    assigneeId: '',
    parentId: '',
    dependencyIds: []
  })
  
  const [users, setUsers] = useState<User[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUsers(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Task name is required'
    }

    if (formData.startDate && formData.eta) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.eta)
      if (start >= end) {
        newErrors.eta = 'ETA must be after start date'
      }
    }

    if (formData.parentId === project.id) {
      newErrors.parentId = 'Task cannot be its own parent'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)

      const taskData = {
        ...formData,
        projectId: project.id,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        milestone: formData.milestone?.trim() || undefined,
        assigneeId: formData.assigneeId || undefined,
        parentId: formData.parentId || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        eta: formData.eta ? new Date(formData.eta).toISOString() : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const result = await response.json()
      
      if (result.success) {
        onTaskCreate(result.data)
        onClose()
      } else {
        throw new Error(result.error || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create task' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateTaskForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const getParentTasks = () => {
    return tasks.filter(task => task.id !== formData.parentId)
  }

  const getDependencyTasks = () => {
    return tasks.filter(task => 
      !formData.dependencyIds?.includes(task.id) && 
      task.id !== formData.parentId
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter task name..."
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900"
                rows={3}
                placeholder="Enter task description..."
              />
            </div>

            {/* Milestone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Milestone
              </label>
              <input
                type="text"
                value={formData.milestone}
                onChange={(e) => handleInputChange('milestone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Enter milestone name..."
              />
            </div>

            {/* Priority and Impact/Effort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effort (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.effort}
                  onChange={(e) => handleInputChange('effort', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ETA
                </label>
                <input
                  type="date"
                  value={formData.eta ? new Date(formData.eta).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('eta', e.target.value ? new Date(e.target.value) : undefined)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                    errors.eta ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.eta && (
                  <p className="text-sm text-red-600 mt-1">{errors.eta}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => handleInputChange('assigneeId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">Select assignee...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Task */}
            {tasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Task
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleInputChange('parentId', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">No parent task</option>
                  {getParentTasks().map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dependencies */}
            {tasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dependencies
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white">
                  {getDependencyTasks().map((task) => (
                    <label key={task.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.dependencyIds?.includes(task.id) || false}
                        onChange={(e) => {
                          const currentDeps = formData.dependencyIds || []
                          const newDeps = e.target.checked
                            ? [...currentDeps, task.id]
                            : currentDeps.filter(id => id !== task.id)
                          handleInputChange('dependencyIds', newDeps)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{task.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Create Task</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
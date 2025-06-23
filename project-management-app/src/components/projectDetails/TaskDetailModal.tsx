'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Edit, Save, Trash2, MessageCircle, Paperclip } from 'lucide-react'

interface TaskDetailModalProps {
  task: Task
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onClose: () => void
}

export default function TaskDetailModal({ 
  task, 
  onTaskUpdate, 
  onTaskDelete, 
  onClose 
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTask)
      })

      if (response.ok) {
        const result = await response.json()
        onTaskUpdate(result.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onTaskDelete(task.id)
      onClose()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'DONE': return 'bg-green-100 text-green-800'
      case 'BLOCKED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                  className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 focus:border-blue-500 outline-none bg-white"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                {task.milestone && (
                  <Badge className="bg-purple-100 text-purple-800">
                    {task.milestone}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleDelete} size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={onClose} size="sm" className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">
                    {task.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Comments Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Comments</h3>
                  <Badge variant="outline">{task.comments?.length || 0}</Badge>
                </div>
                <div className="text-gray-500 text-sm">
                  Comments feature coming soon...
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">Attachments</h3>
                  <Badge variant="outline">{task.attachments?.length || 0}</Badge>
                </div>
                <div className="text-gray-500 text-sm">
                  Attachments feature coming soon...
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Task Details */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Task Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Assignee:</span>
                    <div className="font-medium">
                      {task.assignee?.name || task.assignee?.username || 'Unassigned'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Created by:</span>
                    <div className="font-medium">
                      {task.createdBy?.name || task.createdBy?.username}
                    </div>
                  </div>

                  {task.startDate && (
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <div className="font-medium">
                        {new Date(task.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {task.eta && (
                    <div>
                      <span className="text-gray-500">ETA:</span>
                      <div className="font-medium">
                        {new Date(task.eta).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {task.dueDate && (
                    <div>
                      <span className="text-gray-500">Due Date:</span>
                      <div className="font-medium">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500">Impact/Effort:</span>
                    <div className="font-medium">
                      {task.impact}/{task.effort}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">Created:</span>
                    <div className="font-medium">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <div className="font-medium">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Dependencies */}
              {task.dependencies && task.dependencies.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Dependencies</h3>
                  <div className="space-y-2">
                    {task.dependencies.map((dep) => (
                      <div key={dep.id} className="text-sm">
                        <div className="font-medium">{dep.title}</div>
                        <div className="text-gray-500">
                          Status: {dep.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Dependents */}
              {task.dependents && task.dependents.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Dependent Tasks</h3>
                  <div className="space-y-2">
                    {task.dependents.map((dep) => (
                      <div key={dep.id} className="text-sm">
                        <div className="font-medium">{dep.title}</div>
                        <div className="text-gray-500">
                          Status: {dep.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
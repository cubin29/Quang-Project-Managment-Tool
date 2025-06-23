'use client'

import { useState } from 'react'
import { Task, User, Priority, TaskStatus } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  User as UserIcon,
  Flag
} from 'lucide-react'
import { format } from 'date-fns'

interface TaskTableViewProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskDetail: (task: Task) => void
}

type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'startDate' | 'eta' | 'milestone'
type SortDirection = 'asc' | 'desc'

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800', 
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
  BLOCKED: 'bg-red-100 text-red-800'
}

export default function TaskTableView({ 
  tasks, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskDetail 
}: TaskTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'priority':
        const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
        break
      case 'assignee':
        aValue = a.assignee?.name || ''
        bValue = b.assignee?.name || ''
        break
      case 'startDate':
        aValue = a.startDate ? new Date(a.startDate) : new Date(0)
        bValue = b.startDate ? new Date(b.startDate) : new Date(0)
        break
      case 'eta':
        aValue = a.eta ? new Date(a.eta) : new Date(0)
        bValue = b.eta ? new Date(b.eta) : new Date(0)
        break
      case 'milestone':
        aValue = a.milestone || ''
        bValue = b.milestone || ''
        break
      default:
        aValue = a.title
        bValue = b.title
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    const updatedTask = { ...task, status: newStatus }
    onTaskUpdate(updatedTask)
  }

  const handlePriorityChange = async (task: Task, newPriority: Priority) => {
    const updatedTask = { ...task, priority: newPriority }
    onTaskUpdate(updatedTask)
  }

  const isOverdue = (task: Task) => {
    return task.eta && new Date(task.eta) < new Date() && task.status !== 'DONE'
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  )

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="title">Task</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="priority">Priority</SortHeader>
              <SortHeader field="assignee">Assignee</SortHeader>
              <SortHeader field="milestone">Milestone</SortHeader>
              <SortHeader field="startDate">Start Date</SortHeader>
              <SortHeader field="eta">ETA</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impact/Effort
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.map((task) => (
              <tr 
                key={task.id} 
                className={`hover:bg-gray-50 ${isOverdue(task) ? 'bg-red-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {task.title}
                        {isOverdue(task) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className={`text-xs px-2 py-1 rounded-full border-0 ${statusColors[task.status]} focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(task, e.target.value as Priority)}
                    className={`text-xs px-2 py-1 rounded-full border-0 ${priorityColors[task.priority]} focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {task.assignee ? (
                      <>
                        {task.assignee.avatar ? (
                          <img 
                            className="h-6 w-6 rounded-full mr-2" 
                            src={task.assignee.avatar} 
                            alt={task.assignee.name || ''} 
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                            <UserIcon className="h-3 w-3 text-gray-600" />
                          </div>
                        )}
                        <span className="text-sm text-gray-900">
                          {task.assignee.name || task.assignee.username}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.milestone ? (
                    <Badge variant="outline" className="text-xs">
                      {task.milestone}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.startDate ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(task.startDate), 'MMM dd')}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.eta ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(task.eta), 'MMM dd')}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Flag className="h-3 w-3 mr-1" />
                      {task.impact}/{task.effort}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskDetail(task)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskDetail(task)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskDelete(task.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No tasks found</div>
        </div>
      )}
    </Card>
  )
} 
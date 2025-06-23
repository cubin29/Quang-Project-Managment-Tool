'use client'

import { useState } from 'react'
import { ChangeRequest, Project, Task, ChangeRequestStatus } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Edit, Trash2, User, Calendar, Link } from 'lucide-react'
import ChangeRequestCreateModal from './ChangeRequestCreateModal'
import ChangeRequestDetailModal from './ChangeRequestDetailModal'

interface ChangeRequestTrackerProps {
  changeRequests: ChangeRequest[]
  project: Project
  tasks: Task[]
  onChangeRequestCreate: (changeRequest: ChangeRequest) => void
  onChangeRequestUpdate: (changeRequest: ChangeRequest) => void
  onChangeRequestDelete: (changeRequestId: string) => void
}

export default function ChangeRequestTracker({
  changeRequests,
  project,
  tasks,
  onChangeRequestCreate,
  onChangeRequestUpdate,
  onChangeRequestDelete
}: ChangeRequestTrackerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<ChangeRequest | null>(null)

  const getStatusColor = (status: ChangeRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const sortedChangeRequests = [...changeRequests].sort((a, b) => {
    // Sort by status priority (Pending first, then by date)
    const statusPriority = { 'PENDING': 0, 'APPROVED': 1, 'REJECTED': 2 }
    const statusDiff = statusPriority[a.status] - statusPriority[b.status]
    
    if (statusDiff !== 0) return statusDiff
    
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const getChangeRequestStats = () => {
    const total = changeRequests.length
    const pending = changeRequests.filter(cr => cr.status === 'PENDING').length
    const approved = changeRequests.filter(cr => cr.status === 'APPROVED').length
    const rejected = changeRequests.filter(cr => cr.status === 'REJECTED').length
    
    return { total, pending, approved, rejected }
  }

  const stats = getChangeRequestStats()

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Request Tracker</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {stats.total}</span>
            {stats.pending > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">
                {stats.pending} Pending
              </Badge>
            )}
            <span>Approved: {stats.approved}</span>
            <span>Rejected: {stats.rejected}</span>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Change Request List */}
      <div className="space-y-4">
        {sortedChangeRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests</h3>
            <p className="text-gray-500 mb-4">
              Track changes and their impact on project scope and timeline.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First Request
            </Button>
          </div>
        ) : (
          sortedChangeRequests.map((changeRequest) => (
            <Card 
              key={changeRequest.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedChangeRequest(changeRequest)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{changeRequest.title}</h4>
                    <Badge className={`text-xs ${getStatusColor(changeRequest.status)}`}>
                      {changeRequest.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {changeRequest.description}
                  </p>

                  {/* Impact */}
                  {changeRequest.impact && (
                    <div className="mb-3 p-2 bg-orange-50 rounded text-sm">
                      <strong>Impact:</strong> {changeRequest.impact}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{changeRequest.requester.name || changeRequest.requester.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(changeRequest.date)}</span>
                      </div>
                    </div>
                    
                    {changeRequest.linkedTasks && changeRequest.linkedTasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Link className="h-3 w-3" />
                        <span>{changeRequest.linkedTasks.length} linked task(s)</span>
                      </div>
                    )}
                  </div>

                  {/* Linked Tasks */}
                  {changeRequest.linkedTasks && changeRequest.linkedTasks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {changeRequest.linkedTasks.slice(0, 3).map((linkedTask) => {
                        const task = tasks.find(t => t.id === linkedTask.taskId)
                        return task ? (
                          <Badge key={task.id} variant="outline" className="text-xs">
                            {task.title}
                          </Badge>
                        ) : null
                      })}
                      {changeRequest.linkedTasks.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{changeRequest.linkedTasks.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedChangeRequest(changeRequest)
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this change request?')) {
                        onChangeRequestDelete(changeRequest.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Status Summary */}
      {changeRequests.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-3">Request Status Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Change Request Modal */}
      {showCreateModal && (
        <ChangeRequestCreateModal
          project={project}
          tasks={tasks}
          onChangeRequestCreate={onChangeRequestCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Change Request Detail Modal */}
      {selectedChangeRequest && (
        <ChangeRequestDetailModal
          changeRequest={selectedChangeRequest}
          tasks={tasks}
          onChangeRequestUpdate={onChangeRequestUpdate}
          onChangeRequestDelete={onChangeRequestDelete}
          onClose={() => setSelectedChangeRequest(null)}
        />
      )}
    </Card>
  )
} 
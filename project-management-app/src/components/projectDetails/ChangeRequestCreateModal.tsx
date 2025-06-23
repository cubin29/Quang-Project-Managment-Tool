'use client'

import { ChangeRequest, Project, Task } from '@/types'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ChangeRequestCreateModalProps {
  project: Project
  tasks: Task[]
  onChangeRequestCreate: (changeRequest: ChangeRequest) => void
  onClose: () => void
}

export default function ChangeRequestCreateModal({ 
  project, 
  tasks, 
  onChangeRequestCreate, 
  onClose 
}: ChangeRequestCreateModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create Change Request</h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center py-8 text-gray-500">
            Change request creation modal coming soon...
          </div>
        </div>
      </div>
    </div>
  )
} 
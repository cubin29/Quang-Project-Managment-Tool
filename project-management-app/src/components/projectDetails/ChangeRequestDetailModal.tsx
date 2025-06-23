'use client'

import { ChangeRequest, Task } from '@/types'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ChangeRequestDetailModalProps {
  changeRequest: ChangeRequest
  tasks: Task[]
  onChangeRequestUpdate: (changeRequest: ChangeRequest) => void
  onChangeRequestDelete: (changeRequestId: string) => void
  onClose: () => void
}

export default function ChangeRequestDetailModal({ 
  changeRequest, 
  tasks, 
  onChangeRequestUpdate, 
  onChangeRequestDelete, 
  onClose 
}: ChangeRequestDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{changeRequest.title}</h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center py-8 text-gray-500">
            Change request detail modal coming soon...
          </div>
        </div>
      </div>
    </div>
  )
} 
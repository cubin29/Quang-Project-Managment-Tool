'use client'

import { useState } from 'react'
import { Risk, Project, RiskSeverity, RiskLikelihood, RiskCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { X, Save } from 'lucide-react'

interface RiskCreateModalProps {
  project: Project
  onRiskCreate: (risk: Risk) => void
  onClose: () => void
}

export default function RiskCreateModal({ project, onRiskCreate, onClose }: RiskCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL' as RiskCategory,
    severity: 'MEDIUM' as RiskSeverity,
    likelihood: 'MEDIUM' as RiskLikelihood,
    mitigationPlan: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId: project.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        onRiskCreate(result.data)
        onClose()
      }
    } catch (error) {
      console.error('Error creating risk:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Risk</h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter risk title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Describe the risk..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as RiskCategory})}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="BUSINESS">Business</option>
                  <option value="RESOURCE">Resource</option>
                  <option value="SCHEDULE">Schedule</option>
                  <option value="QUALITY">Quality</option>
                  <option value="EXTERNAL">External</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value as RiskSeverity})}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Likelihood</label>
                <select
                  value={formData.likelihood}
                  onChange={(e) => setFormData({...formData, likelihood: e.target.value as RiskLikelihood})}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mitigation Plan</label>
              <textarea
                value={formData.mitigationPlan}
                onChange={(e) => setFormData({...formData, mitigationPlan: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="How will this risk be mitigated?"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} className="px-6 py-2">
                Cancel
              </Button>
              <Button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Create Risk
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
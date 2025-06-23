'use client'

import { useState } from 'react'
import { Project } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Save, X } from 'lucide-react'

interface ProjectDescriptionProps {
  project: Project
  onProjectUpdate: (project: Project) => void
}

export default function ProjectDescription({ project, onProjectUpdate }: ProjectDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(project.description || '')
  const [jiraUrl, setJiraUrl] = useState(project.jiraUrl || '')
  const [wikiUrl, setWikiUrl] = useState(project.wikiUrl || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim() || null,
          jiraUrl: jiraUrl.trim() || null,
          wikiUrl: wikiUrl.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      const result = await response.json()
      
      if (result.success) {
        onProjectUpdate(result.data)
        setIsEditing(false)
      } else {
        throw new Error(result.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setDescription(project.description || '')
    setJiraUrl(project.jiraUrl || '')
    setWikiUrl(project.wikiUrl || '')
    setIsEditing(false)
  }

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true // Empty is valid
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const canSave = isValidUrl(jiraUrl) && isValidUrl(wikiUrl)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Project Description</h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief project summary..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Jira URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jira Ticket URL
            </label>
            <input
              type="url"
              value={jiraUrl}
              onChange={(e) => setJiraUrl(e.target.value)}
              placeholder="https://your-jira.atlassian.net/browse/PROJECT-123"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                jiraUrl && !isValidUrl(jiraUrl) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {jiraUrl && !isValidUrl(jiraUrl) && (
              <p className="text-sm text-red-600 mt-1">Please enter a valid URL</p>
            )}
          </div>

          {/* Wiki URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wiki Documentation URL
            </label>
            <input
              type="url"
              value={wikiUrl}
              onChange={(e) => setWikiUrl(e.target.value)}
              placeholder="https://your-wiki.com/project-documentation"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                wikiUrl && !isValidUrl(wikiUrl) 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
            />
            {wikiUrl && !isValidUrl(wikiUrl) && (
              <p className="text-sm text-red-600 mt-1">Please enter a valid URL</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Description Display */}
          <div>
            {project.description ? (
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {project.description}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                No description provided. Click "Edit" to add a project description.
              </div>
            )}
          </div>

          {/* Documentation Links */}
          {(project.jiraUrl || project.wikiUrl) && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Documentation Links</h3>
              <div className="flex flex-wrap gap-3">
                {project.jiraUrl && (
                  <a
                    href={project.jiraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.34V2.84A.84.84 0 0 0 21.16 2H11.53zM2 11.53c2.4 0 4.35 1.97 4.35 4.35v1.78h1.7c2.4 0 4.34 1.94 4.34 4.34H2.84A.84.84 0 0 1 2 21.16V11.53z"/>
                    </svg>
                    Jira Ticket
                  </a>
                )}
                {project.wikiUrl && (
                  <a
                    href={project.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Wiki Documentation
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
} 
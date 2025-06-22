'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Copy, Trash2, Save, Loader2, X } from 'lucide-react'

interface Project {
  id?: string
  name: string
  description?: string
  status: string
  priority: string
  businessImpact: number
  techEffort: number
  revenueUplift?: number
  headcountSaving?: number
  projectValue?: number
  team?: string
  country?: string
  pic?: string
  startDate?: string
  endDate?: string
}

export default function ProjectManagePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProjects, setEditingProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  // Check for URL parameter to auto-create project
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create' && !loading) {
      // Wait a bit for the page to fully load, then trigger project creation
      const timer = setTimeout(() => {
        // Create new project directly here
        const newProject: Project = {
          name: '',
          description: '',
          status: 'PLANNING',
          priority: 'MEDIUM',
          businessImpact: 5,
          techEffort: 5,
          revenueUplift: 0,
          headcountSaving: 0,
          projectValue: 0,
          team: '',
          country: '',
          pic: '',
          startDate: '',
          endDate: ''
        }
        setEditingProjects(prev => [...prev, newProject])
        
        // Clean up the URL parameter after triggering the action
        router.replace('/projects/manage', { scroll: false })
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams, loading, router])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      
      if (result.success) {
        setProjects(result.data)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch projects: ' + (err as Error).message)
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const addNewProject = () => {
    const newProject: Project = {
      name: '',
      description: '',
      status: 'PLANNING',
      priority: 'MEDIUM',
      businessImpact: 5,
      techEffort: 5,
      revenueUplift: 0,
      headcountSaving: 0,
      projectValue: 0,
      team: '',
      country: '',
      pic: '',
      startDate: '',
      endDate: ''
    }
    setEditingProjects([...editingProjects, newProject])
  }

  const editProject = (project: Project) => {
    // Format the project data to match the form structure
    const formattedProject: Project = {
      ...project,
      // Ensure dates are in the correct format for date inputs
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      // Ensure numeric fields have default values
      businessImpact: project.businessImpact || 5,
      techEffort: project.techEffort || 5,
      revenueUplift: project.revenueUplift || 0,
      headcountSaving: project.headcountSaving || 0,
      projectValue: project.projectValue || 0,
      // Ensure string fields have default values
      team: project.team || '',
      country: project.country || '',
      pic: project.pic || '',
      description: project.description || ''
    }
    setEditingProject(formattedProject)
    setIsModalOpen(true)
  }

  const duplicateProject = (project: Project) => {
    const duplicated = { 
      ...project, 
      id: undefined,
      name: `${project.name} (Copy)`,
    }
    setEditingProjects([...editingProjects, duplicated])
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        await fetchProjects()
      } else {
        setError('Failed to delete project: ' + result.error)
      }
    } catch (err) {
      setError('Failed to delete project: ' + (err as Error).message)
      console.error('Error deleting project:', err)
    }
  }

  const removeEditingProject = (index: number) => {
    setEditingProjects(editingProjects.filter((_, i) => i !== index))
  }

  const updateEditingProject = (index: number, field: keyof Project, value: string | number) => {
    const updated = [...editingProjects]
    updated[index] = { ...updated[index], [field]: value }
    setEditingProjects(updated)
  }

  const updateModalProject = (field: keyof Project, value: string | number) => {
    if (editingProject) {
      setEditingProject({ ...editingProject, [field]: value })
    }
  }

  const saveModalProject = async () => {
    if (!editingProject) return

    setSaving(true)
    setError(null)
    try {
      // Prepare project data with proper field mapping
      const projectData = {
        name: editingProject.name,
        description: editingProject.description || '',
        status: editingProject.status,
        priority: editingProject.priority,
        businessImpact: editingProject.businessImpact,
        techEffort: editingProject.techEffort,
        revenueUplift: editingProject.revenueUplift || 0,
        headcountSaving: editingProject.headcountSaving || 0,
        projectValue: editingProject.projectValue || 0,
        team: editingProject.team || '',
        country: editingProject.country || '',
        pic: editingProject.pic || '',
        startDate: editingProject.startDate || null,
        endDate: editingProject.endDate || null,
      }

      let result
      if (editingProject.id) {
        // Update existing project
        console.log('Updating project:', editingProject.id, projectData)
        const response = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        })
        result = await response.json()
        console.log('Update result:', result)
      } else {
        // Create new project
        console.log('Creating project:', projectData)
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        })
        result = await response.json()
        console.log('Create result:', result)
      }

      if (result.success) {
        setIsModalOpen(false)
        setEditingProject(null)
        await fetchProjects()
      } else {
        setError(`Failed to save project: ${result.error}`)
      }
    } catch (err) {
      setError('Failed to save project: ' + (err as Error).message)
      console.error('Error saving project:', err)
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  const isProjectValid = (project: Project) => {
    return project.name && project.name.trim().length > 0
  }

  // Save individual project
  const saveProject = async (index: number) => {
    const project = editingProjects[index]
    if (!project) return

    setSavingIndex(index)
    setError(null)
    try {
      // Prepare project data with proper field mapping
      const projectData = {
        name: project.name,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        businessImpact: project.businessImpact,
        techEffort: project.techEffort,
        revenueUplift: project.revenueUplift || 0,
        headcountSaving: project.headcountSaving || 0,
        projectValue: project.projectValue || 0,
        team: project.team || '',
        country: project.country || '',
        pic: project.pic || '',
        startDate: project.startDate || null,
        endDate: project.endDate || null,
      }

      let result
      if (project.id) {
        // Update existing project
        console.log('Updating project:', project.id, projectData)
        const response = await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        })
        result = await response.json()
        console.log('Update result:', result)
      } else {
        // Create new project
        console.log('Creating project:', projectData)
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        })
        result = await response.json()
        console.log('Create result:', result)
      }

      if (result.success) {
        // Remove the saved project from editing list
        const newEditingProjects = [...editingProjects]
        newEditingProjects.splice(index, 1)
        setEditingProjects(newEditingProjects)
        await fetchProjects()
      } else {
        setError(`Failed to save project: ${result.error}`)
      }
    } catch (err) {
      setError('Failed to save project: ' + (err as Error).message)
      console.error('Error saving project:', err)
    } finally {
      setSavingIndex(null)
    }
  }

  // Save all projects (for bulk operations)
  const saveProjects = async () => {
    setSaving(true)
    setError(null)
    try {
      const promises = editingProjects.map(async (project) => {
        // Prepare project data with proper field mapping
        const projectData = {
          name: project.name,
          description: project.description || '',
          status: project.status,
          priority: project.priority,
          businessImpact: project.businessImpact,
          techEffort: project.techEffort,
          revenueUplift: project.revenueUplift || 0,
          headcountSaving: project.headcountSaving || 0,
          projectValue: project.projectValue || 0,
          team: project.team || '',
          country: project.country || '',
          pic: project.pic || '',
          startDate: project.startDate || null,
          endDate: project.endDate || null,
        }

        if (project.id) {
          // Update existing project
          console.log('Updating project:', project.id, projectData)
          const response = await fetch(`/api/projects/${project.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
          })
          const result = await response.json()
          console.log('Update result:', result)
          return result
        } else {
          // Create new project
          console.log('Creating project:', projectData)
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
          })
          const result = await response.json()
          console.log('Create result:', result)
          return result
        }
      })

      const results = await Promise.all(promises)
      const failedResults = results.filter(result => !result.success)

      if (failedResults.length === 0) {
        setEditingProjects([])
        await fetchProjects()
      } else {
        const errorMessages = failedResults.map(result => result.error).join(', ')
        setError(`Failed to save some projects: ${errorMessages}`)
      }
    } catch (err) {
      setError('Failed to save projects: ' + (err as Error).message)
      console.error('Error saving projects:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Button onClick={fetchProjects}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-2">Create, edit, and manage your project portfolio</p>
          </div>
          {/* Enhanced Add Project Button */}
          <Button 
            onClick={addNewProject}
            className="relative flex items-center justify-center gap-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <span className="hidden sm:inline">Add New Project</span>
              <span className="sm:hidden">Add Project</span>
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 transition-opacity duration-500 rounded-lg"></div>
          </Button>
        </div>

        {editingProjects.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingProjects.length === 1 ? 'Creating Project' : `Creating Projects (${editingProjects.length})`}
                </CardTitle>
                {editingProjects.length > 1 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingProjects([])}
                    >
                      Cancel All
                    </Button>
                    <Button 
                      onClick={saveProjects} 
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save All'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {editingProjects.map((project, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {project.id ? `Editing: ${project.name || 'Untitled Project'}` : `New Project ${index + 1}`}
                        </h3>
                        <div className={`w-2 h-2 rounded-full ${isProjectValid(project) ? 'bg-green-500' : 'bg-red-500'}`} 
                             title={isProjectValid(project) ? 'Ready to save' : 'Missing required fields'}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => saveProject(index)}
                          disabled={savingIndex === index || !isProjectValid(project)}
                          className="flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" />
                          {savingIndex === index ? 'Saving...' : 'Save'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeEditingProject(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {/* Basic Information */}
                       <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Project Name *
                           </label>
                           <input
                             type="text"
                             value={project.name}
                             onChange={(e) => updateEditingProject(index, 'name', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="Enter project name"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Description
                           </label>
                           <textarea
                             value={project.description}
                             onChange={(e) => updateEditingProject(index, 'description', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             rows={3}
                             placeholder="Project description"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Status
                           </label>
                           <select
                             value={project.status}
                             onChange={(e) => updateEditingProject(index, 'status', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                             <option value="PLANNING">Planning</option>
                             <option value="IN_PROGRESS">In Progress</option>
                             <option value="UAT">UAT</option>
                             <option value="DONE">Done</option>
                             <option value="CANCELLED">Cancelled</option>
                           </select>
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Priority
                           </label>
                           <select
                             value={project.priority}
                             onChange={(e) => updateEditingProject(index, 'priority', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                             <option value="LOW">Low</option>
                             <option value="MEDIUM">Medium</option>
                             <option value="HIGH">High</option>
                             <option value="URGENT">Urgent</option>
                           </select>
                         </div>
                       </div>

                       {/* Impact & Financial */}
                       <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Business Impact (1-10)
                           </label>
                           <input
                             type="number"
                             min="1"
                             max="10"
                             value={project.businessImpact}
                             onChange={(e) => updateEditingProject(index, 'businessImpact', parseInt(e.target.value))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Technical Effort (1-10)
                           </label>
                           <input
                             type="number"
                             min="1"
                             max="10"
                             value={project.techEffort}
                             onChange={(e) => updateEditingProject(index, 'techEffort', parseInt(e.target.value))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Project Value ($)
                           </label>
                           <input
                             type="number"
                             min="0"
                             value={project.projectValue || ''}
                             onChange={(e) => updateEditingProject(index, 'projectValue', parseFloat(e.target.value) || 0)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="0"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Revenue Uplift ($)
                           </label>
                           <input
                             type="number"
                             min="0"
                             value={project.revenueUplift || ''}
                             onChange={(e) => updateEditingProject(index, 'revenueUplift', parseFloat(e.target.value) || 0)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="0"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Headcount Saving (FTE/month)
                           </label>
                           <input
                             type="number"
                             min="0"
                             step="0.1"
                             value={project.headcountSaving || ''}
                             onChange={(e) => updateEditingProject(index, 'headcountSaving', parseFloat(e.target.value) || 0)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="0"
                           />
                         </div>
                       </div>

                       {/* Team & Timeline */}
                       <div className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Team
                           </label>
                           <input
                             type="text"
                             value={project.team || ''}
                             onChange={(e) => updateEditingProject(index, 'team', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="Team name"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Country
                           </label>
                           <input
                             type="text"
                             value={project.country || ''}
                             onChange={(e) => updateEditingProject(index, 'country', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="Country"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Person in Charge (PIC)
                           </label>
                           <input
                             type="text"
                             value={project.pic || ''}
                             onChange={(e) => updateEditingProject(index, 'pic', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="PIC name"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Start Date
                           </label>
                           <input
                             type="date"
                             value={project.startDate || ''}
                             onChange={(e) => updateEditingProject(index, 'startDate', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>

                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             End Date (ETA)
                           </label>
                           <input
                             type="date"
                             value={project.endDate || ''}
                             onChange={(e) => updateEditingProject(index, 'endDate', e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Projects Database ({projects.length})</CardTitle>
            <CardDescription>Structured view of your project portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first project</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 min-w-[1400px]">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-24">Actions</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[200px]">Project Name</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[250px]">Description</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-28">Status</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-24">Priority</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-20">Business<br/>Impact</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-20">Tech<br/>Effort</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-28">Project<br/>Value</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-28">Revenue<br/>Uplift</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-20">HC<br/>Saving</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[120px]">Team</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[100px]">Country</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[120px]">PIC</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-24">Start Date</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 w-24">End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr key={project.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => editProject(project)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              title="Edit Project"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => duplicateProject(project)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                              title="Duplicate Project"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => deleteProject(project.id)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="Delete Project"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 min-w-[200px]">
                          <div className="whitespace-normal break-words">{project.name}</div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600 min-w-[250px]">
                          <div className="whitespace-normal break-words">{project.description}</div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            project.status === 'DONE' ? 'bg-green-100 text-green-800' :
                            project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'UAT' ? 'bg-indigo-100 text-indigo-800' :
                            project.status === 'PLANNING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            project.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                            project.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            project.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          <span className="font-medium">{project.businessImpact}/10</span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          <span className="font-medium">{project.techEffort}/10</span>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-right">
                          {project.projectValue && project.projectValue > 0 ? `$${project.projectValue.toLocaleString()}` : '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-right">
                          {project.revenueUplift && project.revenueUplift > 0 ? `$${project.revenueUplift.toLocaleString()}` : '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          {project.headcountSaving && project.headcountSaving > 0 ? `${project.headcountSaving}` : '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 min-w-[120px]">
                          <div className="whitespace-normal break-words">{project.team || '-'}</div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 min-w-[100px]">
                          <div className="whitespace-normal break-words">{project.country || '-'}</div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 min-w-[120px]">
                          <div className="whitespace-normal break-words">{project.pic || '-'}</div>
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Project Modal */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProject.id ? 'Edit Project' : 'Create Project'}
                </h2>
                <Button
                  onClick={closeModal}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) => updateModalProject('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingProject.description || ''}
                    onChange={(e) => updateModalProject('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => updateModalProject('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="UAT">UAT</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editingProject.priority}
                    onChange={(e) => updateModalProject('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Impact (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingProject.businessImpact}
                    onChange={(e) => updateModalProject('businessImpact', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tech Effort (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingProject.techEffort}
                    onChange={(e) => updateModalProject('techEffort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Value ($)
                  </label>
                  <input
                    type="number"
                    value={editingProject.projectValue || ''}
                    onChange={(e) => updateModalProject('projectValue', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue Uplift ($)
                  </label>
                  <input
                    type="number"
                    value={editingProject.revenueUplift || ''}
                    onChange={(e) => updateModalProject('revenueUplift', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headcount Saving
                  </label>
                  <input
                    type="number"
                    value={editingProject.headcountSaving || ''}
                    onChange={(e) => updateModalProject('headcountSaving', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team
                  </label>
                  <input
                    type="text"
                    value={editingProject.team || ''}
                    onChange={(e) => updateModalProject('team', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editingProject.country || ''}
                    onChange={(e) => updateModalProject('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person in Charge (PIC)
                  </label>
                  <input
                    type="text"
                    value={editingProject.pic || ''}
                    onChange={(e) => updateModalProject('pic', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PIC name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingProject.startDate || ''}
                    onChange={(e) => updateModalProject('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (ETA)
                  </label>
                  <input
                    type="date"
                    value={editingProject.endDate || ''}
                    onChange={(e) => updateModalProject('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveModalProject}
                  disabled={saving || !editingProject.name?.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingProject.id ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
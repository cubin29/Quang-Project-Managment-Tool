'use client'

import React, { useEffect, useState } from 'react'
import { Project } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit, Trash2, DollarSign, Users, Calendar, TrendingUp, MapPin, User } from 'lucide-react'
import { formatCurrency, formatCurrencyCompact, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      const result = await response.json()
      
      if (result.success) {
        setProjects(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      
      if (result.success) {
        setProjects(projects.filter(p => p.id !== id))
      } else {
        alert('Failed to delete project: ' + result.error)
      }
    } catch (err) {
      alert('Failed to delete project')
      console.error('Error deleting project:', err)
    }
  }

  const getBusinessImpactColor = (impact: number) => {
    if (impact >= 8) return 'bg-red-100 text-red-800'
    if (impact >= 6) return 'bg-orange-100 text-orange-800'
    if (impact >= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getTechEffortColor = (effort: number) => {
    if (effort >= 8) return 'bg-red-100 text-red-800'
    if (effort >= 6) return 'bg-orange-100 text-orange-800'
    if (effort >= 4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1 sm:mt-2">Manage your project portfolio</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/projects/manage'}
            className="flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Manage Projects</span>
            <span className="sm:hidden">Manage</span>
          </Button>
          <Button 
            onClick={() => window.location.href = '/projects/manage'}
            className="flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Projects</h3>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Active Projects</h3>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'UAT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total Value</h3>
                <div className="text-sm sm:text-lg lg:text-xl font-bold leading-tight">
                  <span className="sm:hidden">
                    {formatCurrencyCompact(projects.reduce((sum, p) => sum + (p.projectValue || 0), 0))}
                  </span>
                  <span className="hidden sm:inline break-all">
                    {formatCurrency(projects.reduce((sum, p) => sum + (p.projectValue || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Revenue Uplift</h3>
                <div className="text-sm sm:text-lg lg:text-xl font-bold leading-tight">
                  <span className="sm:hidden">
                    {formatCurrencyCompact(projects.reduce((sum, p) => sum + (p.revenueUplift || 0), 0))}
                  </span>
                  <span className="hidden sm:inline break-all">
                    {formatCurrency(projects.reduce((sum, p) => sum + (p.revenueUplift || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">{project.name}</CardTitle>
                  <CardDescription className="mt-1 sm:mt-2 line-clamp-2">
                    {project.description}
                  </CardDescription>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>

              {/* Business Impact & Tech Effort */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Impact:</span>
                  <Badge className={getBusinessImpactColor(project.businessImpact || 1)} variant="outline">
                    {project.businessImpact || 1}/10
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Effort:</span>
                  <Badge className={getTechEffortColor(project.techEffort || 1)} variant="outline">
                    {project.techEffort || 1}/10
                  </Badge>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2 text-xs sm:text-sm">
                {project.projectValue && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 flex-shrink-0">Project Value:</span>
                    <span className="font-medium text-right truncate ml-2">{formatCurrency(project.projectValue)}</span>
                  </div>
                )}
                
                {project.revenueUplift && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 flex-shrink-0">Revenue Uplift:</span>
                    <span className="font-medium text-green-600 text-right truncate ml-2">+{formatCurrency(project.revenueUplift)}</span>
                  </div>
                )}

                {project.headcountSaving && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 flex-shrink-0">HC Saving:</span>
                    <span className="font-medium text-blue-600 text-right truncate ml-2">{project.headcountSaving}/month</span>
                  </div>
                )}

                {project.team && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 flex-shrink-0">Team:</span>
                    <span className="font-medium text-right truncate ml-2">{project.team}</span>
                  </div>
                )}

                {project.country && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex-shrink-0">Country:</span>
                    <div className="flex items-center gap-1 min-w-0 ml-2">
                      <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">{project.country}</span>
                    </div>
                  </div>
                )}

                {project.pic && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex-shrink-0">PIC:</span>
                    <div className="flex items-center gap-1 min-w-0 ml-2">
                      <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">{project.pic}</span>
                    </div>
                  </div>
                )}

                {project.endDate && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 flex-shrink-0">ETA:</span>
                    <span className="font-medium text-right truncate ml-2">{formatDate(project.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar (if available) */}
              {project.status === 'IN_PROGRESS' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first project</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  )
} 
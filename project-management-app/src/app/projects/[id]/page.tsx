'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { Project, Task, Risk, ChangeRequest, ActivityLog, TaskViewMode, TaskFilters, ProjectHealthStatus } from '@/types'
import ProjectDetailsHeader from '@/components/projectDetails/ProjectDetailsHeader'
import ProjectDescription from '@/components/projectDetails/ProjectDescription'
import TaskManagement from '@/components/projectDetails/TaskManagement'
import { Card } from '@/components/ui/card'

// Lazy load heavy components
const RiskManagement = lazy(() => import('@/components/projectDetails/RiskManagement'))
const ChangeRequestTracker = lazy(() => import('@/components/projectDetails/ChangeRequestTracker'))
const ActivityLogPanel = lazy(() => import('@/components/projectDetails/ActivityLogPanel'))

export default function ProjectDetailsPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>('kanban')
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({})

  // Memoize project health calculation
  const projectHealth = useMemo<ProjectHealthStatus | null>(() => {
    if (!tasks.length && !risks.length) return null
    
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'DONE').length
    const overdueTasks = tasks.filter(task => 
      task.eta && new Date(task.eta) < new Date() && task.status !== 'DONE'
    ).length
    const openHighRisks = risks.filter(risk => 
      risk.severity === 'HIGH' || risk.severity === 'CRITICAL'
    ).length

    const overdueTasksPercentage = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0
    
    let status: 'green' | 'yellow' | 'red' = 'green'
    
    if (openHighRisks > 2 || overdueTasksPercentage > 30) {
      status = 'red'
    } else if (openHighRisks > 0 || overdueTasksPercentage > 15) {
      status = 'yellow'
    }

    return {
      status,
      overdueTasksPercentage,
      openHighRisksCount: openHighRisks,
      totalTasks,
      completedTasks
    }
  }, [tasks, risks])

  // Optimized data fetching with reduced payload
  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch project with minimal data first
      const projectResponse = await fetch(`/api/projects/${projectId}`)
      
      if (!projectResponse.ok) {
        throw new Error('Failed to fetch project details')
      }

      const projectData = await projectResponse.json()
      
      if (projectData.success) {
        setProject(projectData.data)
        
        // Fetch related data in parallel with smaller payloads
        const [tasksRes, risksRes, changeRequestsRes, activityLogsRes] = await Promise.all([
          fetch(`/api/projects/${projectId}?include=tasks`),
          fetch(`/api/projects/${projectId}?include=risks`),
          fetch(`/api/projects/${projectId}?include=changeRequests`),
          fetch(`/api/projects/${projectId}?include=activityLogs`)
        ])

        const [tasksData, risksData, changeRequestsData, activityLogsData] = await Promise.all([
          tasksRes.json(),
          risksRes.json(),
          changeRequestsRes.json(),
          activityLogsRes.json()
        ])

        if (tasksData.success) setTasks(tasksData.data.tasks || [])
        if (risksData.success) setRisks(risksData.data.risks || [])
        if (changeRequestsData.success) setChangeRequests(changeRequestsData.data.changeRequests || [])
        if (activityLogsData.success) setActivityLogs(activityLogsData.data.activityLogs || [])
      } else {
        throw new Error(projectData.error || 'Failed to fetch project details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
    }
  }, [projectId, fetchProjectDetails])

  // Memoized handlers to prevent unnecessary re-renders
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
  }, [])

  const handleTaskCreate = useCallback((newTask: Task) => {
    setTasks(prev => [...prev, newTask])
  }, [])

  const handleTaskDelete = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }, [])

  const handleRiskUpdate = useCallback((updatedRisk: Risk) => {
    setRisks(prev => prev.map(risk => 
      risk.id === updatedRisk.id ? updatedRisk : risk
    ))
  }, [])

  const handleRiskCreate = useCallback((newRisk: Risk) => {
    setRisks(prev => [...prev, newRisk])
  }, [])

  const handleRiskDelete = useCallback((riskId: string) => {
    setRisks(prev => prev.filter(risk => risk.id !== riskId))
  }, [])

  const handleChangeRequestUpdate = useCallback((updatedCR: ChangeRequest) => {
    setChangeRequests(prev => prev.map(cr => 
      cr.id === updatedCR.id ? updatedCR : cr
    ))
  }, [])

  const handleChangeRequestCreate = useCallback((newCR: ChangeRequest) => {
    setChangeRequests(prev => [...prev, newCR])
  }, [])

  const handleChangeRequestDelete = useCallback((crId: string) => {
    setChangeRequests(prev => prev.filter(cr => cr.id !== crId))
  }, [])

  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setProject(updatedProject)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Project not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[98vw] mx-auto p-6 space-y-6">
        {/* Project Header with Health Status */}
        <ProjectDetailsHeader 
          project={project}
          projectHealth={projectHealth}
          onProjectUpdate={handleProjectUpdate}
        />

        {/* Project Description & Documentation */}
        <ProjectDescription 
          project={project}
          onProjectUpdate={handleProjectUpdate}
        />

        {/* Task Management Section */}
        <TaskManagement
          tasks={tasks}
          project={project}
          viewMode={taskViewMode}
          filters={taskFilters}
          onViewModeChange={setTaskViewMode}
          onFiltersChange={setTaskFilters}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />

        {/* Risk Management & Change Request Tracker - Lazy Loaded */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={
            <Card className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </Card>
          }>
            <RiskManagement
              risks={risks}
              project={project}
              onRiskCreate={handleRiskCreate}
              onRiskUpdate={handleRiskUpdate}
              onRiskDelete={handleRiskDelete}
            />
          </Suspense>

          <Suspense fallback={
            <Card className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </Card>
          }>
            <ChangeRequestTracker
              changeRequests={changeRequests}
              project={project}
              tasks={tasks}
              onChangeRequestCreate={handleChangeRequestCreate}
              onChangeRequestUpdate={handleChangeRequestUpdate}
              onChangeRequestDelete={handleChangeRequestDelete}
            />
          </Suspense>
        </div>

        {/* Activity Log Panel - Lazy Loaded */}
        <Suspense fallback={
          <Card className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        }>
          <ActivityLogPanel
            activityLogs={activityLogs}
            project={project}
          />
        </Suspense>
      </div>
    </div>
  )
} 
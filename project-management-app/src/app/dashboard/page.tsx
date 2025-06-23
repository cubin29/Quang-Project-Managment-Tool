'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Plus,
  ArrowUpRight,
  Globe,
  Briefcase,
  Zap,
  Calendar,
  User,
  MapPin,
  Activity,
  Star,
  Flag,
  Filter,
  Award,
      BarChart3,
    Hash,
    AlertCircle,
    X
  } from 'lucide-react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts'

interface Project {
  id: string
  name: string
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
  endDate?: string
}

interface ActionableItem {
  id: string
  projectId: string
  projectName: string
  task: string
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: string
  priority: 'high' | 'medium' | 'low'
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredPriority, setHoveredPriority] = useState<string | null>(null)
  const [clickedPriority, setClickedPriority] = useState<string | null>(null)
  const [matrixProjects, setMatrixProjects] = useState<Project[]>([])
  const [statsFilter, setStatsFilter] = useState<'ALL' | 'DONE' | 'ONGOING'>('ALL')
  const [strategicFilter, setStrategicFilter] = useState<'COMPLETED' | 'ACTIVE'>('ACTIVE')
  const [matrixStatusFilter, setMatrixStatusFilter] = useState<string[]>(['PLANNING', 'IN_PROGRESS'])
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const projectsPerPage = 10
  const projectPositionsRef = useRef<Map<string, {x: string, y: string}>>(new Map())
  const [clickedProject, setClickedProject] = useState<string | null>(null)

  // Mock actionable items - in real app, this would come from API
  const [actionableItems] = useState<ActionableItem[]>([
    {
      id: '1',
      projectId: '1',
      projectName: 'Data Platform Modernization',
      task: 'Complete architecture review',
      status: 'pending',
      dueDate: '2024-01-15',
      priority: 'high'
    },
    {
      id: '2',
      projectId: '2',
      projectName: 'CRM System Upgrade',
      task: 'User acceptance testing',
      status: 'in_progress',
      dueDate: '2024-01-10',
      priority: 'high'
    },
    {
      id: '3',
      projectId: '3',
      projectName: 'Mobile App Development',
      task: 'Deploy to staging environment',
      status: 'completed',
      dueDate: '2024-01-08',
      priority: 'medium'
    }
  ])

  // Clear position cache when projects change
  useEffect(() => {
    projectPositionsRef.current.clear()
  }, [projects])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutsidePopup = (event: MouseEvent) => {
      if (clickedProject) {
        const target = event.target as HTMLElement
        // Check if click is outside the popup and not on a dot
        if (!target.closest('.project-popup') && !target.closest('.matrix-dot')) {
          setClickedProject(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutsidePopup)
    return () => {
      document.removeEventListener('mousedown', handleClickOutsidePopup)
    }
  }, [clickedProject])

  useEffect(() => {
    fetchProjects()
  }, [])

  // Update matrix projects when filter changes
  useEffect(() => {
    setMatrixProjects(projects.filter((p: Project) => 
      matrixStatusFilter.includes(p.status)
    ))
  }, [matrixStatusFilter, projects])

  // Handle clicks outside the popup to close sticky popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if click is outside the popup and card
      if (clickedPriority && 
          !target.closest('.priority-popup') && 
          !target.closest('.priority-card')) {
        setClickedPriority(null)
      }
    }

    if (clickedPriority) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [clickedPriority])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const result = await response.json()
      if (result.success) {
        setProjects(result.data)
        // Filter projects for Impact/Effort matrix based on selected statuses
        setMatrixProjects(result.data.filter((p: Project) => 
          matrixStatusFilter.includes(p.status)
        ))
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter projects based on stats filter
  const getFilteredProjects = () => {
    switch (statsFilter) {
      case 'DONE':
        return projects.filter(p => p.status === 'DONE')
      case 'ONGOING':
        return projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'UAT' || p.status === 'PLANNING')
      default:
        return projects
    }
  }

  const filteredProjects = getFilteredProjects()

  // Calculate key metrics based on filtered projects
  const totalProjects = filteredProjects.length
  const activeProjects = filteredProjects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'UAT').length
  const completedProjects = filteredProjects.filter(p => p.status === 'DONE').length
  const plannedProjects = filteredProjects.filter(p => p.status === 'PLANNING').length
  const highImpactProjects = filteredProjects.filter(p => p.businessImpact >= 8).length
  
  const totalProjectValue = filteredProjects.reduce((sum, p) => sum + (p.projectValue || 0), 0)
  const totalRevenueUplift = filteredProjects.reduce((sum, p) => sum + (p.revenueUplift || 0), 0)
  const totalHeadcountSaving = filteredProjects.reduce((sum, p) => sum + (p.headcountSaving || 0), 0)
  
  // Get unique countries and teams
  const countries = [...new Set(projects.map(p => p.country).filter(Boolean))]
  const teams = [...new Set(projects.map(p => p.team).filter(Boolean))]

  // Matrix-based priority logic for alerts
  const getMatrixQuadrant = (impact: number, effort: number) => {
    if (impact >= 6 && effort <= 5) return 'Quick Wins'
    if (impact >= 6 && effort > 5) return 'Major Projects'
    if (impact < 6 && effort <= 5) return 'Fill-ins'
    return 'Thankless Tasks'
  }

  // Group projects by matrix quadrants for priority alerts - only incomplete projects
  const incompleteProjects = projects.filter(p => p.status !== 'DONE')
  const matrixQuadrants = {
    'Quick Wins': incompleteProjects.filter(p => p.businessImpact >= 6 && p.techEffort <= 5),
    'Major Projects': incompleteProjects.filter(p => p.businessImpact >= 6 && p.techEffort > 5),
    'Fill-ins': incompleteProjects.filter(p => p.businessImpact < 6 && p.techEffort <= 5),
    'Thankless Tasks': incompleteProjects.filter(p => p.businessImpact < 6 && p.techEffort > 5)
  }

  // Get projects with deadlines within 1 month
  const getUpcomingDeadlines = () => {
    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
    
    return projects.filter(p => {
      if (!p.endDate) return false
      const endDate = new Date(p.endDate)
      const now = new Date()
      return endDate >= now && endDate <= oneMonthFromNow
    }).sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
  }

  const upcomingDeadlines = getUpcomingDeadlines()

  // Status data for animated pie chart with values - showing all statuses
  const statusChartData = [
    { 
      name: 'Planning', 
      value: projects.filter(p => p.status === 'PLANNING').length,
      projectValue: projects.filter(p => p.status === 'PLANNING').reduce((sum, p) => sum + (p.projectValue || 0), 0),
      color: '#F59E0B',
      highlight: false
    },
    { 
      name: 'In Progress', 
      value: projects.filter(p => p.status === 'IN_PROGRESS').length,
      projectValue: projects.filter(p => p.status === 'IN_PROGRESS').reduce((sum, p) => sum + (p.projectValue || 0), 0),
      color: '#3B82F6',
      highlight: true
    },
    { 
      name: 'UAT', 
      value: projects.filter(p => p.status === 'UAT').length,
      projectValue: projects.filter(p => p.status === 'UAT').reduce((sum, p) => sum + (p.projectValue || 0), 0),
      color: '#6366F1',
      highlight: false
    },
    { 
      name: 'Completed', 
      value: projects.filter(p => p.status === 'DONE').length,
      projectValue: projects.filter(p => p.status === 'DONE').reduce((sum, p) => sum + (p.projectValue || 0), 0),
      color: '#10B981',
      highlight: false
    },
    { 
      name: 'Cancelled', 
      value: projects.filter(p => p.status === 'CANCELLED').length,
      projectValue: projects.filter(p => p.status === 'CANCELLED').reduce((sum, p) => sum + (p.projectValue || 0), 0),
      color: '#EF4444',
      highlight: false
    }
  ].filter(item => item.value > 0)

  // Strategic projects filtered by value and status
  const getStrategicProjects = () => {
    const filtered = strategicFilter === 'COMPLETED' 
      ? projects.filter(p => p.status === 'DONE')
      : projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'UAT' || p.status === 'PLANNING')
    
    return filtered
      .sort((a, b) => (b.projectValue || 0) - (a.projectValue || 0))
      .slice(0, 6)
  }

  const strategicProjects = getStrategicProjects()

  // Matrix status filter functions
  const toggleMatrixStatus = (status: string) => {
    setMatrixStatusFilter(prev => {
      if (prev.includes(status)) {
        // Remove status if already selected
        return prev.filter(s => s !== status)
      } else {
        // Add status if not selected
        return [...prev, status]
      }
    })
  }

  const getMatrixStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return { bg: 'bg-amber-500', border: 'border-amber-600' }
      case 'IN_PROGRESS': return { bg: 'bg-blue-500', border: 'border-blue-600' }
      case 'UAT': return { bg: 'bg-purple-500', border: 'border-purple-600' }
      case 'DONE': return { bg: 'bg-emerald-500', border: 'border-emerald-600' }
      case 'CANCELLED': return { bg: 'bg-red-500', border: 'border-red-600' }
      default: return { bg: 'bg-gray-500', border: 'border-gray-600' }
    }
  }

  const getMatrixStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'Planning'
      case 'IN_PROGRESS': return 'In Progress'
      case 'UAT': return 'UAT'
      case 'DONE': return 'Completed'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  // Get all available statuses from projects
  const availableStatuses = [...new Set(projects.map(p => p.status))].sort()

  // Calculate dynamic sizing based on number of projects displayed
  const getDynamicSizing = (projectCount: number) => {
    if (projectCount <= 5) {
      return {
        dotSize: 'w-5 h-5', // Large dots
        textSize: 'text-sm', // Large text
        maxWidth: 'max-w-32 sm:max-w-40', // Wide labels
        padding: 'px-2 sm:px-3 py-1.5'
      }
    } else if (projectCount <= 10) {
      return {
        dotSize: 'w-4 h-4', // Medium dots
        textSize: 'text-xs', // Medium text
        maxWidth: 'max-w-24 sm:max-w-32', // Medium labels
        padding: 'px-1.5 sm:px-2 py-1'
      }
    } else if (projectCount <= 20) {
      return {
        dotSize: 'w-3 h-3', // Small dots
        textSize: 'text-xs', // Small text
        maxWidth: 'max-w-20 sm:max-w-24', // Narrow labels
        padding: 'px-1 sm:px-1.5 py-0.5'
      }
    } else {
      return {
        dotSize: 'w-2.5 h-2.5', // Very small dots
        textSize: 'text-xs', // Very small text
        maxWidth: 'max-w-16 sm:max-w-20', // Very narrow labels
        padding: 'px-1 py-0.5'
      }
    }
  }

  const dynamicSizing = getDynamicSizing(matrixProjects.length)

  // Debug: Log project details to console
  console.log('Matrix Projects Debug:', {
    totalProjects: projects.length,
    matrixProjects: matrixProjects.length,
    selectedStatuses: matrixStatusFilter,
    projects: matrixProjects.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      impact: p.businessImpact,
      effort: p.techEffort
    }))
  })

  // Country flag mapping (using emoji flags for simplicity)
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'USA': '🇺🇸',
      'United States': '🇺🇸',
      'US': '🇺🇸',
      'UK': '🇬🇧',
      'United Kingdom': '🇬🇧',
      'Britain': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦',
      'Singapore': '🇸🇬',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Brazil': '🇧🇷',
      'Netherlands': '🇳🇱',
      'Mexico': '🇲🇽',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'South Korea': '🇰🇷',
      'Korea': '🇰🇷',
      'Thailand': '🇹🇭',
      'Malaysia': '🇲🇾',
      'Indonesia': '🇮🇩',
      'Philippines': '🇵🇭',
      'Vietnam': '🇻🇳',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Belgium': '🇧🇪',
      'Poland': '🇵🇱',
      'Czech Republic': '🇨🇿',
      'Hungary': '🇭🇺',
      'Romania': '🇷🇴',
      'Bulgaria': '🇧🇬',
      'Greece': '🇬🇷',
      'Turkey': '🇹🇷',
      'Israel': '🇮🇱',
      'UAE': '🇦🇪',
      'Saudi Arabia': '🇸🇦',
      'Egypt': '🇪🇬',
      'South Africa': '🇿🇦',
      'Nigeria': '🇳🇬',
      'Kenya': '🇰🇪',
      'Argentina': '🇦🇷',
      'Chile': '🇨🇱',
      'Colombia': '🇨🇴',
      'Peru': '🇵🇪',
      'New Zealand': '🇳🇿',
      'Russia': '🇷🇺',
      'Ukraine': '🇺🇦',
      'Portugal': '🇵🇹',
      'Ireland': '🇮🇪'
    }
    return flags[country] || '🌍'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-200 text-emerald-900 border border-emerald-300'
      case 'IN_PROGRESS': return 'bg-blue-200 text-blue-900 border border-blue-300'
      case 'UAT': return 'bg-purple-200 text-purple-900 border border-purple-300'
      case 'PLANNING': return 'bg-amber-200 text-amber-900 border border-amber-300'
      case 'CANCELLED': return 'bg-red-200 text-red-900 border border-red-300'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-200 text-red-900 border border-red-300'
      case 'HIGH': return 'bg-orange-200 text-orange-900 border border-orange-300'
      case 'MEDIUM': return 'bg-blue-200 text-blue-900 border border-blue-300'
      case 'LOW': return 'bg-slate-200 text-slate-900 border border-slate-300'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Wins': return 'bg-emerald-200 text-emerald-900 border border-emerald-300'
      case 'Major Projects': return 'bg-blue-200 text-blue-900 border border-blue-300'
      case 'Fill-ins': return 'bg-amber-200 text-amber-900 border border-amber-300'
      case 'Thankless Tasks': return 'bg-red-200 text-red-900 border border-red-300'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  const getQuadrantIcon = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Wins': return <Zap className="h-4 w-4 text-emerald-600" />
      case 'Major Projects': return <Target className="h-4 w-4 text-blue-600" />
      case 'Fill-ins': return <Clock className="h-4 w-4 text-amber-600" />
      case 'Thankless Tasks': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-slate-600" />
    }
  }

  const getActionItemStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  // Handle overlapping projects with grid-based positioning to prevent ANY overlap
  const getMatrixPositionWithOffset = (impact: number, effort: number, projectId: string, allProjects: any[]) => {
    // If we already calculated this project's position, return it
    if (projectPositionsRef.current.has(projectId)) {
      return projectPositionsRef.current.get(projectId)!
    }
    
    // Calculate base position
    // For X-axis (effort): 1-10 scale maps to 10%-90%
    const baseX = 10 + ((effort - 1) / 9) * 80 // 10% to 90%
    // For Y-axis (impact): Map 1-10 scale to 90%-10% with value 5 centered at 50%
    // Linear mapping: y = 100 - (impact * 8) + 10 = 110 - (impact * 8)
    // This maps: 1->102%, 5->70%, 10->30% - not right
    // Correct formula: 90 - ((impact-1) * 80/9) = standard mapping
    // To center 5 at 50%: 90 - ((5-1) * 80/9) = 54.44%, so offset by -4.44%
    const baseY = 90 - ((impact - 1) * 80 / 9) - 4.44
    
    // Check if this position conflicts with existing positions
    let finalX = baseX
    let finalY = baseY
    const minDistance = 4 // Very small minimum distance
    
    // Get all existing positions
    const existingPositions = Array.from(projectPositionsRef.current.values())
    
    // Check for conflicts and adjust position if needed with VERY small movements
    let attempts = 0
    while (attempts < 20) {
      let hasConflict = false
      
      for (const existingPos of existingPositions) {
        const existingX = parseFloat(existingPos.x.replace('%', ''))
        const existingY = parseFloat(existingPos.y.replace('%', ''))
        
        const distance = Math.sqrt(Math.pow(finalX - existingX, 2) + Math.pow(finalY - existingY, 2))
        
        if (distance < minDistance) {
          hasConflict = true
          // Move in TINY increments - just barely enough to avoid overlap
          const angle = (attempts * 45) % 360
          const radius = 1 + (attempts * 0.3) // Very small radius, max 7px
          let newX = baseX + Math.cos(angle * Math.PI / 180) * radius
          let newY = baseY + Math.sin(angle * Math.PI / 180) * radius
          
          // Keep very close to original position - only allow 5% deviation max
          const maxDeviation = 5
          finalX = Math.max(baseX - maxDeviation, Math.min(baseX + maxDeviation, newX))
          finalY = Math.max(baseY - maxDeviation, Math.min(baseY + maxDeviation, newY))
          
          // Still keep within overall matrix bounds
          finalX = Math.max(10, Math.min(90, finalX))
          finalY = Math.max(10, Math.min(90, finalY))
          break
        }
      }
      
      if (!hasConflict) break
      attempts++
    }
    
    const position = { x: `${finalX}%`, y: `${finalY}%` }
    projectPositionsRef.current.set(projectId, position)
    return position
  }

  // Check if project name would overlap with quadrant labels and adjust position
  const getProjectNamePosition = (impact: number, effort: number, projectName: string) => {
    const x = ((effort - 1) / 9) * 100
    const y = 90 - ((impact - 1) * 80 / 9) - 4.44 // Match the matrix positioning
    
    // Define very precise quadrant label zones based on actual label positions
    const majorProjectsZone = x > 75 && y < 15 // Very specific zone for Major Projects label
    const quickWinsZone = x < 25 && y < 15 // Quick Wins area
    const fillInsZone = x < 25 && y > 85 // Fill-ins area
    const thanklessTasksZone = x > 75 && y > 85 // Thankless Tasks area
    
    // For projects very close to Major Projects label, use special positioning
    if (majorProjectsZone) {
      // If very close to top-right corner, position name to the left of the dot
      if (x > 85 && y < 10) {
        return { position: 'top-0 right-6', transform: 'translate-x-0 -translate-y-1/2' }
      }
      // Otherwise position below with more space
      return { position: 'top-10', transform: '-translate-x-1/2' }
    }
    
    // For other zones, use standard positioning
    if (quickWinsZone) {
      return { position: 'top-6', transform: '-translate-x-1/2' }
    }
    
    if (fillInsZone || thanklessTasksZone) {
      return { position: 'bottom-6', transform: '-translate-x-1/2' }
    }
    
    // Default position for center areas
    return { position: 'top-6', transform: '-translate-x-1/2' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Executive Dashboard</h1>
            <p className="text-gray-600 mt-1 sm:mt-2">Strategic overview of project portfolio and business impact</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button className="bg-white border-2 border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-blue-100 focus:outline-none hover:bg-blue-50 flex items-center justify-center gap-2 text-sm sm:text-base">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Strategic Planning</span>
              <span className="sm:hidden">Strategy</span>
            </Button>
            
            {/* Enhanced New Project Button - Using Design System */}
            <Button 
              onClick={() => router.push('/projects/manage?action=create')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0 focus:ring-4 focus:ring-blue-200 focus:outline-none relative flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                </div>
                <span className="hidden sm:inline">Create New Project</span>
                <span className="sm:hidden">New Project</span>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 transition-opacity duration-500 rounded-xl"></div>
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators with Integrated Filter */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Portfolio Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators across project portfolio</CardDescription>
              </div>
              {/* Stats Filter Switch - Integrated */}
              <div className="bg-gray-50 rounded-lg p-1 border border-gray-200">
                <div className="flex">
                  {(['ALL', 'ONGOING', 'DONE'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatsFilter(filter)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        statsFilter === filter
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="h-3 w-3" />
                        {filter === 'ALL' ? 'All' : filter === 'ONGOING' ? 'Ongoing' : 'Completed'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 mb-1">Total Projects</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">{totalProjects}</p>
                    <p className="text-xs text-slate-700 flex items-center">
                      <Hash className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{statsFilter.toLowerCase()} portfolio</span>
                    </p>
                  </div>
                  <div className="bg-slate-600 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-800 mb-1">Portfolio Value</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-900 mb-1 sm:mb-2 truncate">{formatCurrency(totalProjectValue)}</p>
                    <p className="text-xs text-blue-700 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Total investment</span>
                    </p>
                  </div>
                  <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 border border-emerald-300 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-emerald-800 mb-1">Revenue Uplift</p>
                    <p className="text-lg sm:text-2xl font-bold text-emerald-900 mb-1 sm:mb-2 truncate">{formatCurrency(totalRevenueUplift)}</p>
                    <p className="text-xs text-emerald-700 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Projected annual</span>
                    </p>
                  </div>
                  <div className="bg-emerald-600 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-purple-800 mb-1">HC Savings</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-900 mb-1 sm:mb-2">{totalHeadcountSaving.toFixed(1)}</p>
                    <p className="text-xs text-purple-700 flex items-center">
                      <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">FTE per month</span>
                    </p>
                  </div>
                  <div className="bg-purple-600 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-orange-200 border border-orange-300 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-orange-800 mb-1">High Impact</p>
                    <p className="text-2xl font-bold text-orange-900 mb-2">{highImpactProjects}</p>
                    <p className="text-xs text-orange-700 flex items-center">
                      <Target className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Impact score ≥ 8</span>
                    </p>
                  </div>
                  <div className="bg-orange-600 p-2 rounded-lg ml-2 flex-shrink-0">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Overview & Matrix-Based Priority Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Enhanced Project Status Chart with Values Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Project Status Overview
              </CardTitle>
              <CardDescription className="text-sm">Portfolio execution status with project values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row">
                <div className="h-64 sm:h-80 w-full sm:w-2/3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={entry.highlight ? '#1D4ED8' : 'none'}
                            strokeWidth={entry.highlight ? 3 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} projects`,
                          name,
                          `Value: ${formatCurrency(props.payload.projectValue)}`
                        ]}
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Project Values Summary */}
                <div className="w-1/3 pl-4 flex flex-col justify-center">
                  <h4 className="font-semibold text-sm mb-4 text-gray-900">Project Values by Status</h4>
                  <div className="space-y-3">
                    {statusChartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-xs font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold">{formatCurrency(item.projectValue)}</div>
                          <div className="text-xs text-gray-500">{item.value} projects</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matrix-Based Priority & Risk Alerts with Deadline Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ongoing Projects Prioritisation
              </CardTitle>
              <CardDescription>Incomplete projects prioritized by Impact/Effort quadrants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto relative">
                {(['Quick Wins', 'Major Projects', 'Fill-ins', 'Thankless Tasks'] as const).map((quadrant, quadrantIndex) => {
                  const projectList = matrixQuadrants[quadrant]
                  const isPopupVisible = hoveredPriority === quadrant || clickedPriority === quadrant
                  
                  return projectList.length > 0 && (
                    <div
                      key={quadrant}
                      className={`priority-card relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getQuadrantColor(quadrant)} hover:shadow-lg ${clickedPriority === quadrant ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                      onMouseEnter={() => {
                        // Only show hover if not clicked/sticky
                        if (!clickedPriority) {
                          setHoveredPriority(quadrant)
                        }
                      }}
                      onMouseLeave={() => {
                        // Only hide hover if not clicked/sticky
                        if (!clickedPriority) {
                          setHoveredPriority(null)
                        }
                      }}
                      onClick={() => {
                        // Toggle clicked state
                        if (clickedPriority === quadrant) {
                          setClickedPriority(null)
                        } else {
                          setClickedPriority(quadrant)
                          setHoveredPriority(null) // Clear hover when clicking
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getQuadrantIcon(quadrant)}
                          <span className="font-medium">
                            {quadrant}: {projectList.length} Project{projectList.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white">
                            {projectList.length}
                          </Badge>
                          {clickedPriority === quadrant && (
                            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                              Click outside to close
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Popup - Show on hover or click */}
                      {isPopupVisible && (
                        <div className="fixed inset-0 z-50 pointer-events-none">
                          <div 
                            className="priority-popup absolute bg-white border rounded-lg shadow-2xl max-h-64 overflow-y-auto p-4 pointer-events-auto"
                            style={{ 
                              left: '50%', 
                              top: '50%', 
                              transform: 'translate(-50%, -50%)',
                              width: '400px',
                              maxWidth: '90vw'
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{quadrant} Projects:</h4>
                              {clickedPriority === quadrant && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setClickedPriority(null)
                                  }}
                                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                                  title="Close"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {projectList.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{project.name}</p>
                                    <p className="text-xs text-gray-600">
                                      Impact: {project.businessImpact}/10 • Effort: {project.techEffort}/10
                                    </p>
                                  </div>
                                  <Badge className={getStatusColor(project.status)} variant="outline">
                                    {project.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ETA Alert Card - Always Visible */}
                <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">
                      ETA ≤ 1 Month: {upcomingDeadlines.length} Project{upcomingDeadlines.length !== 1 ? 's' : ''}
                    </span>
                    <Badge variant="outline" className="bg-white text-red-600 border-red-200">
                      {upcomingDeadlines.length}
                    </Badge>
                  </div>
                  
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingDeadlines.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-100">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{project.name}</p>
                            <p className="text-xs text-gray-600">
                              ETA: {new Date(project.endDate!).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(project.status)} variant="outline">
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                      {upcomingDeadlines.length > 3 && (
                        <p className="text-xs text-red-600 italic mt-2">
                          +{upcomingDeadlines.length - 3} more projects with upcoming deadlines
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded border border-red-100 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">No projects at risk</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">All projects have adequate timeline buffers</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact/Effort Prioritization Matrix with Project Names */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              Impact/Effort Prioritization Matrix
            </CardTitle>
            <CardDescription className="text-sm">
              Strategic project positioning • Click status labels below to filter • Showing {matrixProjects.filter(p => p.businessImpact && p.techEffort && p.businessImpact >= 1 && p.businessImpact <= 10 && p.techEffort >= 1 && p.techEffort <= 10).length} of {matrixProjects.length} projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Matrix Visualization - Left Side */}
              <div className="lg:col-span-3">
                <div className="relative h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 mt-8 mb-8">
                  {/* Matrix Grid Lines */}
                  <div className="absolute inset-0">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
                  </div>

                  {/* Quadrant Labels - Outside Matrix */}
                  <div className="absolute -top-6 left-1/4 transform -translate-x-1/2 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded border border-emerald-200">
                    Quick Wins
                  </div>
                  <div className="absolute -top-6 right-1/4 transform translate-x-1/2 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded border border-blue-200">
                    Major Projects
                  </div>
                  <div className="absolute -bottom-6 left-1/4 transform -translate-x-1/2 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded border border-amber-200">
                    Fill-ins
                  </div>
                  <div className="absolute -bottom-6 right-1/4 transform translate-x-1/2 text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded border border-red-200">
                    Thankless Tasks
                  </div>

                  {/* Axis Labels */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700">
                    Technical Effort →
                  </div>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-700">
                    ← Business Impact
                  </div>

                  {/* Simple Clean Dots */}
                  {matrixProjects
                    .filter(project => {
                      const hasValidValues = project.businessImpact && project.techEffort && 
                                           project.businessImpact >= 1 && project.businessImpact <= 10 &&
                                           project.techEffort >= 1 && project.techEffort <= 10
                      return hasValidValues
                    })
                    .map((project, index) => {
                      const position = getMatrixPositionWithOffset(project.businessImpact, project.techEffort, project.id, matrixProjects)
                      const statusColor = getMatrixStatusColor(project.status)
                      
                      return (
                        <div
                          key={project.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 matrix-dot"
                          style={{ left: position.x, top: position.y }}
                          onClick={() => setClickedProject(clickedProject === project.id ? null : project.id)}
                          onMouseEnter={() => setHoveredProject(project.id)}
                          onMouseLeave={() => setHoveredProject(null)}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 ${statusColor.bg} ${statusColor.border} 
                            flex items-center justify-center text-white font-bold text-xs
                            hover:scale-110 transition-all duration-200 shadow-md
                            ${hoveredProject === project.id ? 'scale-110 ring-2 ring-blue-400' : ''}
                            ${clickedProject === project.id ? 'scale-125 ring-4 ring-green-400 shadow-lg' : ''}`}
                          >
                            {index + 1}
                          </div>
                        </div>
                      )
                    })}

                  {/* Popup rendered separately at matrix level */}
                  {clickedProject && (() => {
                    const project = matrixProjects.find(p => p.id === clickedProject)
                    if (!project) return null
                    
                    const position = getMatrixPositionWithOffset(project.businessImpact, project.techEffort, project.id, matrixProjects)
                    
                    return (
                      <div 
                        className="absolute z-[100] project-popup"
                        style={{ 
                          left: `calc(${position.x} + 2rem)`, 
                          top: position.y 
                        }}
                      >
                        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-48">
                          <div className="space-y-1">
                            <div>
                              <h4 className="font-semibold text-xs text-gray-900">{project.name}</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div>
                                <span className="text-gray-600">Impact:</span>
                                <span className="font-medium ml-1">{project.businessImpact}/10</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Effort:</span>
                                <span className="font-medium ml-1">{project.techEffort}/10</span>
                              </div>
                            </div>
                            
                            <div className="text-xs">
                              <span className="text-gray-600">Value:</span>
                              <span className="font-semibold ml-1 text-blue-600">
                                {formatCurrency(project.projectValue || 0)}
                              </span>
                            </div>
                            
                            {project.team && (
                              <div className="text-xs">
                                <span className="text-gray-600">Team:</span>
                                <span className="font-medium ml-1">{project.team}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Project List - Right Side with Pagination */}
              <div className="lg:col-span-1">
                <div className="bg-white border rounded-lg h-[564px] flex flex-col mt-8 mb-8">
                  {/* Projects List with Fixed Height */}
                  <div className="flex-1 p-3 pb-12 overflow-hidden">
                    {(() => {
                      // Get all valid projects grouped by quadrants
                      const allValidProjects = matrixProjects.filter(project => {
                        const hasValidValues = project.businessImpact && project.techEffort && 
                                             project.businessImpact >= 1 && project.businessImpact <= 10 &&
                                             project.techEffort >= 1 && project.techEffort <= 10
                        return hasValidValues
                      })
                      
                      // Calculate pagination
                      const totalProjects = allValidProjects.length
                      const totalPages = Math.ceil(totalProjects / projectsPerPage)
                      const startIndex = currentPage * projectsPerPage
                      const endIndex = startIndex + projectsPerPage
                      const currentProjects = allValidProjects.slice(startIndex, endIndex)
                      
                      // Group current page projects by quadrants
                      const quadrantGroups = (['Quick Wins', 'Major Projects', 'Fill-ins', 'Thankless Tasks'] as const).map((quadrant) => {
                        const quadrantProjects = currentProjects.filter(project => 
                          getMatrixQuadrant(project.businessImpact, project.techEffort) === quadrant
                        )
                        return { quadrant, projects: quadrantProjects }
                      }).filter(group => group.projects.length > 0)
                      
                      const quadrantColors = {
                        'Quick Wins': 'text-emerald-700 bg-emerald-50 border-emerald-200',
                        'Major Projects': 'text-blue-700 bg-blue-50 border-blue-200',
                        'Fill-ins': 'text-amber-700 bg-amber-50 border-amber-200',
                        'Thankless Tasks': 'text-red-700 bg-red-50 border-red-200'
                      }
                      
                      return (
                        <div className="space-y-3 mb-8">
                          {quadrantGroups.map(({ quadrant, projects }) => (
                            <div key={quadrant}>
                              <h5 className={`text-xs font-semibold px-2 py-1 rounded border mb-2 ${quadrantColors[quadrant]}`}>
                                {quadrant} ({projects.length})
                              </h5>
                              <div className="space-y-1 ml-1">
                                {projects.map((project) => {
                                  const projectIndex = allValidProjects.findIndex(p => p.id === project.id) + 1
                                  const statusColor = getMatrixStatusColor(project.status)
                                  
                                  return (
                                    <div
                                      key={project.id}
                                      className={`flex items-center gap-2 p-1.5 rounded transition-all duration-200 cursor-pointer text-xs
                                        ${hoveredProject === project.id 
                                          ? 'bg-blue-50 border border-blue-200' 
                                          : 'hover:bg-gray-50'}`}
                                      onMouseEnter={() => setHoveredProject(project.id)}
                                      onMouseLeave={() => setHoveredProject(null)}
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 ${statusColor.bg} ${statusColor.border} 
                                        flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
                                      >
                                        {projectIndex}
                                      </div>
                                      <span className="text-gray-800 font-medium truncate text-xs">{project.name}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                  
                  {/* Pagination Controls */}
                  {(() => {
                    const totalProjects = matrixProjects.filter(p => p.businessImpact && p.techEffort && p.businessImpact >= 1 && p.businessImpact <= 10 && p.techEffort >= 1 && p.techEffort <= 10).length
                    const totalPages = Math.ceil(totalProjects / projectsPerPage)
                    
                    if (totalPages <= 1) return null
                    
                    return (
                      <div className="border-t p-3 flex items-center justify-between bg-gray-50 rounded-b-lg">
                        <button
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Previous
                        </button>
                        
                        <span className="text-xs text-gray-600">
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={currentPage === totalPages - 1}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Interactive Status Legend */}
            <div className="mt-6 flex items-center justify-center flex-wrap gap-4 text-sm">
              {availableStatuses.map((status) => {
                const isSelected = matrixStatusFilter.includes(status)
                const statusColor = getMatrixStatusColor(status)
                const projectCount = projects.filter(p => p.status === status).length
                
                return (
                  <button
                    key={status}
                    onClick={() => toggleMatrixStatus(status)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-100 ${
                      isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-60'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${statusColor.bg} ${statusColor.border} border-2`}></div>
                    <span className={isSelected ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                      {getMatrixStatusLabel(status)} ({projectCount})
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strategic High-Impact Projects by Value with Status Filter */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Strategic High-Value Projects
                </CardTitle>
                <CardDescription className="text-sm">Top 6 projects by project value</CardDescription>
              </div>
              {/* Strategic Projects Filter */}
              <div className="bg-gray-50 rounded-lg p-1 border border-gray-200 w-full sm:w-auto">
                <div className="flex">
                  {(['ACTIVE', 'COMPLETED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStrategicFilter(filter)}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                        strategicFilter === filter
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      {filter === 'ACTIVE' ? (
                        <>
                          <span className="hidden sm:inline">Planning + In Progress</span>
                          <span className="sm:hidden">Active</span>
                        </>
                      ) : (
                        'Completed'
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {strategicProjects.map((project) => (
                <div key={project.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-gray-900 mb-1 truncate">{project.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)} variant="outline">
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="flex items-center gap-1 text-blue-600 mb-1">
                        <span className="font-bold text-sm">{formatCurrency(project.projectValue || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Revenue Uplift:</span>
                      <span className={`font-medium ${project.revenueUplift && project.revenueUplift > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {project.revenueUplift && project.revenueUplift > 0 ? formatCurrency(project.revenueUplift) : '-'}
                      </span>
                    </div>

                    {project.headcountSaving && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">HC Saving:</span>
                        <span className="font-medium text-purple-600">{project.headcountSaving} FTE/mo</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Effort:</span>
                      <span className="font-medium">{project.techEffort}/10</span>
                    </div>

                    {project.team && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Team:</span>
                        <span className="font-medium">{project.team}</span>
                      </div>
                    )}

                    {project.country && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Country:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-base">{getCountryFlag(project.country.replace(/^[A-Z]{2}\s/, ''))}</span>
                          <span className="font-medium">{project.country}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

                 {/* Actionable Items Section */}
         <Card>
           <CardHeader>
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
               <div>
                 <CardTitle className="flex items-center gap-2">
                   <Zap className="h-5 w-5 text-yellow-500" />
                   Next Actionable Items
                 </CardTitle>
                 <CardDescription>Key tasks and milestones requiring your attention</CardDescription>
               </div>
               
               {/* Secondary New Project Button */}
               <Button 
                 onClick={() => router.push('/projects/manage?action=create')}
                 variant="outline"
                 className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
               >
                 <Plus className="h-4 w-4" />
                 <span className="hidden sm:inline">Add Project</span>
                 <span className="sm:hidden">Add</span>
               </Button>
             </div>
           </CardHeader>
                     <CardContent>
             {actionableItems.length > 0 ? (
               <div className="space-y-3">
                 {actionableItems.map((item) => (
                   <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                     <div className="flex items-center gap-4">
                       <div className={`w-3 h-3 rounded-full ${
                         item.status === 'completed' ? 'bg-green-500' : 
                         item.status === 'in_progress' ? 'bg-blue-500' : 'bg-red-500'
                       }`}></div>
                       <div>
                         <p className="font-medium text-gray-900">{item.task}</p>
                         <p className="text-sm text-gray-600">{item.projectName}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <Badge className={getActionItemStatusColor(item.status)}>
                         {item.status.replace('_', ' ')}
                       </Badge>
                       <div className="text-sm text-gray-500 flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         {new Date(item.dueDate).toLocaleDateString()}
                       </div>
                       {item.priority === 'high' && (
                         <AlertTriangle className="h-4 w-4 text-red-500" />
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-12">
                 <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                   <Briefcase className="h-8 w-8 text-gray-400" />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tasks</h3>
                 <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                   Start your next strategic initiative by creating a new project with clear objectives and deliverables.
                 </p>
                 <Button 
                   onClick={() => router.push('/projects/manage?action=create')}
                   className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Create Your First Project
                 </Button>
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </div>
  )
} 
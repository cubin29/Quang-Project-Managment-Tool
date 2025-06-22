'use client'

import React, { useEffect, useState } from 'react'
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
  AlertCircle
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

  useEffect(() => {
    fetchProjects()
  }, [])

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
        // Filter projects for Impact/Effort matrix (Planning + In Progress)
        setMatrixProjects(result.data.filter((p: Project) => 
          p.status === 'PLANNING' || p.status === 'IN_PROGRESS'
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

  // Group projects by matrix quadrants for priority alerts
  const matrixQuadrants = {
    'Quick Wins': projects.filter(p => p.businessImpact >= 6 && p.techEffort <= 5),
    'Major Projects': projects.filter(p => p.businessImpact >= 6 && p.techEffort > 5),
    'Fill-ins': projects.filter(p => p.businessImpact < 6 && p.techEffort <= 5),
    'Thankless Tasks': projects.filter(p => p.businessImpact < 6 && p.techEffort > 5)
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
      case 'DONE': return 'status-done'
      case 'IN_PROGRESS': return 'status-in-progress'
      case 'UAT': return 'status-uat'
      case 'PLANNING': return 'status-planning'
      case 'CANCELLED': return 'status-cancelled'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'priority-urgent'
      case 'HIGH': return 'priority-high'
      case 'MEDIUM': return 'priority-medium'
      case 'LOW': return 'priority-low'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Quick Wins': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'Major Projects': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Fill-ins': return 'bg-amber-100 text-amber-800 border border-amber-200'
      case 'Thankless Tasks': return 'bg-red-100 text-red-800 border border-red-200'
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

  // Impact/Effort Matrix positioning
  const getMatrixPosition = (impact: number, effort: number) => {
    const x = ((effort - 1) / 9) * 100 // Scale 1-10 to 0-100%
    const y = ((10 - impact) / 9) * 100 // Invert Y axis, scale 1-10 to 0-100%
    return { x: `${x}%`, y: `${y}%` }
  }

  // Check if project name would overlap with quadrant labels and adjust position
  const getProjectNamePosition = (impact: number, effort: number, projectName: string) => {
    const x = ((effort - 1) / 9) * 100
    const y = ((10 - impact) / 9) * 100
    
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 mb-1">Total Projects</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{totalProjects}</p>
                    <p className="text-xs text-gray-600 flex items-center">
                      <Hash className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{statsFilter.toLowerCase()} portfolio</span>
                    </p>
                  </div>
                  <div className="bg-gray-500 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-700 mb-1">Portfolio Value</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-900 mb-1 sm:mb-2 truncate">{formatCurrency(totalProjectValue)}</p>
                    <p className="text-xs text-blue-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Total investment</span>
                    </p>
                  </div>
                  <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-700 mb-1">Revenue Uplift</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-900 mb-1 sm:mb-2 truncate">{formatCurrency(totalRevenueUplift)}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Projected annual</span>
                    </p>
                  </div>
                  <div className="bg-green-500 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-purple-700 mb-1">HC Savings</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-900 mb-1 sm:mb-2">{totalHeadcountSaving.toFixed(1)}</p>
                    <p className="text-xs text-purple-600 flex items-center">
                      <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">FTE per month</span>
                    </p>
                  </div>
                  <div className="bg-purple-500 p-1.5 sm:p-2 rounded-lg ml-2 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-orange-700 mb-1">High Impact</p>
                    <p className="text-2xl font-bold text-orange-900 mb-2">{highImpactProjects}</p>
                    <p className="text-xs text-orange-600 flex items-center">
                      <Target className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Impact score ≥ 8</span>
                    </p>
                  </div>
                  <div className="bg-orange-500 p-2 rounded-lg ml-2 flex-shrink-0">
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
                Strategic Priority Matrix
              </CardTitle>
              <CardDescription>Projects prioritized by Impact/Effort quadrants</CardDescription>
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
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
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
              Strategic project positioning • Planning & In-Progress projects only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 overflow-visible">
              {/* Matrix Grid Lines */}
              <div className="absolute inset-0">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
              </div>

              {/* Quadrant Labels */}
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 text-xs font-semibold text-green-700 bg-green-100 px-1 sm:px-2 py-1 rounded z-30">
                <div className="hidden sm:block">Quick Wins</div>
                <div className="sm:hidden">Quick</div>
                <div className="text-xs font-normal hidden sm:block">High Impact, Low Effort</div>
              </div>
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 text-xs font-semibold text-blue-700 bg-blue-100 px-1 sm:px-2 py-1 rounded z-30">
                <div className="hidden sm:block">Major Projects</div>
                <div className="sm:hidden">Major</div>
                <div className="text-xs font-normal hidden sm:block">High Impact, High Effort</div>
              </div>
              <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 text-xs font-semibold text-yellow-700 bg-yellow-100 px-1 sm:px-2 py-1 rounded z-30">
                <div className="hidden sm:block">Fill-ins</div>
                <div className="sm:hidden">Fill</div>
                <div className="text-xs font-normal hidden sm:block">Low Impact, Low Effort</div>
              </div>
              <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 text-xs font-semibold text-red-700 bg-red-100 px-1 sm:px-2 py-1 rounded z-30">
                <div className="hidden sm:block">Thankless Tasks</div>
                <div className="sm:hidden">Tasks</div>
                <div className="text-xs font-normal hidden sm:block">Low Impact, High Effort</div>
              </div>

              {/* Axis Labels */}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm font-medium text-gray-700">
                <span className="hidden sm:inline">Technical Effort (1-10)</span>
                <span className="sm:hidden">Effort</span>
              </div>
              <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs sm:text-sm font-medium text-gray-700">
                <span className="hidden sm:inline">Business Impact (1-10)</span>
                <span className="sm:hidden">Impact</span>
              </div>

              {/* Projects as positioned dots with always visible names */}
              {matrixProjects.map((project) => {
                const position = getMatrixPosition(project.businessImpact, project.techEffort)
                const quadrant = getMatrixQuadrant(project.businessImpact, project.techEffort)
                const namePositioning = getProjectNamePosition(project.businessImpact, project.techEffort, project.name)
                
                return (
                  <div
                    key={project.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                    style={{ left: position.x, top: position.y }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      project.status === 'IN_PROGRESS' ? 'bg-blue-500 border-blue-600' : 'bg-yellow-500 border-yellow-600'
                    } hover:scale-150 transition-transform duration-200`}>
                    </div>
                    
                    {/* Project Name Label - Always Visible with Smart Positioning */}
                    <div className={`absolute ${namePositioning.position} transform ${namePositioning.transform} bg-white border rounded px-1 sm:px-2 py-1 text-xs font-medium shadow-sm whitespace-nowrap z-20 max-w-20 sm:max-w-28`}>
                      <div className="truncate">{project.name}</div>
                    </div>
                    
                    {/* Detailed Hover Tooltip */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 w-48 sm:w-64 pointer-events-none">
                      <h4 className="font-semibold text-sm mb-2">{project.name}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Impact:</span>
                          <span className="font-medium">{project.businessImpact}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effort:</span>
                          <span className="font-medium">{project.techEffort}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quadrant:</span>
                          <span className="font-medium">{quadrant}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Status:</span>
                          <Badge className={getStatusColor(project.status)} variant="outline">
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {project.projectValue && (
                          <div className="flex justify-between">
                            <span>Value:</span>
                            <span className="font-medium">{formatCurrency(project.projectValue)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Matrix Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600"></div>
                <span>Planning</span>
              </div>
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
                        <DollarSign className="h-3 w-3" />
                        <span className="font-bold text-sm">{formatCurrency(project.projectValue || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {project.revenueUplift && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Revenue Uplift:</span>
                        <span className="font-medium text-green-600">{formatCurrency(project.revenueUplift)}</span>
                      </div>
                    )}

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
                          <span className="text-base">{getCountryFlag(project.country)}</span>
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
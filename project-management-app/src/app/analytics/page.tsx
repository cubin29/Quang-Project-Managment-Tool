'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  ScatterChart,
  Scatter
} from 'recharts'
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Globe,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Zap,
  Award,
  Briefcase
} from 'lucide-react'

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

// Enhanced color schemes for business metrics
const STATUS_COLORS = {
  PLANNING: '#3B82F6',
  IN_PROGRESS: '#10B981',
  UAT: '#6366F1',
  DONE: '#8B5CF6',
  CANCELLED: '#EF4444',
}

const IMPACT_COLORS = ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#450A0A']

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartTypes, setChartTypes] = useState({
    status: 'pie' as 'pie' | 'bar',
    impact: 'scatter' as 'scatter' | 'bar',
  })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading business intelligence...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Button onClick={fetchProjects}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Business Intelligence Data Processing
  const statusData = projects.length > 0 ? Object.entries(
    projects.reduce((acc, project) => {
      if (project.status) {
        acc[project.status] = (acc[project.status] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    status: status.replace('_', ' '),
    count,
    percentage: (count / projects.length) * 100,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#8884d8'
  })) : []

  // Impact vs Effort Analysis
  const impactEffortData = projects.map(project => ({
    name: project.name,
    impact: project.businessImpact || 1,
    effort: project.techEffort || 1,
    value: project.projectValue || 0,
    revenue: project.revenueUplift || 0,
    status: project.status,
    priority: project.priority,
    team: project.team,
    country: project.country
  }))

  // Business Value Distribution
  const valueDistribution = projects
    .filter(p => p.projectValue && p.projectValue > 0)
    .map(p => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      value: p.projectValue || 0,
      impact: p.businessImpact || 1,
      status: p.status
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Revenue Impact Analysis
  const revenueData = projects
    .filter(p => p.revenueUplift && p.revenueUplift > 0)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      revenue: p.revenueUplift || 0,
      headcount: p.headcountSaving || 0,
      impact: p.businessImpact || 1,
      effort: p.techEffort || 1
    }))
    .sort((a, b) => b.revenue - a.revenue)

  // Key Business Metrics
  const totalProjectValue = projects.reduce((sum, p) => sum + (p.projectValue || 0), 0)
  const totalRevenueUplift = projects.reduce((sum, p) => sum + (p.revenueUplift || 0), 0)
  const totalHeadcountSaving = projects.reduce((sum, p) => sum + (p.headcountSaving || 0), 0)
  const avgBusinessImpact = projects.length > 0 ? 
    projects.reduce((sum, p) => sum + (p.businessImpact || 0), 0) / projects.length : 0

  const highImpactProjects = projects.filter(p => p.businessImpact >= 8).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Business Intelligence Analytics</h1>
            <p className="text-gray-600 mt-1 sm:mt-2">Deep insights into project portfolio performance and business impact</p>
          </div>
          <Button variant="outline" onClick={() => fetchProjects()} className="flex items-center justify-center gap-2 text-sm sm:text-base">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>

        {/* Strategic KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-green-700">Portfolio ROI</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 truncate">{formatCurrency(totalRevenueUplift)}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Annual revenue uplift</span>
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-blue-700">Portfolio Value</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 truncate">{formatCurrency(totalProjectValue)}</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Total investment value</span>
                  </p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-purple-700">Efficiency Gains</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">{totalHeadcountSaving.toFixed(1)}</p>
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">FTE saved monthly</span>
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-orange-700">Strategic Impact</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">{avgBusinessImpact.toFixed(1)}/10</p>
                  <p className="text-xs text-orange-600 mt-1 flex items-center">
                    <Target className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Avg business impact</span>
                  </p>
                </div>
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0 ml-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Portfolio Matrix & Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Strategic Portfolio Matrix
                <div className="flex gap-2">
                  <Button
                    variant={chartTypes.impact === 'scatter' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartTypes(prev => ({ ...prev, impact: 'scatter' }))}
                  >
                    <Activity className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartTypes.impact === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartTypes(prev => ({ ...prev, impact: 'bar' }))}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Business Impact vs Technical Effort analysis for strategic prioritization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartTypes.impact === 'scatter' ? (
                    <ScatterChart data={impactEffortData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="effort" 
                        type="number" 
                        domain={[0, 10]}
                        name="Tech Effort"
                        label={{ value: 'Technical Effort', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        dataKey="impact" 
                        type="number" 
                        domain={[0, 10]}
                        name="Business Impact"
                        label={{ value: 'Business Impact', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-semibold">{data.name}</p>
                                <p className="text-sm">Impact: {data.impact}/10</p>
                                <p className="text-sm">Effort: {data.effort}/10</p>
                                <p className="text-sm">Value: {formatCurrency(data.value)}</p>
                                <p className="text-sm">Status: {data.status}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Scatter dataKey="impact" fill="#3B82F6" />
                    </ScatterChart>
                  ) : (
                    <BarChart data={impactEffortData.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impact" fill="#3B82F6" name="Business Impact" />
                      <Bar dataKey="effort" fill="#F59E0B" name="Tech Effort" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Project Status Distribution
                <div className="flex gap-2">
                  <Button
                    variant={chartTypes.status === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartTypes(prev => ({ ...prev, status: 'pie' }))}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartTypes.status === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartTypes(prev => ({ ...prev, status: 'bar' }))}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Current portfolio execution status and progress distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartTypes.status === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        animationBegin={0}
                        animationDuration={800}
                        label={({ status, percentage }) => `${status}: ${percentage.toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Value & Revenue Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Project Value Distribution
              </CardTitle>
              <CardDescription>
                Top projects by investment value and business impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valueDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={formatNumber} />
                    <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? formatCurrency(value as number) : value,
                        name === 'value' ? 'Project Value' : 'Business Impact'
                      ]}
                    />
                    <Bar dataKey="value" fill="#10B981" name="Project Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Revenue Impact Analysis
              </CardTitle>
              <CardDescription>
                Projects driving revenue growth and efficiency gains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis yAxisId="revenue" orientation="left" tickFormatter={formatNumber} />
                    <YAxis yAxisId="headcount" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue Uplift' : 'Headcount Saving'
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="revenue" dataKey="revenue" fill="#3B82F6" name="Revenue Uplift" />
                    <Line yAxisId="headcount" type="monotone" dataKey="headcount" stroke="#F59E0B" strokeWidth={3} name="Headcount Saving" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
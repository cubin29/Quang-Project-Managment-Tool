'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, TrendingUp } from 'lucide-react'

interface ResourceData {
  name: string
  allocated: number
  available: number
  utilization: number
  projects: string[]
  skills: string[]
}

interface ResourceChartProps {
  data: ResourceData[]
  chartType?: 'bar' | 'pie'
}

const UTILIZATION_COLORS = {
  low: '#10B981',      // Green - Under utilized
  optimal: '#3B82F6',  // Blue - Optimal
  high: '#F59E0B',     // Amber - Over utilized
  critical: '#EF4444', // Red - Critical
}

const getUtilizationColor = (utilization: number) => {
  if (utilization < 70) return UTILIZATION_COLORS.low
  if (utilization <= 85) return UTILIZATION_COLORS.optimal
  if (utilization <= 100) return UTILIZATION_COLORS.high
  return UTILIZATION_COLORS.critical
}

const getUtilizationStatus = (utilization: number) => {
  if (utilization < 70) return 'Under-utilized'
  if (utilization <= 85) return 'Optimal'
  if (utilization <= 100) return 'Over-utilized'
  return 'Critical'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[250px]">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Allocated Hours:</span>
            <span className="font-medium">{data.allocated}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Available Hours:</span>
            <span className="font-medium">{data.available}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Utilization:</span>
            <span className={`font-medium ${data.utilization > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {data.utilization.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span className="font-medium">{getUtilizationStatus(data.utilization)}</span>
          </div>
          {data.projects && data.projects.length > 0 && (
            <div>
              <span className="text-sm text-gray-600">Projects:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.projects.slice(0, 3).map((project: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {project}
                  </Badge>
                ))}
                {data.projects.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{data.projects.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export default function ResourceChart({ data, chartType = 'bar' }: ResourceChartProps) {
  const totalAllocated = data.reduce((sum, item) => sum + item.allocated, 0)
  const totalAvailable = data.reduce((sum, item) => sum + item.available, 0)
  const overallUtilization = (totalAllocated / totalAvailable) * 100

  const utilizationDistribution = [
    { name: 'Under-utilized', value: data.filter(d => d.utilization < 70).length, color: UTILIZATION_COLORS.low },
    { name: 'Optimal', value: data.filter(d => d.utilization >= 70 && d.utilization <= 85).length, color: UTILIZATION_COLORS.optimal },
    { name: 'Over-utilized', value: data.filter(d => d.utilization > 85 && d.utilization <= 100).length, color: UTILIZATION_COLORS.high },
    { name: 'Critical', value: data.filter(d => d.utilization > 100).length, color: UTILIZATION_COLORS.critical },
  ].filter(item => item.value > 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Resource Allocation
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {data.length} Resources
            </Badge>
            <Badge 
              variant={overallUtilization > 100 ? "destructive" : overallUtilization > 85 ? "secondary" : "default"}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              {overallUtilization.toFixed(1)}% Utilized
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Team resource utilization and allocation across projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="allocated" 
                      fill="#3B82F6" 
                      name="Allocated Hours"
                      animationDuration={800}
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="available" 
                      fill="#E5E7EB" 
                      name="Available Hours"
                      animationDuration={1000}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={utilizationDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {utilizationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Team Members</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.map((resource, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">{resource.name}</h5>
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: getUtilizationColor(resource.utilization),
                        color: 'white'
                      }}
                    >
                      {resource.utilization.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Allocated:</span>
                      <span>{resource.allocated}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span>{resource.available}h</span>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(resource.utilization, 100)}%`,
                          backgroundColor: getUtilizationColor(resource.utilization)
                        }}
                      />
                    </div>
                  </div>

                  {/* Projects */}
                  {resource.projects && resource.projects.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {resource.projects.slice(0, 2).map((project, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                        {resource.projects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.projects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Allocated</p>
                <p className="text-lg font-bold text-blue-700">{totalAllocated}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Available</p>
                <p className="text-lg font-bold text-gray-700">{totalAvailable}h</p>
              </div>
              <Users className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          
          <div className={`${overallUtilization > 100 ? 'bg-red-50' : overallUtilization > 85 ? 'bg-yellow-50' : 'bg-green-50'} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${overallUtilization > 100 ? 'text-red-600' : overallUtilization > 85 ? 'text-yellow-600' : 'text-green-600'}`}>
                  Utilization
                </p>
                <p className={`text-lg font-bold ${overallUtilization > 100 ? 'text-red-700' : overallUtilization > 85 ? 'text-yellow-700' : 'text-green-700'}`}>
                  {overallUtilization.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${overallUtilization > 100 ? 'text-red-500' : overallUtilization > 85 ? 'text-yellow-500' : 'text-green-500'}`} />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Team Size</p>
                <p className="text-lg font-bold text-purple-700">{data.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
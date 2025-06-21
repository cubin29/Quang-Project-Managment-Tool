'use client'

import React from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProjectStatusData {
  status: string
  count: number
  percentage: number
  color: string
}

interface ProjectStatusChartProps {
  data: ProjectStatusData[]
  chartType?: 'pie' | 'bar'
}

const COLORS = {
  PLANNING: '#3B82F6',      // Blue
  IN_PROGRESS: '#10B981',   // Green
  COMPLETED: '#8B5CF6',     // Purple
  ON_HOLD: '#F59E0B',       // Amber
  CANCELLED: '#EF4444',     // Red
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{data.status.replace('_', ' ')}</p>
        <p className="text-sm text-gray-600">
          Projects: <span className="font-medium">{data.count}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null // Don't show labels for small slices
  
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function ProjectStatusChart({ data, chartType = 'pie' }: ProjectStatusChartProps) {
  const totalProjects = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Project Status Overview
          <Badge variant="outline">{totalProjects} Total</Badge>
        </CardTitle>
        <CardDescription>
          Distribution of projects across different status categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.status as keyof typeof COLORS] || '#8884d8'} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>
                      {value.replace('_', ' ')}
                    </span>
                  )}
                />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  tickFormatter={(value) => value.replace('_', ' ')}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#8884d8"
                  animationDuration={800}
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.status as keyof typeof COLORS] || '#8884d8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Status Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {data.map((item) => (
            <div key={item.status} className="text-center">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-1"
                style={{ backgroundColor: COLORS[item.status as keyof typeof COLORS] }}
              />
              <p className="text-xs text-gray-600">{item.status.replace('_', ' ')}</p>
              <p className="font-semibold text-sm">{item.count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 
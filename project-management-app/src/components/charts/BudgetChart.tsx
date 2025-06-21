'use client'

import React from 'react'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface BudgetData {
  name: string
  budget: number
  actualSpend: number
  plannedSpend: number
  variance: number
  variancePercentage: number
}

interface BudgetChartProps {
  data: BudgetData[]
  chartType?: 'composed' | 'area'
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[200px]">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-blue-600">Budget:</span>
            <span className="font-medium">{formatCurrency(data.budget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-green-600">Actual Spend:</span>
            <span className="font-medium">{formatCurrency(data.actualSpend)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-orange-600">Planned Spend:</span>
            <span className="font-medium">{formatCurrency(data.plannedSpend)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Variance:</span>
            <span className={`font-medium ${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.variance >= 0 ? '+' : ''}{formatCurrency(data.variance)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Variance %:</span>
            <span className={`font-medium ${data.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.variancePercentage >= 0 ? '+' : ''}{data.variancePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function BudgetChart({ data, chartType = 'composed' }: BudgetChartProps) {
  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0)
  const totalActualSpend = data.reduce((sum, item) => sum + item.actualSpend, 0)
  const totalVariance = totalBudget - totalActualSpend
  const overallVariancePercentage = ((totalVariance / totalBudget) * 100)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Budget vs Actual Spend
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(totalBudget)}
            </Badge>
            <Badge 
              variant={totalVariance >= 0 ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {totalVariance >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {overallVariancePercentage >= 0 ? '+' : ''}{overallVariancePercentage.toFixed(1)}%
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Comparison of budgeted amounts vs actual spending across projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'composed' ? (
              <ComposedChart
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
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="budget" 
                  fill="#3B82F6" 
                  name="Budget"
                  animationDuration={800}
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="actualSpend" 
                  fill="#10B981" 
                  name="Actual Spend"
                  animationDuration={1000}
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="plannedSpend" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Planned Spend"
                  dot={{ r: 4 }}
                  animationDuration={1200}
                />
              </ComposedChart>
            ) : (
              <AreaChart
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
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="budget"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Budget"
                  animationDuration={800}
                />
                <Area
                  type="monotone"
                  dataKey="actualSpend"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Actual Spend"
                  animationDuration={1000}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Budget Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Budget</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Actual Spend</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(totalActualSpend)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className={`${totalVariance >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Variance
                </p>
                <p className={`text-lg font-bold ${totalVariance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                </p>
              </div>
              {totalVariance >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-500" /> : 
                <TrendingDown className="h-8 w-8 text-red-500" />
              }
            </div>
          </div>
          
          <div className={`${overallVariancePercentage >= 0 ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${overallVariancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Variance %
                </p>
                <p className={`text-lg font-bold ${overallVariancePercentage >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {overallVariancePercentage >= 0 ? '+' : ''}{overallVariancePercentage.toFixed(1)}%
                </p>
              </div>
              {overallVariancePercentage >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-500" /> : 
                <TrendingDown className="h-8 w-8 text-red-500" />
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
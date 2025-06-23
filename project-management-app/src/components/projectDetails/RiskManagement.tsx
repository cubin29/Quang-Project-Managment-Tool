'use client'

import React, { useState } from 'react'
import { Risk, Project, RiskSeverity, RiskLikelihood } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertTriangle, Edit, Trash2, User } from 'lucide-react'
import RiskCreateModal from './RiskCreateModal'
import RiskDetailModal from './RiskDetailModal'

interface RiskManagementProps {
  risks: Risk[]
  project: Project
  onRiskCreate: (risk: Risk) => void
  onRiskUpdate: (risk: Risk) => void
  onRiskDelete: (riskId: string) => void
}

export default function RiskManagement({
  risks,
  project,
  onRiskCreate,
  onRiskUpdate,
  onRiskDelete
}: RiskManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)

  const getSeverityColor = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLikelihoodColor = (likelihood: RiskLikelihood) => {
    switch (likelihood) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDENTIFIED':
        return 'bg-gray-100 text-gray-800'
      case 'ASSESSED':
        return 'bg-blue-100 text-blue-800'
      case 'MITIGATED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskPriorityScore = (severity: RiskSeverity, likelihood: RiskLikelihood) => {
    const severityScore = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 }
    const likelihoodScore = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 }
    
    return severityScore[severity] * likelihoodScore[likelihood]
  }

  const sortedRisks = [...risks].sort((a, b) => {
    const scoreA = getRiskPriorityScore(a.severity, a.likelihood)
    const scoreB = getRiskPriorityScore(b.severity, b.likelihood)
    return scoreB - scoreA // Highest priority first
  })

  const getRiskStats = () => {
    const total = risks.length
    const critical = risks.filter(risk => risk.severity === 'CRITICAL').length
    const high = risks.filter(risk => risk.severity === 'HIGH').length
    const open = risks.filter(risk => risk.status !== 'CLOSED').length
    
    return { total, critical, high, open }
  }

  const stats = getRiskStats()

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk Management</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {stats.total}</span>
            <span>Open: {stats.open}</span>
            {stats.critical > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {stats.critical} Critical
              </Badge>
            )}
            {stats.high > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                {stats.high} High
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Risk
        </Button>
      </div>

      {/* Risk List */}
      <div className="space-y-4">
        {sortedRisks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Risks Identified</h3>
            <p className="text-gray-500 mb-4">
              Start by identifying potential risks that could impact your project.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Add First Risk
            </Button>
          </div>
        ) : (
          sortedRisks.map((risk) => (
            <Card 
              key={risk.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRisk(risk)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{risk.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getSeverityColor(risk.severity)}`}>
                        {risk.severity}
                      </Badge>
                      <Badge className={`text-xs ${getLikelihoodColor(risk.likelihood)}`}>
                        {risk.likelihood} Likelihood
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {risk.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="capitalize">
                        {risk.category.toLowerCase().replace('_', ' ')}
                      </span>
                      {risk.owner && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{risk.owner.name || risk.owner.username}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        Priority Score: {getRiskPriorityScore(risk.severity, risk.likelihood)}
                      </span>
                    </div>
                  </div>

                  {risk.mitigationPlan && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <strong>Mitigation:</strong> {risk.mitigationPlan}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedRisk(risk)
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this risk?')) {
                        onRiskDelete(risk.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Risk Matrix Summary */}
      {risks.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-3">Risk Matrix</h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="font-medium text-center">Severity →</div>
            <div className="font-medium text-center">Low</div>
            <div className="font-medium text-center">Medium</div>
            <div className="font-medium text-center">High</div>
            
            {(['HIGH', 'MEDIUM', 'LOW'] as RiskLikelihood[]).map((likelihood) => (
              <React.Fragment key={likelihood}>
                <div className="font-medium text-right pr-2">{likelihood}</div>
                {(['LOW', 'MEDIUM', 'HIGH'] as RiskSeverity[]).map((severity) => {
                  const count = risks.filter(r => 
                    r.severity === severity && r.likelihood === likelihood && r.status !== 'CLOSED'
                  ).length
                  const score = getRiskPriorityScore(severity, likelihood)
                  
                  return (
                    <div
                      key={`${severity}-${likelihood}`}
                      className={`text-center p-2 rounded border ${
                        score >= 9 ? 'bg-red-100 border-red-300' :
                        score >= 6 ? 'bg-orange-100 border-orange-300' :
                        score >= 3 ? 'bg-yellow-100 border-yellow-300' :
                        'bg-green-100 border-green-300'
                      }`}
                    >
                      {count > 0 ? count : '-'}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Create Risk Modal */}
      {showCreateModal && (
        <RiskCreateModal
          project={project}
          onRiskCreate={onRiskCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <RiskDetailModal
          risk={selectedRisk}
          onRiskUpdate={onRiskUpdate}
          onRiskDelete={onRiskDelete}
          onClose={() => setSelectedRisk(null)}
        />
      )}
    </Card>
  )
} 
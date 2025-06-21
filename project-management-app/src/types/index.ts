// Database Types
export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER'

export type ProjectStatus = 
  | 'PLANNING' 
  | 'IN_PROGRESS' 
  | 'UAT'
  | 'DONE' 
  | 'CANCELLED'

export type TaskStatus = 
  | 'TODO' 
  | 'IN_PROGRESS' 
  | 'UAT'
  | 'DONE' 
  | 'BLOCKED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type WorkItemType = 'EPIC' | 'FEATURE' | 'TASK' | 'BUG' | 'SPIKE'

export type RiskCategory = 
  | 'TECHNICAL' 
  | 'BUSINESS' 
  | 'RESOURCE' 
  | 'SCHEDULE' 
  | 'QUALITY' 
  | 'EXTERNAL'

export type RiskStatus = 'IDENTIFIED' | 'ASSESSED' | 'MITIGATED' | 'CLOSED'

export type MetricCategory = 
  | 'FINANCIAL' 
  | 'PERFORMANCE' 
  | 'QUALITY' 
  | 'TIMELINE' 
  | 'RESOURCE'

// Core Entity Types
export interface User {
  id: string
  username: string
  email: string
  password?: string // Only for API operations, not client-side
  name?: string
  avatar?: string
  role: Role
  activeStatus: boolean
  lastPasswordUpdate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: Priority
  
  // Enhanced Project Fields
  businessImpact: number // 1-10 scale
  techEffort: number // 1-10 scale
  revenueUplift?: number // Revenue Uplift in $
  headcountSaving?: number // Headcount Saving per month
  projectValue?: number // Project value in $
  team?: string // Team responsible
  country?: string // Country
  pic?: string // Person in Charge
  
  startDate?: Date
  endDate?: Date // ETA
  managerId?: string
  manager?: User
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  impact: number
  effort: number
  startDate?: Date
  endDate?: Date
  dueDate?: Date
  columnId?: string
  position: number
  projectId: string
  assigneeId?: string
  assignee?: User
  createdById: string
  createdBy: User
  parentId?: string
  parent?: Task
  children?: Task[]
  createdAt: Date
  updatedAt: Date
}

export interface WorkItem {
  id: string
  title: string
  description?: string
  type: WorkItemType
  status: TaskStatus
  startDate: Date
  endDate: Date
  duration: number
  wbsCode: string
  level: number
  parentId?: string
  parent?: WorkItem
  children?: WorkItem[]
  projectId: string
  assigneeId?: string
  assignee?: User
  createdAt: Date
  updatedAt: Date
}

export interface Risk {
  id: string
  title: string
  description: string
  category: RiskCategory
  probability: number
  impact: number
  riskScore: number
  status: RiskStatus
  mitigationPlan?: string
  projectId: string
  assessorId?: string
  assessor?: User
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMetric {
  id: string
  name: string
  value: number
  unit?: string
  category: MetricCategory
  projectId: string
  recordedAt: Date
  createdAt: Date
}

// Authentication Types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  name?: string
  role?: Role
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
  error?: string
}

// UI Component Types
export interface KanbanColumn {
  id: string
  title: string
  status: TaskStatus
  tasks: Task[]
}

export interface ImpactEffortMatrix {
  impact: number
  effort: number
  tasks: Task[]
}

export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies: string[]
  type: 'task' | 'milestone' | 'project'
  parent?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

export interface DashboardMetrics {
  totalProjects: number
  activeProjects: number
  completedTasks: number
  totalTasks: number
  totalProjectValue: number
  totalRevenueUplift: number
  totalHeadcountSaving: number
  highRiskCount: number
  overdueTasksCount: number
}

// Form Types
export interface CreateProjectForm {
  name: string
  description?: string
  priority: Priority
  businessImpact: number
  techEffort: number
  revenueUplift?: number
  headcountSaving?: number
  projectValue?: number
  team?: string
  country?: string
  pic?: string
  startDate?: Date
  endDate?: Date
  managerId?: string
}

export interface CreateTaskForm {
  title: string
  description?: string
  priority: Priority
  impact: number
  effort: number
  dueDate?: Date
  assigneeId?: string
  parentId?: string
}

export interface CreateRiskForm {
  title: string
  description: string
  category: RiskCategory
  probability: number
  impact: number
  mitigationPlan?: string
  assessorId?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
} 
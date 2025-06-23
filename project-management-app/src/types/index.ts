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

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type RiskLikelihood = 'LOW' | 'MEDIUM' | 'HIGH'

export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

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
  
  // PRD Additional Fields
  jiraUrl?: string // Jira Ticket URL
  wikiUrl?: string // Wiki Documentation URL
  
  startDate?: Date
  endDate?: Date // ETA
  managerId?: string
  manager?: User
  
  // Relations
  tasks?: Task[]
  risks?: Risk[]
  changeRequests?: ChangeRequest[]
  activityLogs?: ActivityLog[]
  
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  milestone?: string // PRD field
  impact: number
  effort: number
  startDate?: Date
  endDate?: Date
  dueDate?: Date
  eta?: Date // PRD field
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
  
  // Dependencies
  dependencies?: Task[]
  dependents?: Task[]
  
  // PRD Relations
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  activityLogs?: ActivityLog[]
  
  createdAt: Date
  updatedAt: Date
}

export interface TaskComment {
  id: string
  content: string
  taskId: string
  task?: Task
  authorId: string
  author: User
  parentId?: string
  parent?: TaskComment
  replies?: TaskComment[]
  createdAt: Date
  updatedAt: Date
}

export interface TaskAttachment {
  id: string
  filename: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  taskId: string
  task?: Task
  uploadedBy: string
  uploader: User
  createdAt: Date
}

export interface ChangeRequest {
  id: string
  title: string
  description: string
  impact?: string
  status: ChangeRequestStatus
  date: Date
  projectId: string
  project?: Project
  requestedBy: string
  requester: User
  linkedTasks?: ChangeRequestTask[]
  createdAt: Date
  updatedAt: Date
}

export interface ChangeRequestTask {
  id: string
  changeRequestId: string
  changeRequest?: ChangeRequest
  taskId: string
  task?: Task
}

export interface ActivityLog {
  id: string
  action: string
  oldValue?: string
  newValue?: string
  field?: string
  projectId?: string
  project?: Project
  taskId?: string
  task?: Task
  userId: string
  user: User
  createdAt: Date
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
  
  // PRD Risk Assessment Fields
  severity: RiskSeverity
  likelihood: RiskLikelihood
  
  // Legacy fields (keeping for compatibility)
  probability: number
  impact: number
  riskScore: number
  
  status: RiskStatus
  mitigationPlan?: string
  projectId: string
  assessorId?: string
  assessor?: User
  
  // PRD Owner field
  ownerId?: string
  owner?: User
  
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
  jiraUrl?: string
  wikiUrl?: string
  startDate?: Date
  endDate?: Date
  managerId?: string
}

export interface CreateTaskForm {
  title: string
  description?: string
  milestone?: string
  priority: Priority
  impact: number
  effort: number
  startDate?: Date
  eta?: Date
  dueDate?: Date
  assigneeId?: string
  parentId?: string
  dependencyIds?: string[]
}

export interface CreateRiskForm {
  title: string
  description: string
  category: RiskCategory
  severity: RiskSeverity
  likelihood: RiskLikelihood
  mitigationPlan?: string
  ownerId?: string
}

export interface CreateChangeRequestForm {
  title: string
  description: string
  impact?: string
  linkedTaskIds?: string[]
}

export interface CreateCommentForm {
  content: string
  parentId?: string
}

// View Types for Project Details Page
export type TaskViewMode = 'kanban' | 'table' | 'gantt'

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: Priority[]
  assigneeId?: string[]
  milestone?: string[]
  overdue?: boolean
}

export interface ProjectHealthStatus {
  status: 'green' | 'yellow' | 'red'
  overdueTasksPercentage: number
  openHighRisksCount: number
  totalTasks: number
  completedTasks: number
}

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
import { prisma } from './prisma'
import { Project, ProjectStatus, Priority, User } from '@/types'

// Create a new project
export async function createProject(data: {
  name: string
  description?: string
  status?: ProjectStatus
  priority?: Priority
  businessImpact?: number
  techEffort?: number
  revenueUplift?: number
  headcountSaving?: number
  projectValue?: number
  team?: string
  country?: string
  pic?: string
  startDate?: Date
  endDate?: Date
  managerId?: string
}) {
  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'PLANNING',
        priority: data.priority || 'MEDIUM',
        businessImpact: data.businessImpact || 5,
        techEffort: data.techEffort || 5,
        revenueUplift: data.revenueUplift,
        headcountSaving: data.headcountSaving,
        projectValue: data.projectValue,
        team: data.team,
        country: data.country,
        pic: data.pic,
        startDate: data.startDate,
        endDate: data.endDate,
        managerId: data.managerId,
      },
      include: {
        manager: true,
        tasks: {
          include: {
            assignee: true,
            createdBy: true,
          },
        },
        risks: {
          include: {
            assessor: true,
          },
        },
        metrics: true,
        _count: {
          select: {
            tasks: true,
            risks: true,
            workItems: true,
          },
        },
      },
    })
    return { success: true, data: project }
  } catch (error) {
    console.error('Error creating project:', error)
    return { success: false, error: 'Failed to create project' }
  }
}

// Get all projects with optional filtering
export async function getProjects(filters?: {
  status?: ProjectStatus
  priority?: Priority
  managerId?: string
  search?: string
}) {
  try {
    const where: any = {}
    
    if (filters?.status) {
      where.status = filters.status
    }
    
    if (filters?.priority) {
      where.priority = filters.priority
    }
    
    if (filters?.managerId) {
      where.managerId = filters.managerId
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        manager: true,
        tasks: {
          include: {
            assignee: true,
          },
        },
        risks: true,
        metrics: true,
        _count: {
          select: {
            tasks: true,
            risks: true,
            workItems: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return { success: true, data: projects }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { success: false, error: 'Failed to fetch projects' }
  }
}

// Get a single project by ID
export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        manager: true,
        tasks: {
          include: {
            assignee: true,
            createdBy: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
        risks: {
          include: {
            assessor: true,
          },
          orderBy: {
            riskScore: 'desc',
          },
        },
        workItems: {
          include: {
            assignee: true,
          },
          orderBy: {
            wbsCode: 'asc',
          },
        },
        metrics: {
          orderBy: {
            recordedAt: 'desc',
          },
        },
        _count: {
          select: {
            tasks: true,
            risks: true,
            workItems: true,
          },
        },
      },
    })

    if (!project) {
      return { success: false, error: 'Project not found' }
    }

    return { success: true, data: project }
  } catch (error) {
    console.error('Error fetching project:', error)
    return { success: false, error: 'Failed to fetch project' }
  }
}

// Update a project
export async function updateProject(
  id: string,
  data: Partial<{
    name: string
    description: string
    status: ProjectStatus
    priority: Priority
    businessImpact: number
    techEffort: number
    revenueUplift: number
    headcountSaving: number
    projectValue: number
    team: string
    country: string
    pic: string
    startDate: Date
    endDate: Date
    managerId: string
  }>
) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        manager: true,
        tasks: {
          include: {
            assignee: true,
            createdBy: true,
          },
        },
        risks: {
          include: {
            assessor: true,
          },
        },
        metrics: true,
        _count: {
          select: {
            tasks: true,
            risks: true,
            workItems: true,
          },
        },
      },
    })

    return { success: true, data: project }
  } catch (error) {
    console.error('Error updating project:', error)
    return { success: false, error: 'Failed to update project' }
  }
}

// Delete a project
export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    })

    return { success: true, message: 'Project deleted successfully' }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: 'Failed to delete project' }
  }
}

// Get project statistics
export async function getProjectStats() {
  try {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalBudget,
      totalExpectedRevenue,
      totalHeadcountSavings,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({ where: { status: 'ON_HOLD' } }),
      prisma.project.aggregate({
        _sum: { budget: true },
        where: { budget: { not: null } },
      }),
      prisma.project.aggregate({
        _sum: { expectedRevenue: true },
        where: { expectedRevenue: { not: null } },
      }),
      prisma.project.aggregate({
        _sum: { headcountSavings: true },
        where: { headcountSavings: { not: null } },
      }),
    ])

    return {
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        totalBudget: totalBudget._sum.budget || 0,
        totalExpectedRevenue: totalExpectedRevenue._sum.expectedRevenue || 0,
        totalHeadcountSavings: totalHeadcountSavings._sum.headcountSavings || 0,
        completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      },
    }
  } catch (error) {
    console.error('Error fetching project stats:', error)
    return { success: false, error: 'Failed to fetch project statistics' }
  }
}

// Add current spend tracking
export async function updateProjectSpend(
  projectId: string,
  currentSpend: number,
  description?: string
) {
  try {
    // Create a metric entry for current spend
    const metric = await prisma.projectMetric.create({
      data: {
        name: description || 'Current Spend',
        value: currentSpend,
        unit: 'USD',
        category: 'FINANCIAL',
        projectId,
      },
    })

    return { success: true, data: metric }
  } catch (error) {
    console.error('Error updating project spend:', error)
    return { success: false, error: 'Failed to update project spend' }
  }
}

// Get project spend history
export async function getProjectSpendHistory(projectId: string) {
  try {
    const spendMetrics = await prisma.projectMetric.findMany({
      where: {
        projectId,
        category: 'FINANCIAL',
        name: { contains: 'spend', mode: 'insensitive' },
      },
      orderBy: {
        recordedAt: 'asc',
      },
    })

    return { success: true, data: spendMetrics }
  } catch (error) {
    console.error('Error fetching spend history:', error)
    return { success: false, error: 'Failed to fetch spend history' }
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/projects/[id] - Get a single project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')?.split(',') || []

    const includeOptions: any = {
      manager: true,
    }

    // Add optional includes based on query parameter
    if (include.includes('tasks')) {
      includeOptions.tasks = {
        include: {
          assignee: true,
          createdBy: true,
          dependencies: true,
          dependents: true,
          comments: {
            include: {
              author: true,
              replies: {
                include: {
                  author: true
                }
              }
            }
          },
          attachments: {
            include: {
              uploader: true
            }
          },
          activityLogs: {
            include: {
              user: true
            }
          }
        }
      }
    }

    if (include.includes('risks')) {
      includeOptions.risks = {
        include: {
          assessor: true,
          owner: true
        }
      }
    }

    if (include.includes('changeRequests')) {
      includeOptions.changeRequests = {
        include: {
          requester: true,
          linkedTasks: {
            include: {
              task: true
            }
          }
        }
      }
    }

    if (include.includes('activityLogs')) {
      includeOptions.activityLogs = {
        include: {
          user: true,
          task: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: includeOptions
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: body,
      include: {
        manager: true,
        tasks: {
          include: {
            assignee: true,
            createdBy: true
          }
        },
        risks: {
          include: {
            assessor: true,
            owner: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProject
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
} 
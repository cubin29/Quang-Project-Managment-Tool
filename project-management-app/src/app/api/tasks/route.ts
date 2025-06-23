import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where = projectId ? { projectId } : {}

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        createdBy: true,
        dependencies: true,
        dependents: true,
        comments: {
          include: {
            author: true
          }
        },
        attachments: {
          include: {
            uploader: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: tasks
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get current user (you'll need to implement proper auth)
    const currentUserId = 'user1' // Placeholder - replace with actual auth

    const task = await prisma.task.create({
      data: {
        ...body,
        createdById: currentUserId,
        status: body.status || 'TODO',
        impact: body.impact || 3,
        effort: body.effort || 3,
        position: 0
      },
      include: {
        assignee: true,
        createdBy: true,
        dependencies: true,
        dependents: true
      }
    })

    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
} 
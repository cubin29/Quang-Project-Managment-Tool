import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: body,
      include: {
        assignee: true,
        createdBy: true,
        dependencies: true,
        dependents: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTask
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
} 
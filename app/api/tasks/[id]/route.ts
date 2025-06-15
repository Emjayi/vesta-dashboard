import { NextResponse } from 'next/server'
import type { Task } from '@/lib/types'
import { getTaskById, updateTask, deleteTask } from '@/lib/db'

// GET /api/tasks/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid task ID' },
                { status: 400 }
            )
        }

        const task = await getTaskById(id)
        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(task)
    } catch (error) {
        console.error('Error fetching task:', error)
        return NextResponse.json(
            { error: 'Failed to fetch task' },
            { status: 500 }
        )
    }
}

// PATCH /api/tasks/[id]
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid task ID' },
                { status: 400 }
            )
        }

        const updates = await request.json()
        const updatedTask = await updateTask(id, updates)
        return NextResponse.json(updatedTask)
    } catch (error) {
        console.error('Error updating task:', error)
        if (error instanceof Error && error.message === 'Task not found') {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        )
    }
}

// DELETE /api/tasks/[id]
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid task ID' },
                { status: 400 }
            )
        }

        await deleteTask(id)
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting task:', error)
        if (error instanceof Error && error.message === 'Task not found') {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        )
    }
} 
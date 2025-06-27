import { NextResponse } from 'next/server'
import type { Task } from '@/lib/types'

let tasks: Task[]

// Initialize tasks from JSONPlaceholder if empty
async function getTasks() {
    try {
        const response = await fetch('http://localhost:3000/api/tasks', {
            method: "GET"
        })
        if (!response.ok) throw new Error('Failed to fetch tasks from api')
        tasks = await response.json()
    } catch (error) {
        console.error('Error getting tasks:', error)
    }
}


// GET /api/tasks/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    await getTasks()
    const id = parseInt(params.id)
    const task = tasks.find(t => t.id === id)

    if (!task) {
        return new NextResponse('Task not found', { status: 404 })
    }

    return NextResponse.json(task)
}

// PATCH /api/tasks/[id]
export async function PATCH(
    request: Request,
    { params }: { params: { id: number } }
) {
    const body = await request.json()
    await getTasks()
    const { id } = await params
    const taskIndex = tasks.findIndex(t => t.id == id)
    if (taskIndex === -1) {
        return new NextResponse('Task not found', { status: 404 })
    }

    try {
        const updates = await body
        const updatedTask = { ...tasks[taskIndex], ...updates }
        tasks[taskIndex] = updatedTask

        return NextResponse.json(updatedTask)
    } catch (error) {
        console.error('Error updating task:', error)
        return new NextResponse('Failed to update task', { status: 400 })
    }
}

// DELETE /api/tasks/[id]
export async function DELETE(
    request: Request,
    { params }: { params: { id: number } }
) {
    await getTasks()
    const { id } = await params
    const taskIndex = tasks.findIndex(t => t.id == id)

    if (taskIndex === -1) {
        return new NextResponse('Task not found', { status: 404 })
    }

    tasks = tasks.filter(t => t.id !== id)
    return new NextResponse(null, { status: 204 })
} 
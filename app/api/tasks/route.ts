import { NextResponse } from 'next/server'
import type { Task } from '@/lib/types'
import { getAllTasks, createTask } from '@/lib/db'

// GET /api/tasks
export async function GET() {
    try {
        const tasks = await getAllTasks()
        return NextResponse.json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        )
    }
}

// POST /api/tasks
export async function POST(request: Request) {
    try {
        const taskData = await request.json()
        // Validation: require non-empty title and valid userId
        if (!taskData.title || typeof taskData.title !== 'string' || !taskData.title.trim()) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }
        if (typeof taskData.userId !== 'number' || isNaN(taskData.userId)) {
            return NextResponse.json(
                { error: 'Valid userId is required' },
                { status: 400 }
            )
        }

        const newTask = await createTask(taskData)
        return NextResponse.json(newTask, { status: 201 })
    } catch (error) {
        console.error('Error creating task:', error)
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        )
    }
} 
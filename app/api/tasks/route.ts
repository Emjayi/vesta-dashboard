import { NextResponse } from 'next/server'
import type { Task } from '@/lib/types'

let tasks: Task[]


// GET /api/tasks
export async function GET() {
    if (!tasks || tasks.length === 0) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=200')
            if (!response.ok) throw new Error('Failed to fetch tasks from JSONPlaceholder')
            tasks = await response.json()
            console.log("tasks: ", tasks?.length)
        } catch (error) {
            console.error('Error initializing tasks:', error)
        }
    } else {
        console.log("already has: ", tasks.length)
    }
    return NextResponse.json(tasks)
}

// POST /api/tasks
export async function POST(request: Request) {
    try {
        const taskData = await request.json()
        // Validation: require non-empty title and valid userId
        if (!taskData.title || typeof taskData.title !== 'string' || !taskData.title.trim()) {
            return new NextResponse('Title is required', { status: 400 })
        }
        if (typeof taskData.userId !== 'number' || isNaN(taskData.userId)) {
            return new NextResponse('Valid userId is required', { status: 400 })
        }
        // Generate a new ID (in production, use database auto-increment)
        const newId = Math.max(0, ...tasks.map(t => t.id)) + 1
        const newTask: Task = {
            id: newId,
            ...taskData
        }
        tasks = [newTask, ...tasks]
        return NextResponse.json(newTask, { status: 201 })
    } catch (error) {
        console.error('Error creating task:', error)
        return new NextResponse('Failed to create task', { status: 400 })
    }
} 
import { NextResponse } from 'next/server'
import type { User } from '@/lib/types'

// In-memory storage for users
let users: User[] = []

// GET /api/users
export async function GET() {
    try {
        // If we have no users, fetch from JSONPlaceholder
        if (users.length === 0) {
            const response = await fetch('https://jsonplaceholder.typicode.com/users')
            if (!response.ok) throw new Error('Failed to fetch users from JSONPlaceholder')
            users = await response.json()
            console.log("users: ", users.length)
        }
        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

// POST /api/users
export async function POST(request: Request) {
    try {
        const userData = await request.json()
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
        const newUser: User = {
            id: newId,
            ...userData,
        }
        users.push(newUser)
        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
} 
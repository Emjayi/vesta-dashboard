import { NextResponse } from 'next/server'
import type { User } from '@/lib/types'
import { getAllUsers, createUser } from '@/lib/db'

// GET /api/users
export async function GET() {
    try {
        const users = await getAllUsers()
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
        // Validation: require name and email
        if (!userData.name || typeof userData.name !== 'string' || !userData.name.trim()) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }
        if (!userData.email || typeof userData.email !== 'string' || !userData.email.trim()) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const newUser = await createUser(userData)
        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
} 
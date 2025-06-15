import { NextResponse } from 'next/server'
import type { User } from '@/lib/types'

// Reference to the users array from the main users route
declare const users: User[]

// GET /api/users/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = users.find(u => u.id === parseInt(params.id))
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
} 
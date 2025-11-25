import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

function generateToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function POST() {
    try {
        // Check if user is authenticated in web session
        const session = await auth()
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'No active web session found' },
                { status: 401 }
            )
        }

        // Generate a secure token for the desktop app
        const token = generateToken()
        
        // Store token (you might want to store this in your database with expiration)
        const tokenResponse = await fetch('/api/auth/store-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, userId: session.user.id })
        })

        if (!tokenResponse.ok) {
            throw new Error('Failed to store token')
        }

        const tokenData = await tokenResponse.json()
        
        return NextResponse.json({
            success: true,
            token: tokenData.token,
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                image: session.user.image
            }
        })

    } catch (error) {
        console.error('Failed to generate token from session:', error)
        return NextResponse.json(
            { error: 'Failed to generate token from session' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Find token in DB
    const tokenData = await prisma.desktopAuthToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Check expiry
    if (tokenData.expires < new Date()) {
      await prisma.desktopAuthToken.delete({ where: { id: tokenData.id } })
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 })
    }

    // Delete token (single-use)
    await prisma.desktopAuthToken.delete({ where: { id: tokenData.id } })

    // Return user data
    return NextResponse.json({
      user: {
        id: tokenData.user.id,
        email: tokenData.user.email,
        name: tokenData.user.name,
        image: tokenData.user.image,
      },
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sessions = await prisma.session.findMany({
            where: { userId: session.user.id },
            orderBy: { lastActivity: 'desc' }
        })

        // We can't easily determine the current session without comparing session tokens
        // For now, we'll mark the most recent one as current or none
        const formattedSessions = sessions.map((s, index) => ({
            id: s.id,
            userAgent: s.userAgent,
            ipAddress: s.ipAddress,
            deviceName: s.deviceName,
            lastActivity: s.lastActivity.toISOString(),
            createdAt: s.createdAt.toISOString(),
            isCurrent: index === 0 // Simple heuristic: most recent is current
        }))

        return NextResponse.json({ sessions: formattedSessions })
    } catch (error) {
        console.error('Error fetching sessions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

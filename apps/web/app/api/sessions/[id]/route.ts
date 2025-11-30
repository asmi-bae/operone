import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Find the session to verify ownership and check if it's current
        const targetSession = await prisma.session.findFirst({
            where: {
                id,
                userId: session.user.id
            }
        })

        if (!targetSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Prevent revoking the current session
        if (targetSession.sessionToken === session.sessionToken) {
            return NextResponse.json({ error: 'Cannot revoke current session' }, { status: 400 })
        }

        // Delete the session
        await prisma.session.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting session:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

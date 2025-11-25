import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * POST /api/ai-providers/[id]/activate
 * Set a provider as the active provider
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const provider = await prisma.aIProvider.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Deactivate all other providers
    await prisma.aIProvider.updateMany({
      where: { userId: session.user.id, isActive: true },
      data: { isActive: false },
    });

    // Activate this provider
    const updatedProvider = await prisma.aIProvider.update({
      where: { id: params.id },
      data: { isActive: true },
    });

    return NextResponse.json({
      provider: {
        id: updatedProvider.id,
        name: updatedProvider.name,
        type: updatedProvider.type,
        model: updatedProvider.model,
        isActive: updatedProvider.isActive,
        isDefault: updatedProvider.isDefault,
      },
    });
  } catch (error) {
    console.error('Error activating AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to activate provider' },
      { status: 500 }
    );
  }
}

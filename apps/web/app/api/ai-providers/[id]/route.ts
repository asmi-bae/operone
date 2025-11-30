import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { encryptApiKey } from '@/lib/encryption';
import { z } from 'zod';

const updateProviderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  model: z.string().min(1).optional(),
  apiKey: z.string().optional(),
  baseURL: z.string().url().optional().nullable(),
  organization: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

/**
 * PATCH /api/ai-providers/[id]
 * Update an existing provider configuration
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingProvider = await prisma.aIProvider.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateProviderSchema.parse(body);

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.model !== undefined) updateData.model = validatedData.model;
    if (validatedData.baseURL !== undefined) updateData.baseURL = validatedData.baseURL;
    if (validatedData.organization !== undefined) updateData.organization = validatedData.organization;
    
    // Encrypt API key if provided
    if (validatedData.apiKey !== undefined) {
      updateData.apiKey = validatedData.apiKey ? encryptApiKey(validatedData.apiKey) : null;
    }

    // Handle isDefault
    if (validatedData.isDefault === true) {
      // Unset other defaults
      await prisma.aIProvider.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
      updateData.isDefault = true;
    } else if (validatedData.isDefault === false) {
      updateData.isDefault = false;
    }

    // Update the provider
    const provider = await prisma.aIProvider.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        model: provider.model,
        baseURL: provider.baseURL,
        organization: provider.organization,
        isActive: provider.isActive,
        isDefault: provider.isDefault,
        hasApiKey: !!provider.apiKey,
        createdAt: provider.createdAt.toISOString(),
        updatedAt: provider.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-providers/[id]
 * Delete a provider configuration
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingProvider = await prisma.aIProvider.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Delete the provider
    await prisma.aIProvider.delete({
      where: { id: params.id },
    });

    // If this was the active provider, activate another one
    if (existingProvider.isActive) {
      const nextProvider = await prisma.aIProvider.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (nextProvider) {
        await prisma.aIProvider.update({
          where: { id: nextProvider.id },
          data: { isActive: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI provider:', error);
    return NextResponse.json(
      { error: 'Failed to delete provider' },
      { status: 500 }
    );
  }
}

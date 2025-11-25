import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { decryptApiKey } from '@/lib/encryption';
import { ModelProvider } from '@repo/ai-engine';
import type { ProviderConfig } from '@repo/types';

/**
 * POST /api/ai-providers/[id]/test
 * Test the provider connection
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

    // Verify ownership and get provider
    const provider = await prisma.aIProvider.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Decrypt API key if present
    const apiKey = provider.apiKey ? decryptApiKey(provider.apiKey) : undefined;

    // Build provider config
    const providerConfig: ProviderConfig = {
      type: provider.type as any,
      model: provider.model,
      apiKey,
      baseURL: provider.baseURL || undefined,
      organization: provider.organization || undefined,
    } as ProviderConfig;

    // Create model provider and test connection
    const modelProvider = new ModelProvider(providerConfig);
    const testResult = await modelProvider.testConnection();

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing AI provider:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test provider' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, regenerateApiKey, logAgentActivity } from '@/lib/db/agents';
import { verifyWalletSignature } from '@/lib/auth/wallet';

export const dynamic = 'force-dynamic';

// POST /api/agents/[handle]/api-key - Regenerate API key
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, signature, message } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    // Verify ownership first
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.ownerWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Verify signature if provided (recommended for production)
    if (signature && message) {
      const isValidSignature = await verifyWalletSignature(
        walletAddress,
        message,
        signature
      );
      
      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    // Regenerate the API key
    const newApiKey = await regenerateApiKey(handle, walletAddress);

    // Log activity
    await logAgentActivity(agent.id, 'api_key_regenerated', {
      success: true,
    });

    return NextResponse.json({
      apiKey: newApiKey,
      message: 'API key regenerated successfully. Save your new API key - it will not be shown again.',
      warning: 'Your previous API key is now invalid.',
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    const message = error instanceof Error ? error.message : 'Failed to regenerate API key';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

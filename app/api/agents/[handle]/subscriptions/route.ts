import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle } from '@/lib/db/agents';
import {
  getAgentSubscriptions,
  getSubscription,
  subscribeAgentToDJ,
  updateSubscription,
  unsubscribeAgentFromDJ,
  createAgentNotification,
} from '@/lib/db/agent-subscriptions';
import { ListenMode } from '@/types/agent';

export const dynamic = 'force-dynamic';

// GET /api/agents/[handle]/subscriptions - List agent's DJ subscriptions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const subscriptions = await getAgentSubscriptions(agent.id);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[handle]/subscriptions - Subscribe to a DJ
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { djId, notifyOnLive, autoPromote, listenMode, walletAddress } = body;

    if (!djId) {
      return NextResponse.json({ error: 'djId is required' }, { status: 400 });
    }

    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify ownership
    if (walletAddress?.toLowerCase() !== agent.ownerWalletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already subscribed
    const existing = await getSubscription(agent.id, djId);
    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed to this DJ' },
        { status: 409 }
      );
    }

    const subscription = await subscribeAgentToDJ({
      agentId: agent.id,
      djId,
      notifyOnLive: notifyOnLive ?? true,
      autoPromote: autoPromote ?? false,
      listenMode: (listenMode as ListenMode) ?? 'notify',
    });

    // Create notification for agent owner
    await createAgentNotification(
      agent.id,
      'subscription_added',
      'New DJ subscription',
      subscription.dj
        ? `${agent.artistName} is now following ${subscription.dj.name}`
        : 'New DJ subscription added'
    );

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error('Error subscribing to DJ:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to DJ' },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[handle]/subscriptions - Update subscription settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { djId, notifyOnLive, autoPromote, listenMode, walletAddress } = body;

    if (!djId) {
      return NextResponse.json({ error: 'djId is required' }, { status: 400 });
    }

    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify ownership
    if (walletAddress?.toLowerCase() !== agent.ownerWalletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const subscription = await updateSubscription(agent.id, djId, {
      notifyOnLive,
      autoPromote,
      listenMode: listenMode as ListenMode | undefined,
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[handle]/subscriptions - Unsubscribe from a DJ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = new URL(request.url);
  const djId = searchParams.get('djId');
  const walletAddress = searchParams.get('walletAddress');

  if (!djId) {
    return NextResponse.json({ error: 'djId is required' }, { status: 400 });
  }

  try {
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify ownership
    if (walletAddress?.toLowerCase() !== agent.ownerWalletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await unsubscribeAgentFromDJ(agent.id, djId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from DJ:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from DJ' },
      { status: 500 }
    );
  }
}

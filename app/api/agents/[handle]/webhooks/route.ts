import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, getWebhook, upsertWebhook, deleteWebhook } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

const VALID_EVENTS = [
  'post.created',
  'post.published',
  'follower.new',
  'tip.received',
  'track.synced',
  'engagement.milestone',
];

// GET /api/agents/[handle]/webhooks - Get webhook configuration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  try {
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Only owner can view webhook config
    if (!walletAddress || agent.ownerWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const webhook = await getWebhook(agent.id);

    return NextResponse.json({
      webhook,
      availableEvents: VALID_EVENTS,
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook configuration' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[handle]/webhooks - Create or update webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, url, events, secret } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    // Validate events
    const eventList = events || VALID_EVENTS;
    const invalidEvents = eventList.filter((e: string) => !VALID_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }

    // Get agent and verify ownership
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.ownerWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const webhook = await upsertWebhook(agent.id, url, eventList, secret);

    return NextResponse.json({
      webhook,
      message: 'Webhook configured successfully',
    });
  } catch (error) {
    console.error('Error configuring webhook:', error);
    const message = error instanceof Error ? error.message : 'Failed to configure webhook';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/agents/[handle]/webhooks - Delete webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    // Get agent and verify ownership
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.ownerWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await deleteWebhook(agent.id);

    return NextResponse.json({
      message: 'Webhook deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete webhook';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, createTip, getTips, logAgentActivity } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// POST /api/agents/[handle]/tip - Send a tip to an agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { senderWalletAddress, amount, txHash, message, senderHandle } = body;

    if (!senderWalletAddress) {
      return NextResponse.json(
        { error: 'Sender wallet address required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid tip amount' },
        { status: 400 }
      );
    }

    // Get agent
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Create the tip
    const tip = await createTip(
      agent.id,
      senderWalletAddress,
      amount,
      txHash,
      message,
      senderHandle
    );

    // Log activity
    await logAgentActivity(agent.id, 'tip_received', {
      additionalData: {
        amount,
        senderHandle,
        txHash,
      },
    });

    // Determine tier recognition message
    let tierMessage = '';
    if (amount >= 1000) {
      tierMessage = 'Legendary supporter!';
    } else if (amount >= 500) {
      tierMessage = 'Super supporter!';
    } else if (amount >= 100) {
      tierMessage = 'Valued supporter!';
    }

    return NextResponse.json({
      tip,
      message: 'Tip sent successfully!',
      tierMessage,
      agent: {
        handle: agent.handle,
        artistName: agent.artistName,
      },
    });
  } catch (error) {
    console.error('Error sending tip:', error);
    const message = error instanceof Error ? error.message : 'Failed to send tip';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/tip - Get tips for an agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const tips = await getTips(agent.id, { limit, offset });

    return NextResponse.json({
      tips,
      totalTipsReceived: agent.totalTipsReceivedRave,
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}

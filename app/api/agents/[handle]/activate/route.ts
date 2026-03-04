import { NextRequest, NextResponse } from 'next/server';
import { activateAgent, pauseAgent, getAgentByHandle, logAgentActivity } from '@/lib/db/agents';

// POST /api/agents/[handle]/activate - Activate or pause an agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, action = 'activate' } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    let agent;
    if (action === 'pause') {
      agent = await pauseAgent(handle, walletAddress);
      await logAgentActivity(agent.id, 'pause');
    } else {
      agent = await activateAgent(handle, walletAddress);
      await logAgentActivity(agent.id, 'activate');
    }

    return NextResponse.json({
      agent,
      message: `Agent ${action === 'pause' ? 'paused' : 'activated'} successfully`,
    });
  } catch (error) {
    console.error('Error activating agent:', error);
    const message = error instanceof Error ? error.message : 'Failed to activate agent';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/activate - Check activation status
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

    return NextResponse.json({
      handle: agent.handle,
      status: agent.status,
      activatedAt: agent.activatedAt,
      lastActiveAt: agent.lastActiveAt,
    });
  } catch (error) {
    console.error('Error checking agent status:', error);
    return NextResponse.json(
      { error: 'Failed to check agent status' },
      { status: 500 }
    );
  }
}

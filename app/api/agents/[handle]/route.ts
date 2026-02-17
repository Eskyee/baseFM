import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, updateAgent, getMusicSources, getSocialPlatforms } from '@/lib/db/agents';

// GET /api/agents/[handle] - Get agent details
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

    // Get connected platforms
    const [musicSources, socialPlatforms] = await Promise.all([
      getMusicSources(agent.id),
      getSocialPlatforms(agent.id),
    ]);

    // Cache agent profiles for 30s, allow stale for 2min while revalidating
    return NextResponse.json({
      agent,
      musicSources,
      socialPlatforms,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[handle] - Update agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, ...updateData } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    const agent = await updateAgent(handle, walletAddress, updateData);

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    const message = error instanceof Error ? error.message : 'Failed to update agent';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

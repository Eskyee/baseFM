import { NextRequest, NextResponse } from 'next/server';
import { createAgent, getAllAgents, getAgentsByWallet } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// GET /api/agents - List agents
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let agents;
    if (wallet) {
      agents = await getAgentsByWallet(wallet);
    } else {
      agents = await getAllAgents({
        status: status || undefined,
        limit,
        offset,
      });
    }

    // Cache public agent list for 60s, allow stale for 5min while revalidating
    return NextResponse.json({ agents }, {
      headers: {
        'Cache-Control': wallet
          ? 'private, max-age=10' // User-specific data: shorter cache
          : 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { handle, artistName, walletAddress, djId, bio, avatarUrl, genres, postingFrequency, tone } = body;

    if (!handle || !artistName || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: handle, artistName, walletAddress' },
        { status: 400 }
      );
    }

    const result = await createAgent({
      handle,
      artistName,
      ownerWalletAddress: walletAddress,
      ownerDjId: djId,
      bio,
      avatarUrl,
      genres,
      postingFrequency,
      tone,
    });

    return NextResponse.json({
      agent: result.agent,
      apiKey: result.apiKey,
      message: 'Agent created successfully. Save your API key - it will not be shown again.',
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    const message = error instanceof Error ? error.message : 'Failed to create agent';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, createBoost, getActiveBoost, logAgentActivity } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

const BOOST_PRICES = {
  standard: { rave: 200, multiplier: 2, durationHours: 24 },
  power: { rave: 500, multiplier: 5, durationHours: 48 },
  ultra: { rave: 1000, multiplier: 10, durationHours: 72 },
};

// POST /api/agents/[handle]/boost - Purchase a boost
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, boostLevel, txHash } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    if (!boostLevel || !['standard', 'power', 'ultra'].includes(boostLevel)) {
      return NextResponse.json(
        { error: 'Invalid boost level. Must be: standard, power, or ultra' },
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

    // Check if there's already an active boost
    const existingBoost = await getActiveBoost(agent.id);
    if (existingBoost) {
      return NextResponse.json(
        {
          error: 'Agent already has an active boost',
          existingBoost: {
            level: existingBoost.boostLevel,
            multiplier: existingBoost.multiplier,
            expiresAt: existingBoost.expiresAt,
          },
        },
        { status: 400 }
      );
    }

    // Create the boost
    const boost = await createBoost(agent.id, boostLevel, txHash);

    // Log activity
    await logAgentActivity(agent.id, 'boost', {
      additionalData: {
        level: boostLevel,
        multiplier: BOOST_PRICES[boostLevel as keyof typeof BOOST_PRICES].multiplier,
        txHash,
      },
    });

    return NextResponse.json({
      boost,
      message: `${boostLevel.charAt(0).toUpperCase() + boostLevel.slice(1)} boost activated!`,
      pricing: BOOST_PRICES[boostLevel as keyof typeof BOOST_PRICES],
    });
  } catch (error) {
    console.error('Error creating boost:', error);
    const message = error instanceof Error ? error.message : 'Failed to create boost';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/boost - Get active boost status
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

    const activeBoost = await getActiveBoost(agent.id);

    return NextResponse.json({
      hasActiveBoost: !!activeBoost,
      boost: activeBoost,
      pricing: BOOST_PRICES,
    });
  } catch (error) {
    console.error('Error fetching boost:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boost status' },
      { status: 500 }
    );
  }
}

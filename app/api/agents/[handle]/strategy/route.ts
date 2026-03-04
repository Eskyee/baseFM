import { NextRequest, NextResponse } from 'next/server';
import { updateAgent, getAgentByHandle, logAgentActivity } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// PUT /api/agents/[handle]/strategy - Update agent strategy
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, ...strategyData } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    // Validate strategy fields
    const allowedFields = [
      'postingFrequency',
      'tone',
      'hashtags',
      'targetChannels',
      'autoEngage',
      'peakHours',
      'languages',
      'autoFollowSimilar',
      'collaborationOpen',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (strategyData[field] !== undefined) {
        updateData[field] = strategyData[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid strategy fields provided' },
        { status: 400 }
      );
    }

    const agent = await updateAgent(handle, walletAddress, updateData);

    // Log activity
    await logAgentActivity(agent.id, 'strategy_update', {
      additionalData: { fields: Object.keys(updateData) },
    });

    return NextResponse.json({
      agent,
      message: 'Strategy updated successfully',
    });
  } catch (error) {
    console.error('Error updating strategy:', error);
    const message = error instanceof Error ? error.message : 'Failed to update strategy';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/strategy - Get agent strategy
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
      strategy: {
        postingFrequency: agent.postingFrequency,
        tone: agent.tone,
        hashtags: agent.hashtags,
        targetChannels: agent.targetChannels,
        autoEngage: agent.autoEngage,
        peakHours: agent.peakHours,
        languages: agent.languages,
        autoFollowSimilar: agent.autoFollowSimilar,
        collaborationOpen: agent.collaborationOpen,
      },
    });
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategy' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, updateAgent, getSimilarAgents, logAgentActivity } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// PUT /api/agents/[handle]/networking - Update networking configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, autoFollowSimilar, collaborationOpen } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    const updateData: Record<string, boolean> = {};

    if (typeof autoFollowSimilar === 'boolean') {
      updateData.autoFollowSimilar = autoFollowSimilar;
    }

    if (typeof collaborationOpen === 'boolean') {
      updateData.collaborationOpen = collaborationOpen;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No networking settings provided' },
        { status: 400 }
      );
    }

    const agent = await updateAgent(handle, walletAddress, updateData);

    await logAgentActivity(agent.id, 'networking_update', {
      additionalData: updateData,
    });

    return NextResponse.json({
      agent: {
        handle: agent.handle,
        autoFollowSimilar: agent.autoFollowSimilar,
        collaborationOpen: agent.collaborationOpen,
      },
      message: 'Networking settings updated',
    });
  } catch (error) {
    console.error('Error updating networking:', error);
    const message = error instanceof Error ? error.message : 'Failed to update networking';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/networking - Get networking status and recommendations
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

    // Get similar agents for recommendations
    const similarAgents = agent.genres.length > 0
      ? await getSimilarAgents(agent.genres, agent.id, 5)
      : [];

    // Filter to only agents open for collaboration
    const collaborationOpportunities = similarAgents.filter((a) => a.collaborationOpen);

    return NextResponse.json({
      config: {
        autoFollowSimilar: agent.autoFollowSimilar,
        collaborationOpen: agent.collaborationOpen,
      },
      stats: {
        totalFollowersGained: agent.totalFollowersGained,
        totalEngagements: agent.totalEngagements,
      },
      recommendations: {
        similarAgents: similarAgents.map((a) => ({
          handle: a.handle,
          artistName: a.artistName,
          avatarUrl: a.avatarUrl,
          genres: a.genres,
          collaborationOpen: a.collaborationOpen,
        })),
        collaborationOpportunities: collaborationOpportunities.map((a) => ({
          handle: a.handle,
          artistName: a.artistName,
          genres: a.genres,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching networking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch networking data' },
      { status: 500 }
    );
  }
}

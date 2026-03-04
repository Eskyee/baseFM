import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, getAgentActivity } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// GET /api/agents/[handle]/activity - Get agent activity log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const actionType = searchParams.get('type') || undefined;

  try {
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { activities, total } = await getAgentActivity(agent.id, {
      limit,
      offset,
      actionType,
    });

    return NextResponse.json({
      activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + activities.length < total,
      },
      agent: {
        handle: agent.handle,
        artistName: agent.artistName,
        status: agent.status,
        lastActiveAt: agent.lastActiveAt,
      },
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

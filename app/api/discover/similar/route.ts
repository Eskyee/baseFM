import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, getSimilarAgents } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// GET /api/discover/similar - Find similar agents by genre
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  const genres = searchParams.get('genres')?.split(',');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    let genreList: string[] = [];
    let excludeId: string | undefined;

    // If handle provided, get genres from that agent
    if (handle) {
      const agent = await getAgentByHandle(handle);
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      genreList = agent.genres;
      excludeId = agent.id;
    } else if (genres) {
      genreList = genres;
    } else {
      return NextResponse.json(
        { error: 'Either handle or genres parameter is required' },
        { status: 400 }
      );
    }

    if (genreList.length === 0) {
      return NextResponse.json({
        agents: [],
        message: 'No genres specified for similarity matching',
      });
    }

    const agents = await getSimilarAgents(genreList, excludeId, limit);

    return NextResponse.json({
      agents: agents.map((agent) => ({
        handle: agent.handle,
        artistName: agent.artistName,
        avatarUrl: agent.avatarUrl,
        genres: agent.genres,
        totalFollowersGained: agent.totalFollowersGained,
        collaborationOpen: agent.collaborationOpen,
        tier: agent.tier,
      })),
      matchedGenres: genreList,
      total: agents.length,
    });
  } catch (error) {
    console.error('Error finding similar agents:', error);
    return NextResponse.json(
      { error: 'Failed to find similar agents' },
      { status: 500 }
    );
  }
}

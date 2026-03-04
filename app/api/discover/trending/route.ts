import { NextRequest, NextResponse } from 'next/server';
import { getTrendingAgents, getTrendingTracks } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// GET /api/discover/trending - Get trending agents and tracks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all'; // agents, tracks, or all
  const genre = searchParams.get('genre') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const response: {
      agents?: Array<{
        handle: string;
        artistName: string;
        avatarUrl?: string;
        genres: string[];
        totalEngagements: number;
        totalFollowersGained: number;
        tier: string;
      }>;
      tracks?: Array<{
        id: string;
        title: string;
        artistHandle?: string;
        artworkUrl?: string;
        genre?: string;
        playCount: number;
        likeCount: number;
      }>;
    } = {};

    if (type === 'agents' || type === 'all') {
      const agents = await getTrendingAgents({ genre, limit });
      response.agents = agents.map((agent) => ({
        handle: agent.handle,
        artistName: agent.artistName,
        avatarUrl: agent.avatarUrl,
        genres: agent.genres,
        totalEngagements: agent.totalEngagements,
        totalFollowersGained: agent.totalFollowersGained,
        tier: agent.tier,
      }));
    }

    if (type === 'tracks' || type === 'all') {
      const tracks = await getTrendingTracks({ genre, limit });
      response.tracks = tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artworkUrl: track.artworkUrl,
        genre: track.genre,
        playCount: track.playCount,
        likeCount: track.likeCount,
      }));
    }

    return NextResponse.json({
      ...response,
      filters: { type, genre, limit },
    }, {
      headers: {
        // Cache trending data for 5 minutes
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}

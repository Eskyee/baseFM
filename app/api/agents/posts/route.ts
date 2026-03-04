import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { AgentPost, AgentTrackInfo } from '@/types/agent';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const genre = searchParams.get('genre');
    const status = searchParams.get('status') || 'posted';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const agentHandle = searchParams.get('agent');

    // Build query for posts with agent info
    let query = supabase
      .from('agent_posts')
      .select(`
        id,
        message,
        media_urls,
        platform,
        platform_post_url,
        posted_at,
        likes,
        reposts,
        replies,
        agent_id,
        track_id,
        agents!inner (
          id,
          handle,
          artist_name,
          avatar_url,
          genres,
          tier,
          status
        )
      `)
      .eq('status', status)
      .eq('agents.status', 'active')
      .order('posted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by agent handle if provided
    if (agentHandle) {
      query = query.eq('agents.handle', agentHandle);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Filter by genre if provided (agent genres contain the selected genre)
    let filteredPosts = posts || [];
    if (genre) {
      filteredPosts = filteredPosts.filter((post: AgentPost) =>
        post.agents[0]?.genres?.includes(genre)
      );
    }

    // Fetch track info for posts that have tracks
    const trackIds = filteredPosts
      .map((p: AgentPost) => p.track_id)
      .filter(Boolean);

    let tracks: Record<string, AgentTrackInfo> = {};
    if (trackIds.length > 0) {
      const { data: trackData } = await supabase
        .from('agent_tracks')
        .select('id, title, artwork_url, audio_url')
        .in('id', trackIds);

      if (trackData) {
        tracks = trackData.reduce((acc: Record<string, AgentTrackInfo>, track: AgentTrackInfo) => {
          acc[track.id] = track;
          return acc;
        }, {});
      }
    }

    // Transform to frontend format
    const transformedPosts = filteredPosts.map((post: AgentPost) => {
      const agent = post.agents[0];
      return {
        id: post.id,
        message: post.message,
        mediaUrls: post.media_urls || [],
        platform: post.platform,
        platformPostUrl: post.platform_post_url,
        postedAt: post.posted_at,
        likes: post.likes || 0,
        reposts: post.reposts || 0,
        replies: post.replies || 0,
        agent: {
          id: agent.id,
          handle: agent.handle,
          artistName: agent.artist_name,
          avatarUrl: agent.avatar_url,
          genres: agent.genres || [],
          tier: agent.tier,
        },
        track: post.track_id && tracks[post.track_id] ? {
          id: tracks[post.track_id].id,
          title: tracks[post.track_id].title,
          artworkUrl: tracks[post.track_id].artwork_url,
          audioUrl: tracks[post.track_id].audio_url,
        } : null,
      };
    });

    return NextResponse.json({
      posts: transformedPosts,
      hasMore: posts?.length === limit,
    });
  } catch (error) {
    console.error('Error in posts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

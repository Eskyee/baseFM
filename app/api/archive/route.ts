import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    const supabase = createServerClient();

    // Build date filter
    let dateFilter = '';
    const now = new Date();

    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = weekAgo.toISOString();
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = monthAgo.toISOString();
    }

    // Query archived streams (those with playback_id and status = 'idle' or 'completed')
    let query = supabase
      .from('streams')
      .select(`
        id,
        title,
        playback_id,
        thumbnail_url,
        duration,
        ended_at,
        genre,
        view_count,
        wallet_address
      `)
      .not('playback_id', 'is', null)
      .in('status', ['idle', 'completed'])
      .gt('duration', 300) // Only shows longer than 5 minutes
      .order('ended_at', { ascending: false })
      .limit(50);

    if (dateFilter) {
      query = query.gte('ended_at', dateFilter);
    }

    const { data: streams, error } = await query;

    if (error) {
      console.error('Archive query error:', error);
      return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500 });
    }

    // Get DJ info for each stream
    const walletAddresses = [...new Set((streams || []).map(s => s.wallet_address))];

    let djMap: Record<string, { name: string; slug: string; avatar_url: string | null }> = {};

    if (walletAddresses.length > 0) {
      const { data: djs } = await supabase
        .from('djs')
        .select('wallet_address, name, slug, avatar_url')
        .in('wallet_address', walletAddresses);

      if (djs) {
        djMap = djs.reduce((acc, dj) => {
          acc[dj.wallet_address] = {
            name: dj.name,
            slug: dj.slug,
            avatar_url: dj.avatar_url,
          };
          return acc;
        }, {} as typeof djMap);
      }
    }

    // Format response
    const shows = (streams || []).map((stream) => {
      const dj = djMap[stream.wallet_address] || {
        name: `${stream.wallet_address.slice(0, 6)}...${stream.wallet_address.slice(-4)}`,
        slug: stream.wallet_address.toLowerCase(),
        avatar_url: null,
      };

      return {
        id: stream.id,
        title: stream.title,
        djName: dj.name,
        djSlug: dj.slug,
        djAvatar: dj.avatar_url,
        playbackId: stream.playback_id,
        thumbnailUrl: stream.thumbnail_url,
        duration: stream.duration || 0,
        recordedAt: stream.ended_at,
        genre: stream.genre,
        viewCount: stream.view_count || 0,
      };
    });

    return NextResponse.json({ shows });
  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

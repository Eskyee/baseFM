import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

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

    // Query archived streams (ENDED with playback)
    let query = supabase
      .from('streams')
      .select(`
        id,
        title,
        mux_playback_id,
        playback_id,
        cover_image_url,
        thumbnail_url,
        duration,
        ended_at,
        actual_end_time,
        genre,
        view_count,
        viewer_count,
        peak_viewers,
        dj_wallet_address,
        wallet_address,
        dj_name
      `)
      .in('status', ['ENDED', 'idle', 'completed'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }

    const { data: streams, error } = await query;

    if (error) {
      console.error('Archive query error:', error);
      return NextResponse.json({ error: 'Failed to fetch archive' }, { status: 500 });
    }

    // Get DJ info for each stream
    const walletAddresses = Array.from(new Set(
      (streams || [])
        .map(s => s.dj_wallet_address || s.wallet_address)
        .filter(Boolean)
    ));

    let djMap: Record<string, { name: string; slug: string; avatar_url: string | null }> = {};

    if (walletAddresses.length > 0) {
      const { data: djs } = await supabase
        .from('djs')
        .select('wallet_address, name, slug, avatar_url')
        .in('wallet_address', walletAddresses);

      if (djs) {
        djMap = djs.reduce((acc, dj) => {
          acc[dj.wallet_address.toLowerCase()] = {
            name: dj.name,
            slug: dj.slug,
            avatar_url: dj.avatar_url,
          };
          return acc;
        }, {} as typeof djMap);
      }
    }

    // Format response
    const shows = (streams || [])
      .filter(s => {
        const pbId = s.playback_id || s.mux_playback_id;
        const dur = s.duration || 0;
        return pbId || dur > 60; // Show if has playback OR longer than 1 min
      })
      .map((stream) => {
        const wallet = stream.dj_wallet_address || stream.wallet_address || '';
        const dj = djMap[wallet.toLowerCase()] || {
          name: stream.dj_name || `${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
          slug: wallet.toLowerCase(),
          avatar_url: null,
        };

        return {
          id: stream.id,
          title: stream.title,
          djName: dj.name,
          djSlug: dj.slug,
          djAvatar: dj.avatar_url,
          playbackId: stream.playback_id || stream.mux_playback_id,
          thumbnailUrl: stream.thumbnail_url || stream.cover_image_url,
          duration: stream.duration || 0,
          recordedAt: stream.ended_at || stream.actual_end_time,
          genre: stream.genre,
          viewCount: stream.view_count || stream.viewer_count || stream.peak_viewers || 0,
        };
      });

    return NextResponse.json({ shows });
  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

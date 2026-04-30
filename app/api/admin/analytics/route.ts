import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-auth';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const supabase = createServerClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Parallel queries for platform-wide stats
    const [
      allStreamsResult,
      recentStreamsResult,
      weekStreamsResult,
      djsResult,
      membersResult,
      tipsResult,
      chatResult,
    ] = await Promise.allSettled([
      // All time stream count
      supabase.from('streams').select('id', { count: 'exact', head: true }),
      // Last 30 days streams
      supabase.from('streams').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      // Last 7 days streams
      supabase.from('streams').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      // Total DJs
      supabase.from('djs').select('id', { count: 'exact', head: true }),
      // Total community members
      supabase.from('community_members').select('id', { count: 'exact', head: true }),
      // Total tips (last 30 days)
      supabase.from('tips').select('amount').gte('created_at', thirtyDaysAgo).eq('status', 'confirmed'),
      // Chat messages (last 7 days)
      supabase.from('chat_messages').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    ]);

    // Get stream stats (viewers, duration) for last 30 days
    const { data: streamData } = await supabase
      .from('streams')
      .select('viewer_count, peak_viewers, status, started_at, ended_at, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false });

    // Get top streams by peak viewers
    const { data: topStreams } = await supabase
      .from('streams')
      .select('id, title, dj_name, peak_viewers, viewer_count, status, created_at')
      .order('peak_viewers', { ascending: false })
      .limit(10);

    // Get DJ leaderboard
    const { data: topDjs } = await supabase
      .from('djs')
      .select('id, name, slug, total_shows, total_listeners, is_verified')
      .eq('is_banned', false)
      .order('total_shows', { ascending: false })
      .limit(10);

    // Calculate stream metrics
    const streams = streamData || [];
    const totalViewers = streams.reduce((sum, s) => sum + (s.peak_viewers || s.viewer_count || 0), 0);
    const avgViewers = streams.length > 0 ? Math.round(totalViewers / streams.length) : 0;
    const liveNow = streams.filter(s => s.status === 'LIVE').length;

    // Calculate total duration (seconds)
    const totalDuration = streams.reduce((sum, s) => {
      if (!s.started_at) return sum;
      const end = s.ended_at ? new Date(s.ended_at) : new Date();
      return sum + Math.floor((end.getTime() - new Date(s.started_at).getTime()) / 1000);
    }, 0);

    // Tips total
    const tips = tipsResult.status === 'fulfilled' && tipsResult.value.data ? tipsResult.value.data : [];
    const totalTipsAmount = tips.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // Daily breakdown for last 7 days
    const dailyBreakdown: { date: string; streams: number; viewers: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayStreams = streams.filter(s => {
        const created = new Date(s.created_at);
        return created >= dayStart && created < dayEnd;
      });
      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        streams: dayStreams.length,
        viewers: dayStreams.reduce((sum, s) => sum + (s.peak_viewers || s.viewer_count || 0), 0),
      });
    }

    return NextResponse.json({
      overview: {
        totalStreams: allStreamsResult.status === 'fulfilled' ? (allStreamsResult.value.count || 0) : 0,
        streamsLast30d: recentStreamsResult.status === 'fulfilled' ? (recentStreamsResult.value.count || 0) : 0,
        streamsLast7d: weekStreamsResult.status === 'fulfilled' ? (weekStreamsResult.value.count || 0) : 0,
        totalDjs: djsResult.status === 'fulfilled' ? (djsResult.value.count || 0) : 0,
        totalMembers: membersResult.status === 'fulfilled' ? (membersResult.value.count || 0) : 0,
        totalViewers,
        avgViewers,
        liveNow,
        totalDuration,
        totalTipsAmount: Math.round(totalTipsAmount * 100) / 100,
        chatMessages7d: chatResult.status === 'fulfilled' ? (chatResult.value.count || 0) : 0,
      },
      dailyBreakdown,
      topStreams: (topStreams || []).map(s => ({
        id: s.id,
        title: s.title,
        djName: s.dj_name,
        peakViewers: s.peak_viewers || s.viewer_count || 0,
        status: s.status,
        createdAt: s.created_at,
      })),
      topDjs: (topDjs || []).map(dj => ({
        id: dj.id,
        name: dj.name,
        slug: dj.slug,
        totalShows: dj.total_shows || 0,
        totalListeners: dj.total_listeners || 0,
        isVerified: dj.is_verified,
      })),
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}

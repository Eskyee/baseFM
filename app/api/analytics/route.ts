import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet required' }, { status: 400 });
    }

    // Get DJ profile
    const { data: dj } = await supabase
      .from('djs')
      .select('id')
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    if (!dj) {
      return NextResponse.json({
        totalStreams: 0,
        totalViewers: 0,
        totalTips: 0,
        totalDuration: 0,
        streams: [],
      });
    }

    // Get all streams for this DJ
    const { data: streams } = await supabase
      .from('streams')
      .select('*')
      .eq('dj_id', dj.id)
      .order('created_at', { ascending: false });

    if (!streams || streams.length === 0) {
      return NextResponse.json({
        totalStreams: 0,
        totalViewers: 0,
        totalTips: 0,
        totalDuration: 0,
        streams: [],
      });
    }

    // Get tips for all streams
    const streamIds = streams.map((s) => s.id);
    const { data: tips } = await supabase
      .from('tips')
      .select('stream_id, amount')
      .in('stream_id', streamIds);

    // Get chat message counts
    const { data: chatCounts } = await supabase
      .from('chat_messages')
      .select('stream_id')
      .in('stream_id', streamIds);

    // Calculate per-stream stats
    const streamStats = streams.map((stream) => {
      const streamTips = tips?.filter((t) => t.stream_id === stream.id) || [];
      const totalTips = streamTips.reduce((sum, t) => sum + (t.amount || 0), 0);
      const chatMessages = chatCounts?.filter((c) => c.stream_id === stream.id).length || 0;

      // Calculate duration
      let duration = 0;
      if (stream.started_at) {
        const endTime = stream.ended_at ? new Date(stream.ended_at) : new Date();
        duration = Math.floor((endTime.getTime() - new Date(stream.started_at).getTime()) / 1000);
      }

      return {
        id: stream.id,
        title: stream.title,
        status: stream.status,
        viewerCount: stream.viewer_count || 0,
        peakViewers: stream.peak_viewers || stream.viewer_count || 0,
        totalTips,
        chatMessages,
        duration,
        createdAt: stream.created_at,
      };
    });

    // Calculate totals
    const totalStreams = streams.length;
    const totalViewers = streamStats.reduce((sum, s) => sum + s.peakViewers, 0);
    const totalTips = streamStats.reduce((sum, s) => sum + s.totalTips, 0);
    const totalDuration = streamStats.reduce((sum, s) => sum + s.duration, 0);

    return NextResponse.json({
      totalStreams,
      totalViewers,
      totalTips,
      totalDuration,
      streams: streamStats,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

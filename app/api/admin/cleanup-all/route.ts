import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { deleteMuxLiveStream } from '@/lib/streaming/mux';

/**
 * POST /api/admin/cleanup-all
 * 
 * System-level cleanup to reconcile with Mux and clear all ghost streams.
 * Triggered by Agentbot ops or Admin.
 */
export async function POST(request: NextRequest) {
  // Simple internal secret for now to allow Agentbot to trigger
  const authHeader = request.headers.get('authorization');
  const internalSecret = process.env.INTERNAL_OPS_SECRET;
  
  if (!internalSecret || authHeader !== `Bearer ${internalSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const muxTokenId = process.env.MUX_TOKEN_ID;
    const muxTokenSecret = process.env.MUX_TOKEN_SECRET;
    
    if (!muxTokenId || !muxTokenSecret) {
      return NextResponse.json({ error: 'Mux credentials missing' }, { status: 500 });
    }

    const auth = Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString('base64');
    const muxRes = await fetch('https://api.mux.com/video/v1/live-streams?limit=100', {
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (!muxRes.ok) throw new Error('Failed to fetch Mux streams');
    
    const muxData = await muxRes.json();
    const activeMuxStreamIds = new Set((muxData.data || [])
      .filter((s: any) => s.status === 'active')
      .map((s: any) => s.id));

    const supabase = createServerClient();
    
    // Find all streams marked as LIVE that aren't actually active in Mux
    const { data: currentlyLive, error: fetchError } = await supabase
      .from('streams')
      .select('id, mux_live_stream_id')
      .eq('status', 'LIVE');

    if (fetchError) throw fetchError;

    const ghostStreams = (currentlyLive || []).filter(s => !activeMuxStreamIds.has(s.mux_live_stream_id));
    
    if (ghostStreams.length > 0) {
      // Cleanup Mux resources for ghosts just in case
      for (const s of ghostStreams) {
        if (s.mux_live_stream_id) {
          try { await deleteMuxLiveStream(s.mux_live_stream_id); } catch (e) {}
        }
      }

      // Mark as ended
      const { error: updateError } = await supabase
        .from('streams')
        .update({ status: 'ENDED', actual_end_time: new Date().toISOString() })
        .in('id', ghostStreams.map(s => s.id));

      if (updateError) throw updateError;
    }

    return NextResponse.json({
      success: true,
      cleared: ghostStreams.length,
      message: `System cleanup complete. ${ghostStreams.length} ghost streams resolved.`
    });

  } catch (error) {
    console.error('[AdminCleanup] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

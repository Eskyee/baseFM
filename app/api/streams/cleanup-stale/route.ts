import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { verifyWalletSignature } from '@/lib/auth/wallet';
import { deleteMuxLiveStream } from '@/lib/streaming/mux';

/**
 * POST /api/streams/cleanup-stale
 * 
 * Allows a DJ to self-clear any stale or "ghost" streams they own.
 * This fixes the issue where basefm.space shows them as LIVE when they aren't.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { djWalletAddress, signature, message, timestamp, mode } = body as {
      djWalletAddress?: string;
      signature?: string;
      message?: string;
      timestamp?: string;
      mode?: 'all' | 'queued';
    };

    if (!djWalletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required signature fields' },
        { status: 400 }
      );
    }

    // 1. Verify Signature
    const isValid = await verifyWalletSignature(djWalletAddress, message, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Prevent Replay (10 min window)
    const requestTime = new Date(timestamp ?? '').getTime();
    if (Number.isNaN(requestTime) || Math.abs(Date.now() - requestTime) > 10 * 60 * 1000) {
      return NextResponse.json({ error: 'Timestamp expired' }, { status: 401 });
    }

    const supabase = createServerClient();
    const wallet = djWalletAddress.toLowerCase();
    // 'queued' clears only CREATED streams (unused queued sets) without touching
    // any LIVE/PREPARING/ENDING set in flight. 'all' is the previous behaviour.
    const cleanupMode: 'all' | 'queued' = mode === 'queued' ? 'queued' : 'all';

    // 3. Find streams for this DJ matching the requested cleanup mode
    let query = supabase
      .from('streams')
      .select('id, mux_live_stream_id, status')
      .eq('dj_wallet_address', wallet);
    query = cleanupMode === 'queued'
      ? query.eq('status', 'CREATED')
      : query.neq('status', 'ENDED');
    const { data: staleStreams, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    if (!staleStreams || staleStreams.length === 0) {
      return NextResponse.json({
        success: true,
        message: cleanupMode === 'queued'
          ? 'No queued sets found for this wallet.'
          : 'No stale streams found for this wallet.'
      });
    }

    // 4. Cleanup Mux and Database
    let muxCount = 0;
    for (const s of staleStreams) {
      if (s.mux_live_stream_id) {
        try {
          await deleteMuxLiveStream(s.mux_live_stream_id);
          muxCount++;
        } catch (e) {
          console.warn(`Failed to delete Mux stream ${s.mux_live_stream_id}:`, e);
        }
      }
    }

    // Apply the same status filter when updating so queued cleanup never
    // touches a LIVE/PREPARING/ENDING set.
    let updateQuery = supabase
      .from('streams')
      .update({ status: 'ENDED', actual_end_time: new Date().toISOString() })
      .eq('dj_wallet_address', wallet);
    updateQuery = cleanupMode === 'queued'
      ? updateQuery.eq('status', 'CREATED')
      : updateQuery.neq('status', 'ENDED');
    const { error: updateError } = await updateQuery;

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: cleanupMode === 'queued'
        ? `Cleared ${staleStreams.length} queued set${staleStreams.length === 1 ? '' : 's'} and ${muxCount} Mux resources.`
        : `Successfully cleared ${staleStreams.length} stale streams and ${muxCount} Mux resources.`,
      count: staleStreams.length,
      mode: cleanupMode,
    });

  } catch (error) {
    console.error('[CleanupStale] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during cleanup' },
      { status: 500 }
    );
  }
}

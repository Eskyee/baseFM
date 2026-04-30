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
    const { djWalletAddress, signature, message, timestamp } = body;

    if (!djWalletAddress) {
      return NextResponse.json(
        { error: 'Missing djWalletAddress' },
        { status: 400 }
      );
    }

    // Verify signature when present, otherwise accept wallet-verified request
    const hasSignaturePayload = Boolean(signature && message);

    if (hasSignaturePayload) {
      const isValid = await verifyWalletSignature(djWalletAddress, message, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }

      // Prevent replay (10 min window)
      const requestTime = new Date(timestamp).getTime();
      if (Math.abs(Date.now() - requestTime) > 10 * 60 * 1000) {
        return NextResponse.json({ error: 'Timestamp expired' }, { status: 401 });
      }
    }

    const supabase = createServerClient();
    const wallet = djWalletAddress.toLowerCase();

    // 3. Find all non-ended streams for this DJ
    const { data: staleStreams, error: fetchError } = await supabase
      .from('streams')
      .select('id, mux_live_stream_id, status')
      .eq('dj_wallet_address', wallet)
      .neq('status', 'ENDED');

    if (fetchError) throw fetchError;

    if (!staleStreams || staleStreams.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No stale streams found for this wallet.' 
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

    // Update all to ENDED
    const { error: updateError } = await supabase
      .from('streams')
      .update({ status: 'ENDED', actual_end_time: new Date().toISOString() })
      .eq('dj_wallet_address', wallet)
      .neq('status', 'ENDED');

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${staleStreams.length} stale streams and ${muxCount} Mux resources.`,
      count: staleStreams.length
    });

  } catch (error) {
    console.error('[CleanupStale] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during cleanup' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { deleteMuxLiveStream } from '@/lib/streaming/mux';
import { isAdminWallet, getAdminWallets } from '@/lib/admin/config';

// Admin endpoint to delete all streams
// Protected by wallet address check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const walletAddress = body.walletAddress;

    // Check if admin wallets are configured
    if (getAdminWallets().length === 0) {
      return NextResponse.json(
        { error: 'Admin not configured. Set ADMIN_WALLET_ADDRESS env var.' },
        { status: 503 }
      );
    }

    // Check if wallet is admin
    if (!isAdminWallet(walletAddress)) {
      return NextResponse.json(
        { error: 'Unauthorized: wallet is not an admin' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // First, get all streams to clean up Mux
    const { data: streams, error: fetchError } = await supabase
      .from('streams')
      .select('id, mux_live_stream_id');

    if (fetchError) {
      throw new Error(`Failed to fetch streams: ${fetchError.message}`);
    }

    // Delete Mux live streams
    let muxDeleteCount = 0;
    for (const stream of streams || []) {
      if (stream.mux_live_stream_id) {
        try {
          await deleteMuxLiveStream(stream.mux_live_stream_id);
          muxDeleteCount++;
        } catch (err) {
          console.error(`Failed to delete Mux stream ${stream.mux_live_stream_id}:`, err);
        }
      }
    }

    // Delete all streams from database
    const { error: deleteError } = await supabase
      .from('streams')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq impossible value)

    if (deleteError) {
      throw new Error(`Failed to delete streams: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${streams?.length || 0} streams from database, ${muxDeleteCount} from Mux`,
    });
  } catch (error) {
    console.error('Error clearing streams:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to clear streams: ${errorMessage}` },
      { status: 500 }
    );
  }
}

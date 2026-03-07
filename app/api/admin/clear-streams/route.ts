import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-auth';
import { createServerClient } from '@/lib/supabase/client';
import { deleteMuxLiveStream } from '@/lib/streaming/mux';

// Admin endpoint to delete all streams
// Protected by wallet signature verification
export async function POST(request: NextRequest) {
  // Check admin authorization with signature verification
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
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

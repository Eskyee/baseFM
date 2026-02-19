import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamStatus } from '@/lib/db/streams';
import { getMuxLiveStreamStatus } from '@/lib/streaming/mux';
import { STREAM_STATUS, MUX_STATUS } from '@/lib/constants/stream';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await getStreamById(params.id);

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (!stream.muxLiveStreamId) {
      return NextResponse.json({ error: 'No Mux stream configured' }, { status: 400 });
    }

    // Check Mux status directly
    const muxStatus = await getMuxLiveStreamStatus(stream.muxLiveStreamId);
    console.log(`[check-status] Stream ${params.id} Mux status: ${muxStatus}`);

    // Map Mux status to our status
    let newStatus = stream.status;
    if (muxStatus === MUX_STATUS.ACTIVE) {
      newStatus = STREAM_STATUS.LIVE;
    } else if (muxStatus === MUX_STATUS.IDLE && stream.status === STREAM_STATUS.LIVE) {
      newStatus = STREAM_STATUS.ENDING;
    } else if (muxStatus === MUX_STATUS.IDLE && stream.status === STREAM_STATUS.PREPARING) {
      // Still preparing, waiting for video feed
      newStatus = STREAM_STATUS.PREPARING;
    }

    // Update if changed
    if (newStatus !== stream.status) {
      await updateStreamStatus(params.id, newStatus);
      console.log(`[check-status] Updated stream ${params.id} from ${stream.status} to ${newStatus}`);
    }

    return NextResponse.json({
      muxStatus,
      previousStatus: stream.status,
      currentStatus: newStatus,
      updated: newStatus !== stream.status,
    });
  } catch (error) {
    console.error('Check status error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}

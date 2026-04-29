import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamStatus } from '@/lib/db/streams';
import { getMuxLiveStreamSnapshot } from '@/lib/streaming/mux';
import { STREAM_STATUS, MUX_STATUS } from '@/lib/constants/stream';

type StreamHealth = 'good' | 'waiting' | 'bad';

function deriveHealth(muxStatus: string, dbStatus: string): StreamHealth {
  if (muxStatus === MUX_STATUS.ACTIVE) return 'good';
  if (muxStatus === MUX_STATUS.IDLE && dbStatus === STREAM_STATUS.PREPARING) return 'waiting';
  if (muxStatus === MUX_STATUS.IDLE) return 'waiting';
  return 'bad';
}

async function buildStatusPayload(streamId: string) {
  const stream = await getStreamById(streamId);

  if (!stream) {
    return { status: 404, body: { error: 'Stream not found' } };
  }

  if (!stream.muxLiveStreamId) {
    return { status: 400, body: { error: 'No Mux stream configured' } };
  }

  const snapshot = await getMuxLiveStreamSnapshot(stream.muxLiveStreamId);
  const muxStatus = snapshot.status;

  // Map Mux status to our status
  let newStatus = stream.status;
  if (muxStatus === MUX_STATUS.ACTIVE) {
    newStatus = STREAM_STATUS.LIVE;
  } else if (muxStatus === MUX_STATUS.IDLE && stream.status === STREAM_STATUS.LIVE) {
    newStatus = STREAM_STATUS.ENDING;
  } else if (muxStatus === MUX_STATUS.IDLE && stream.status === STREAM_STATUS.PREPARING) {
    newStatus = STREAM_STATUS.PREPARING;
  }

  // Update if changed
  if (newStatus !== stream.status) {
    await updateStreamStatus(streamId, newStatus);
  }

  // pickupRecommended: Mux is active but our DB hasn't flipped to LIVE *yet*.
  // Compare against the original stream.status (not newStatus, which we just
  // updated to LIVE on this call), so the UI can prompt the DJ to press
  // "Refresh Station" while the listener page is still showing PREPARING.
  const pickupRecommended = muxStatus === MUX_STATUS.ACTIVE && stream.status !== STREAM_STATUS.LIVE;

  return {
    status: 200,
    body: {
      muxStatus,
      previousStatus: stream.status,
      currentStatus: newStatus,
      updated: newStatus !== stream.status,
      mux: {
        id: snapshot.id,
        status: snapshot.status,
        playbackId: snapshot.playbackId,
        recentAssetIds: snapshot.recentAssetIds,
      },
      streamHealth: deriveHealth(muxStatus, newStatus),
      pickupRecommended,
    },
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await buildStatusPayload(params.id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Check status error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await buildStatusPayload(params.id);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Check status error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}

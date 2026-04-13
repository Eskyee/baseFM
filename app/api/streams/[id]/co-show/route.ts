import { NextRequest, NextResponse } from 'next/server';
import { getStreamById } from '@/lib/db/streams';
import { createCoShow, getCoShowByStreamId } from '@/lib/db/co-show';
import { createMuxCoShowStream, isMuxConfigured } from '@/lib/streaming/mux';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coShow = await getCoShowByStreamId(params.id);
    if (!coShow) {
      return NextResponse.json({ coShow: null });
    }
    return NextResponse.json({ coShow });
  } catch (error) {
    console.error('Error getting co-show:', error);
    return NextResponse.json(
      { error: 'Failed to get co-show' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isMuxConfigured()) {
      return NextResponse.json(
        { error: 'Streaming service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { djWalletAddress, djName } = body;

    if (!djWalletAddress) {
      return NextResponse.json(
        { error: 'djWalletAddress is required' },
        { status: 400 }
      );
    }

    // Verify stream exists
    const stream = await getStreamById(params.id);
    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Verify ownership
    if (djWalletAddress.toLowerCase() !== stream.djWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: you do not own this stream' },
        { status: 403 }
      );
    }

    // Check no active co-show exists
    const existing = await getCoShowByStreamId(params.id);
    if (existing) {
      return NextResponse.json(
        { error: 'An active co-show already exists for this stream', coShow: existing },
        { status: 409 }
      );
    }

    // Create Mux stream with reconnect window for DJ handoff
    const muxStream = await createMuxCoShowStream(params.id);

    // Create co-show record
    const coShow = await createCoShow({
      streamId: params.id,
      hostWallet: djWalletAddress,
      hostName: djName || stream.djName,
      muxStreamKey: muxStream.streamKey,
      muxRtmpUrl: muxStream.rtmpUrl,
      muxPlaybackId: muxStream.playbackId,
    });

    return NextResponse.json({
      coShow,
      inviteUrl: `/co-show/${coShow.inviteCode}`,
    });
  } catch (error) {
    console.error('Error creating co-show:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create co-show: ${msg}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamWithMuxDetails } from '@/lib/db/streams';
import { createMuxLiveStream, getMuxPlaybackUrl, isMuxConfigured } from '@/lib/streaming/mux';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check Mux configuration
    if (!isMuxConfigured()) {
      return NextResponse.json(
        { error: 'Streaming service not configured. Please add MUX_TOKEN_ID and MUX_TOKEN_SECRET to environment variables.' },
        { status: 503 }
      );
    }

    // Get stream
    const stream = await getStreamById(params.id);
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Check if stream already has Mux credentials
    if (stream.muxStreamKey) {
      return NextResponse.json(
        { error: 'Stream already has Mux credentials', stream },
        { status: 400 }
      );
    }

    // Verify ownership via wallet address (passed in body)
    const body = await request.json().catch(() => ({}));
    if (body.djWalletAddress?.toLowerCase() !== stream.djWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: you do not own this stream' },
        { status: 403 }
      );
    }

    // Create Mux live stream
    const muxStream = await createMuxLiveStream(stream.id);

    // Update stream with Mux details
    const updatedStream = await updateStreamWithMuxDetails(stream.id, {
      muxLiveStreamId: muxStream.id,
      muxStreamKey: muxStream.streamKey,
      muxPlaybackId: muxStream.playbackId,
      rtmpUrl: muxStream.rtmpUrl,
      hlsPlaybackUrl: getMuxPlaybackUrl(muxStream.playbackId),
    });

    return NextResponse.json({
      stream: updatedStream,
      message: 'Mux credentials generated successfully'
    });
  } catch (error) {
    console.error('Error setting up Mux for stream:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to setup streaming: ${errorMessage}` },
      { status: 500 }
    );
  }
}

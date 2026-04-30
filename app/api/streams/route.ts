import { NextRequest, NextResponse } from 'next/server';
import { createStream, getStreams, deleteStream } from '@/lib/db/streams';
import { createMuxLiveStream, getMuxPlaybackUrl, isMuxConfigured } from '@/lib/streaming/mux';
import { updateStreamWithMuxDetails } from '@/lib/db/streams';
import { isValidWalletAddress } from '@/lib/auth/wallet';
import { fetchAgentbotLiveStreams } from '@/lib/agentbot/live';
import { StreamStatus } from '@/types/stream';
import { recordProductLearningEvent } from '@/lib/db/product-learning';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache' };

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.getAll('status') as StreamStatus[];
    const djWalletAddress = searchParams.get('djWalletAddress');
    const limit = searchParams.get('limit');

    const wantsOnlyLive =
      status.length > 0 &&
      status.every((value) => value === 'LIVE') &&
      !djWalletAddress

    if (wantsOnlyLive) {
      try {
        const streams = await fetchAgentbotLiveStreams()
        return NextResponse.json(
          {
            streams: limit ? streams.slice(0, parseInt(limit, 10)) : streams,
            source: 'agentbot-canonical',
          },
          { headers: NO_CACHE }
        )
      } catch (error) {
        console.error('[baseFM] Agentbot live fallback failed, using local DB:', error)
        recordProductLearningEvent({
          eventType: 'agentbot_live_fallback',
          severity: 'warning',
          surface: 'streams',
          route: '/api/streams',
          details: error instanceof Error ? error.message : 'Agentbot live fetch failed',
        }).catch(() => {});
      }
    }

    const streams = await getStreams({
      status: status.length > 0 ? status : undefined,
      djWalletAddress: djWalletAddress || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json({ streams }, { headers: NO_CACHE });
  } catch (error) {
    console.error('Error fetching streams:', error);
    recordProductLearningEvent({
      eventType: 'stream_fetch_error',
      severity: 'error',
      surface: 'streams',
      route: '/api/streams',
      details: error instanceof Error ? error.message : 'Failed to fetch streams',
    }).catch(() => {});
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500, headers: NO_CACHE }
    );
  }
}

export async function POST(request: NextRequest) {
  let streamId: string | null = null;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.djName || !body.djWalletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: title, djName, djWalletAddress' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!isValidWalletAddress(body.djWalletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Check Mux configuration before creating stream
    if (!isMuxConfigured()) {
      return NextResponse.json(
        { error: 'Streaming service not configured. Please add MUX_TOKEN_ID and MUX_TOKEN_SECRET to environment variables.' },
        { status: 503 }
      );
    }

    // Create stream in database
    const stream = await createStream({
      title: body.title,
      description: body.description,
      djName: body.djName,
      djWalletAddress: body.djWalletAddress,
      scheduledStartTime: body.scheduledStartTime,
      isGated: body.isGated,
      requiredTokenAddress: body.requiredTokenAddress,
      requiredTokenAmount: body.requiredTokenAmount,
      coverImageUrl: body.coverImageUrl,
      genre: body.genre,
      tags: body.tags,
      xHandle: body.xHandle,
      farcasterFid: body.farcasterFid,
    });

    streamId = stream.id;

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

    return NextResponse.json({ stream: updatedStream }, { status: 201 });
  } catch (error) {
    console.error('Error creating stream:', error);
    recordProductLearningEvent({
      eventType: 'stream_creation_error',
      severity: 'error',
      surface: 'streams',
      route: '/api/streams',
      details: error instanceof Error ? error.message : 'Failed to create stream',
      streamId: streamId || undefined,
    }).catch(() => {});

    // If we created the stream but Mux failed, clean up the orphaned stream
    if (streamId) {
      try {
        await deleteStream(streamId);
        console.log('Cleaned up orphaned stream:', streamId);
      } catch (cleanupError) {
        console.error('Failed to cleanup orphaned stream:', cleanupError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Provide specific error messages
    if (errorMessage.includes('MUX_TOKEN_ID') || errorMessage.includes('MUX_TOKEN_SECRET')) {
      return NextResponse.json(
        { error: 'Streaming service not configured. Please contact the administrator.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Failed to create stream: ${errorMessage}` },
      { status: 500 }
    );
  }
}

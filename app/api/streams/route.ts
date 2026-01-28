import { NextRequest, NextResponse } from 'next/server';
import { createStream, getStreams } from '@/lib/db/streams';
import { createMuxLiveStream, getMuxPlaybackUrl } from '@/lib/streaming/mux';
import { updateStreamWithMuxDetails } from '@/lib/db/streams';
import { isValidWalletAddress } from '@/lib/auth/wallet';
import { StreamStatus } from '@/types/stream';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.getAll('status') as StreamStatus[];
    const djWalletAddress = searchParams.get('djWalletAddress');
    const limit = searchParams.get('limit');

    const streams = await getStreams({
      status: status.length > 0 ? status : undefined,
      djWalletAddress: djWalletAddress || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    });

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
    return NextResponse.json(
      { error: 'Failed to create stream' },
      { status: 500 }
    );
  }
}

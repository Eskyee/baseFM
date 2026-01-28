import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamStatus } from '@/lib/db/streams';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Get stream
    const stream = await getStreamById(params.id);
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Verify DJ owns stream
    if (!body.djWalletAddress ||
        body.djWalletAddress.toLowerCase() !== stream.djWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check stream can be stopped
    if (!['PREPARING', 'LIVE'].includes(stream.status)) {
      return NextResponse.json(
        { error: `Cannot stop stream with status: ${stream.status}` },
        { status: 400 }
      );
    }

    // Update status to ENDED
    const updatedStream = await updateStreamStatus(params.id, 'ENDED');

    return NextResponse.json({ stream: updatedStream });
  } catch (error) {
    console.error('Error stopping stream:', error);
    return NextResponse.json(
      { error: 'Failed to stop stream' },
      { status: 500 }
    );
  }
}

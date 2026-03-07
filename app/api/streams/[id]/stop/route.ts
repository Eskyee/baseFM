import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamStatus } from '@/lib/db/streams';
import { verifyWalletSignature } from '@/lib/auth/wallet';
import { STREAM_STATUS, STOPPABLE_STATUSES } from '@/lib/constants/stream';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { djWalletAddress, signature, message, nonce, timestamp } = body;

    // Get stream
    const stream = await getStreamById(params.id);
    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Verify DJ owns stream
    if (!djWalletAddress || djWalletAddress.toLowerCase() !== stream.djWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Require signature verification for stopping stream
    if (!signature || !message || !nonce || !timestamp) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing signature credentials. Required: signature, message, nonce, timestamp' },
        { status: 401 }
      );
    }

    // Verify the wallet signature
    const isValidSignature = await verifyWalletSignature(djWalletAddress, message, signature);
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid signature' },
        { status: 403 }
      );
    }

    // Check timestamp to prevent replay attacks (allow 5 minute window)
    const requestTime = new Date(timestamp).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (Math.abs(now - requestTime) > fiveMinutes) {
      return NextResponse.json(
        { error: 'Unauthorized: Request timestamp expired. Please refresh and try again.' },
        { status: 401 }
      );
    }

    // Check stream can be stopped
    if (!STOPPABLE_STATUSES.includes(stream.status as any)) {
      return NextResponse.json(
        { error: `Cannot stop stream with status: ${stream.status}` },
        { status: 400 }
      );
    }

    // Update status to ENDED
    const updatedStream = await updateStreamStatus(params.id, STREAM_STATUS.ENDED);

    return NextResponse.json({ stream: updatedStream });
  } catch (error) {
    console.error('Error stopping stream:', error);
    return NextResponse.json(
      { error: 'Failed to stop stream' },
      { status: 500 }
    );
  }
}

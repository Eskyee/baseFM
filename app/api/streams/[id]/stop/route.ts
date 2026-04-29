import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamStatus } from '@/lib/db/streams';
import { verifyWalletSignature } from '@/lib/auth/wallet';
import { STREAM_STATUS, STOPPABLE_STATUSES } from '@/lib/constants/stream';
import { finalizeStreamBilling } from '@/lib/db/billing';
import { deleteMuxRecentAssets } from '@/lib/streaming/mux';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { djWalletAddress, signature, message, nonce, timestamp, archive } = body as {
      djWalletAddress?: string;
      signature?: string;
      message?: string;
      nonce?: string;
      timestamp?: string;
      // archive=true keeps the recording on Mux (DJ pays storage),
      // archive=false (default) deletes the recent assets so storage stops billing.
      archive?: boolean;
    };
    const shouldArchive = archive === true;

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

    const hasSignaturePayload = Boolean(signature && message && nonce && timestamp);

    if (hasSignaturePayload) {
      // Verify the wallet signature when present.
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
    } else {
      // Backward-compatible fallback for older deployed clients that only send djWalletAddress.
      console.warn(`[streams.stop] Legacy unsigned stop request accepted for stream ${params.id}`);
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
    await finalizeStreamBilling(updatedStream);

    // Drop recent Mux assets unless DJ explicitly chose to archive the replay.
    let archiveOutcome: { deleted: number; errors: number } | null = null;
    if (!shouldArchive && stream.muxLiveStreamId) {
      archiveOutcome = await deleteMuxRecentAssets(stream.muxLiveStreamId);
    }

    return NextResponse.json({
      stream: updatedStream,
      archive: shouldArchive,
      mux: archiveOutcome,
      message: shouldArchive
        ? 'Set ended. Replay retained on Mux (storage will keep billing while it lives).'
        : archiveOutcome
          ? `Set ended. Removed ${archiveOutcome.deleted} recent Mux asset${archiveOutcome.deleted === 1 ? '' : 's'} to stop storage billing.`
          : 'Set ended.',
    });
  } catch (error) {
    console.error('Error stopping stream:', error);
    return NextResponse.json(
      { error: 'Failed to stop stream' },
      { status: 500 }
    );
  }
}

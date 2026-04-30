import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamWithMuxDetails } from '@/lib/db/streams';
import { createMuxLiveStream, getMuxPlaybackUrl, isMuxConfigured } from '@/lib/streaming/mux';
import { verifyWalletSignature } from '@/lib/auth/wallet';
import { getBillingPricing } from '@/lib/billing/config';
import { getStreamBillingSummary, upsertStreamBillingSession } from '@/lib/db/billing';

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

    // Get request body
    const body = await request.json().catch(() => ({}));
    const { djWalletAddress, signature, message, nonce, timestamp } = body;

    // Verify DJ owns stream
    if (!djWalletAddress || djWalletAddress.toLowerCase() !== stream.djWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: you do not own this stream' },
        { status: 403 }
      );
    }

    // Verify signature when present, otherwise accept wallet-verified request
    const hasSignaturePayload = Boolean(signature && message && nonce && timestamp);

    if (hasSignaturePayload) {
      const isValidSignature = await verifyWalletSignature(djWalletAddress, message, signature);
      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid signature' },
          { status: 403 }
        );
      }

      const requestTime = new Date(timestamp).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      if (Math.abs(now - requestTime) > fiveMinutes) {
        return NextResponse.json(
          { error: 'Unauthorized: Request timestamp expired. Please refresh and try again.' },
          { status: 401 }
        );
      }
    }

    const billing = await getStreamBillingSummary(stream);
    if (!billing.canActivateStream) {
      return NextResponse.json(
        {
          error: 'Billing required before streaming credentials can be generated',
          billing,
        },
        { status: 402 }
      );
    }

    if (billing.subscription && !billing.streamSession) {
      await upsertStreamBillingSession({
        streamId: stream.id,
        djWalletAddress,
        subscriptionId: billing.subscription.id,
        sessionFeeUsdc: 0,
        meteredRateUsdcPerHour: getBillingPricing().subscribedMeteredRateUsdcPerHour,
        sessionFeeStatus: 'waived',
      });
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

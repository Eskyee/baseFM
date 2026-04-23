import { NextRequest, NextResponse } from 'next/server';
import { getStreamById, updateStreamStatus } from '@/lib/db/streams';
import { STREAM_STATUS } from '@/lib/constants/stream';
import { getBillingPricing } from '@/lib/billing/config';
import { getStreamBillingSummary, markStreamStarted, upsertStreamBillingSession } from '@/lib/db/billing';

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

    // Check stream can be started
    if (stream.status !== STREAM_STATUS.CREATED) {
      return NextResponse.json(
        { error: `Cannot start stream with status: ${stream.status}` },
        { status: 400 }
      );
    }

    const billing = await getStreamBillingSummary(stream);
    if (!billing.canActivateStream) {
      return NextResponse.json(
        { error: 'Billing required before starting stream', billing },
        { status: 402 }
      );
    }

    if (billing.subscription && !billing.streamSession) {
      await upsertStreamBillingSession({
        streamId: stream.id,
        djWalletAddress: body.djWalletAddress,
        subscriptionId: billing.subscription.id,
        sessionFeeUsdc: 0,
        meteredRateUsdcPerHour: getBillingPricing().subscribedMeteredRateUsdcPerHour,
        sessionFeeStatus: 'waived',
        startedAt: new Date().toISOString(),
      });
    } else {
      await markStreamStarted(stream.id);
    }

    // Update status to PREPARING
    await updateStreamStatus(params.id, STREAM_STATUS.PREPARING);

    // Return RTMP credentials for DJ to use in OBS/streaming software
    return NextResponse.json({
      stream: {
        ...stream,
        status: STREAM_STATUS.PREPARING,
      },
      rtmpCredentials: {
        url: stream.rtmpUrl,
        streamKey: stream.muxStreamKey,
      },
    });
  } catch (error) {
    console.error('Error starting stream:', error);
    return NextResponse.json(
      { error: 'Failed to start stream' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyMuxWebhookSignature,
  parseMuxWebhookEvent,
} from '@/lib/streaming/mux';
import { updateStreamStatus } from '@/lib/db/streams';
import { STREAM_STATUS } from '@/lib/constants/stream';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('mux-signature');
    const body = await request.text();

    // Verify webhook signature
    if (!verifyMuxWebhookSignature(body, signature)) {
      console.error('Invalid Mux webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const event = parseMuxWebhookEvent(payload);

    console.log(`Mux webhook event: ${event.type} for stream ${event.baseFmStreamId}`);

    // Skip if no baseFM stream ID (passthrough)
    if (!event.baseFmStreamId) {
      return NextResponse.json({ received: true, skipped: true });
    }

    // Update stream status based on event
    switch (event.type) {
      case 'stream_active':
        // Stream is now receiving data and is live
        await updateStreamStatus(event.baseFmStreamId, STREAM_STATUS.LIVE);
        console.log(`Stream ${event.baseFmStreamId} is now LIVE`);
        break;

      case 'stream_idle':
        // Stream stopped receiving data but connection still open
        await updateStreamStatus(event.baseFmStreamId, STREAM_STATUS.ENDING);
        console.log(`Stream ${event.baseFmStreamId} is ENDING`);
        break;

      case 'stream_disconnected':
        // Stream connection closed
        await updateStreamStatus(event.baseFmStreamId, STREAM_STATUS.ENDED);
        console.log(`Stream ${event.baseFmStreamId} has ENDED`);
        break;

      default:
        console.log(`Unhandled Mux event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Mux webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

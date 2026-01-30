import { NextRequest, NextResponse } from 'next/server';

// Farcaster Frame webhook handler for base.dev miniapp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log webhook events for debugging
    console.log('Farcaster webhook received:', JSON.stringify(body, null, 2));

    // Handle different event types
    const { type, data } = body;

    switch (type) {
      case 'frame_added':
        // User added the frame/miniapp
        console.log('Frame added by user:', data?.fid);
        break;

      case 'frame_removed':
        // User removed the frame/miniapp
        console.log('Frame removed by user:', data?.fid);
        break;

      case 'notifications_enabled':
        // User enabled notifications
        console.log('Notifications enabled by user:', data?.fid);
        break;

      case 'notifications_disabled':
        // User disabled notifications
        console.log('Notifications disabled by user:', data?.fid);
        break;

      default:
        console.log('Unknown webhook type:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Farcaster webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'baseFM Farcaster Webhook'
  });
}

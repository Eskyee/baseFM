import { NextRequest, NextResponse } from 'next/server';
import { recordProductLearningEvent } from '@/lib/db/product-learning';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.eventType || !body?.surface) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await recordProductLearningEvent({
      eventType: body.eventType,
      severity: body.severity,
      surface: body.surface,
      route: body.route,
      walletAddress: body.walletAddress,
      streamId: body.streamId,
      details: body.details,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Product learning event error:', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}

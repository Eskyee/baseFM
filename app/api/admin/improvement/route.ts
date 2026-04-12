import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-auth';
import { buildProductLearningInsights, getRecentProductLearningEvents } from '@/lib/db/product-learning';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const days = Number.parseInt(request.nextUrl.searchParams.get('days') || '7', 10);
    const events = await getRecentProductLearningEvents(Number.isNaN(days) ? 7 : days);
    const insights = buildProductLearningInsights(events);

    return NextResponse.json({
      insights,
      recentEvents: events.slice(0, 25),
    });
  } catch (error) {
    console.error('Improvement insights error:', error);
    return NextResponse.json({ error: 'Failed to load improvement insights' }, { status: 500 });
  }
}

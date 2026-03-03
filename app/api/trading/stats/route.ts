import { NextRequest, NextResponse } from 'next/server';
import { getTradingStats } from '@/lib/db/trading';

export const dynamic = 'force-dynamic';

// GET - Fetch trading stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    const stats = await getTradingStats(agentId || undefined);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Trading stats GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getLiveStreams } from '@/lib/db/streams';

// Never cache — live status must always reflect real-time DB state
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', Pragma: 'no-cache' };

export async function GET() {
  try {
    const streams = await getLiveStreams();
    return NextResponse.json({ streams }, { headers: NO_CACHE });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live streams' },
      { status: 500, headers: NO_CACHE }
    );
  }
}

import { NextResponse } from 'next/server';
import { getLiveStreams } from '@/lib/db/streams';

export async function GET() {
  try {
    const streams = await getLiveStreams();
    return NextResponse.json({ streams });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live streams' },
      { status: 500 }
    );
  }
}

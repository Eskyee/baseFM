import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory viewer tracking (for real-time accuracy)
// In production, use Redis for distributed tracking
const viewers: Map<string, Set<string>> = new Map();

function getViewerId(request: NextRequest): string {
  // Use IP + User-Agent as a simple viewer identifier
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${ua.substring(0, 50)}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID required' }, { status: 400 });
    }

    const streamViewers = viewers.get(streamId);
    const count = streamViewers?.size || 0;

    return NextResponse.json({ count, streamId });
  } catch (error) {
    console.error('Viewer count error:', error);
    return NextResponse.json({ error: 'Failed to get viewer count' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { streamId, action } = await request.json();

    if (!streamId || !action) {
      return NextResponse.json({ error: 'Missing streamId or action' }, { status: 400 });
    }

    const viewerId = getViewerId(request);

    if (!viewers.has(streamId)) {
      viewers.set(streamId, new Set());
    }

    const streamViewers = viewers.get(streamId)!;

    if (action === 'join') {
      streamViewers.add(viewerId);
    } else if (action === 'leave') {
      streamViewers.delete(viewerId);
    }

    const count = streamViewers.size;

    // Update the stream's viewer count in database
    await supabase
      .from('streams')
      .update({ viewer_count: count })
      .eq('id', streamId);

    // Update peak viewers if current count is higher
    const { data: stream } = await supabase
      .from('streams')
      .select('peak_viewers')
      .eq('id', streamId)
      .single();

    if (stream && count > (stream.peak_viewers || 0)) {
      await supabase
        .from('streams')
        .update({ peak_viewers: count })
        .eq('id', streamId);
    }

    return NextResponse.json({ count, action, streamId });
  } catch (error) {
    console.error('Viewer tracking error:', error);
    return NextResponse.json({ error: 'Failed to track viewer' }, { status: 500 });
  }
}

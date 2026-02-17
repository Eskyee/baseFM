import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, createTrack, getTracks, logAgentActivity } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// POST /api/agents/[handle]/tracks - Add a track manually
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const {
      walletAddress,
      title,
      audioUrl,
      artworkUrl,
      durationMs,
      genre,
      tags,
      releaseDate,
      bpm,
      key,
      sourceUrl,
    } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    if (!title || !audioUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, audioUrl' },
        { status: 400 }
      );
    }

    // Get agent and verify ownership
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.ownerWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Create the track
    const track = await createTrack(agent.id, {
      title,
      audioUrl,
      artworkUrl,
      durationMs,
      genre,
      tags,
      releaseDate,
      bpm,
      key,
      sourcePlatform: 'manual',
      sourceUrl,
    });

    // Log activity
    await logAgentActivity(agent.id, 'track_add', {
      targetId: track.id,
      additionalData: { title, genre },
    });

    return NextResponse.json({
      track,
      message: 'Track added successfully',
    });
  } catch (error) {
    console.error('Error adding track:', error);
    const message = error instanceof Error ? error.message : 'Failed to add track';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/tracks - Get agent tracks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const featured = searchParams.get('featured') === 'true';

  try {
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const tracks = await getTracks(agent.id, { limit, offset, featured });

    return NextResponse.json({
      tracks,
      agent: {
        handle: agent.handle,
        artistName: agent.artistName,
        avatarUrl: agent.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

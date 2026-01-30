import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createServerClient();

    // Get stream details
    const { data: stream, error } = await supabase
      .from('streams')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !stream) {
      return NextResponse.json({ error: 'Show not found' }, { status: 404 });
    }

    // Check if it has a playback ID (is archived)
    if (!stream.playback_id) {
      return NextResponse.json({ error: 'Show not available' }, { status: 404 });
    }

    // Get DJ info
    const { data: dj } = await supabase
      .from('djs')
      .select('name, slug, avatar_url, bio')
      .eq('wallet_address', stream.wallet_address)
      .single();

    // Increment view count
    await supabase
      .from('streams')
      .update({ view_count: (stream.view_count || 0) + 1 })
      .eq('id', id);

    const show = {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      djName: dj?.name || `${stream.wallet_address.slice(0, 6)}...${stream.wallet_address.slice(-4)}`,
      djSlug: dj?.slug || stream.wallet_address.toLowerCase(),
      djAvatar: dj?.avatar_url || null,
      djBio: dj?.bio || null,
      playbackId: stream.playback_id,
      duration: stream.duration || 0,
      recordedAt: stream.ended_at || stream.created_at,
      genre: stream.genre,
      viewCount: (stream.view_count || 0) + 1,
    };

    return NextResponse.json({ show });
  } catch (error) {
    console.error('Archive show error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

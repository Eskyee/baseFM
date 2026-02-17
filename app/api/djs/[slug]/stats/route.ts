import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { getDJStats, isFollowingDJ } from '@/lib/db/dj-stats';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerWallet = searchParams.get('viewer');

    const supabase = createServerClient();

    // Get DJ by slug
    const { data: dj } = await supabase
      .from('djs')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    const stats = await getDJStats(dj.id);

    // Check if viewer is following this DJ
    let isFollowing = false;
    if (viewerWallet) {
      isFollowing = await isFollowingDJ(dj.id, viewerWallet);
    }

    return NextResponse.json({ stats, isFollowing });
  } catch (error) {
    console.error('Error fetching DJ stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

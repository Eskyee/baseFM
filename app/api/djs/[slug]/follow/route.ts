import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { followDJ, unfollowDJ, isFollowingDJ } from '@/lib/db/dj-stats';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ isFollowing: false });
    }

    const supabase = createServerClient();
    const { data: dj } = await supabase
      .from('djs')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    const isFollowing = await isFollowingDJ(dj.id, wallet);
    return NextResponse.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ isFollowing: false });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: dj } = await supabase
      .from('djs')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    await followDJ(dj.id, walletAddress);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error following DJ:', error);
    return NextResponse.json(
      { error: 'Failed to follow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: dj } = await supabase
      .from('djs')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    await unfollowDJ(dj.id, wallet);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing DJ:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow' },
      { status: 500 }
    );
  }
}

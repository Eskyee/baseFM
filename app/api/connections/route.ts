import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { connectionFromRow, UserConnectionRow } from '@/types/social';

// GET - Get user's connections (followers/following)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const type = searchParams.get('type') || 'following'; // 'following' or 'followers'

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const supabase = createServerClient();

    let query;
    if (type === 'followers') {
      // People following this user
      query = supabase
        .from('user_connections')
        .select('*')
        .eq('following_wallet', wallet.toLowerCase());
    } else {
      // People this user follows
      query = supabase
        .from('user_connections')
        .select('*')
        .eq('follower_wallet', wallet.toLowerCase());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    const connections = (data || []).map((row) => connectionFromRow(row as UserConnectionRow));

    // Get wallet addresses for enrichment
    const walletAddresses = connections.map((c) =>
      type === 'followers' ? c.followerWallet : c.followingWallet
    );

    // Enrich with member/DJ info
    const enriched = await enrichConnections(supabase, connections, walletAddresses, type);

    return NextResponse.json({
      connections: enriched,
      count: connections.length,
    });
  } catch (error) {
    console.error('Connections GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Follow a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followerWallet, followingWallet } = body;

    if (!followerWallet || !followingWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (followerWallet.toLowerCase() === followingWallet.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('user_connections')
      .insert({
        follower_wallet: followerWallet.toLowerCase(),
        following_wallet: followingWallet.toLowerCase(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already following' }, { status: 409 });
      }
      console.error('Failed to follow:', error);
      return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
    }

    return NextResponse.json({ connection: connectionFromRow(data as UserConnectionRow) });
  } catch (error) {
    console.error('Connections POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const followerWallet = searchParams.get('follower');
    const followingWallet = searchParams.get('following');

    if (!followerWallet || !followingWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('user_connections')
      .delete()
      .eq('follower_wallet', followerWallet.toLowerCase())
      .eq('following_wallet', followingWallet.toLowerCase());

    if (error) {
      console.error('Failed to unfollow:', error);
      return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Connections DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to enrich connections with user info
async function enrichConnections(
  supabase: ReturnType<typeof createServerClient>,
  connections: ReturnType<typeof connectionFromRow>[],
  wallets: string[],
  type: string
) {
  if (wallets.length === 0) return connections;

  // Get member info
  const { data: members } = await supabase
    .from('members')
    .select('wallet_address, display_name, avatar_url')
    .in('wallet_address', wallets.map((w) => w.toLowerCase()));

  // Get DJ info
  const { data: djs } = await supabase
    .from('djs')
    .select('wallet_address, name, avatar_url, slug')
    .in('wallet_address', wallets.map((w) => w.toLowerCase()));

  const memberMap = new Map((members || []).map((m) => [m.wallet_address, m]));
  const djMap = new Map((djs || []).map((d) => [d.wallet_address, d]));

  return connections.map((conn) => {
    const wallet = type === 'followers' ? conn.followerWallet : conn.followingWallet;
    const member = memberMap.get(wallet.toLowerCase());
    const dj = djMap.get(wallet.toLowerCase());

    return {
      ...conn,
      displayName: dj?.name || member?.display_name || null,
      avatarUrl: dj?.avatar_url || member?.avatar_url || null,
      djSlug: dj?.slug || null,
      isDj: !!dj,
    };
  });
}

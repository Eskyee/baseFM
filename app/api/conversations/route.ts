import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import {
  conversationFromRow,
  ConversationRow,
  messageFromRow,
  DirectMessageRow,
} from '@/types/social';

// GET - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const type = searchParams.get('type'); // 'dm', 'group', or null for all

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get conversation IDs user is part of
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('wallet_address', wallet.toLowerCase());

    if (partError) {
      console.error('Failed to fetch participations:', partError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    if (!participations || participations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const conversationIds = participations.map((p) => p.conversation_id);
    const lastReadMap = new Map(participations.map((p) => [p.conversation_id, p.last_read_at]));

    // Get conversations
    let query = supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: convData, error: convError } = await query;

    if (convError) {
      console.error('Failed to fetch conversations:', convError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    const conversations = (convData || []).map((row) => conversationFromRow(row as ConversationRow));

    // Get last message for each conversation
    const { data: lastMessages } = await supabase
      .from('direct_messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    // Group messages by conversation, take first (latest)
    const lastMessageMap = new Map<string, DirectMessageRow>();
    for (const msg of lastMessages || []) {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, msg as DirectMessageRow);
      }
    }

    // Get unread counts
    const unreadCounts = new Map<string, number>();
    for (const msg of lastMessages || []) {
      const lastRead = lastReadMap.get(msg.conversation_id);
      if (
        msg.sender_wallet.toLowerCase() !== wallet.toLowerCase() &&
        new Date(msg.created_at) > new Date(lastRead || 0)
      ) {
        unreadCounts.set(msg.conversation_id, (unreadCounts.get(msg.conversation_id) || 0) + 1);
      }
    }

    // Get participant info for DMs
    const otherWallets = conversations
      .filter((c) => c.type === 'dm')
      .map((c) =>
        c.participantOne?.toLowerCase() === wallet.toLowerCase()
          ? c.participantTwo
          : c.participantOne
      )
      .filter(Boolean) as string[];

    const userInfoMap = await getUserInfo(supabase, otherWallets);

    // Enrich conversations
    const enriched = conversations.map((conv) => {
      const lastMsg = lastMessageMap.get(conv.id);
      const otherWallet =
        conv.type === 'dm'
          ? conv.participantOne?.toLowerCase() === wallet.toLowerCase()
            ? conv.participantTwo
            : conv.participantOne
          : null;

      const otherUser = otherWallet ? userInfoMap.get(otherWallet.toLowerCase()) : null;

      return {
        ...conv,
        lastMessage: lastMsg ? messageFromRow(lastMsg) : null,
        unreadCount: unreadCounts.get(conv.id) || 0,
        // For DMs, use other user's info
        displayName: conv.type === 'dm' ? otherUser?.name || null : conv.name,
        displayAvatar: conv.type === 'dm' ? otherUser?.avatar || null : conv.avatarUrl,
        otherWallet: otherWallet,
        isDj: otherUser?.isDj || false,
        djSlug: otherUser?.djSlug || null,
      };
    });

    return NextResponse.json({ conversations: enriched });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new conversation (DM or Group)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, walletAddress, otherWallet, name, description, avatarUrl, privacy, memberWallets } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const supabase = createServerClient();

    if (type === 'dm') {
      // Create or get existing DM
      if (!otherWallet) {
        return NextResponse.json({ error: 'Other wallet required for DM' }, { status: 400 });
      }

      // Normalize wallet order
      const walletA = walletAddress.toLowerCase();
      const walletB = otherWallet.toLowerCase();
      const [lower, higher] = walletA < walletB ? [walletA, walletB] : [walletB, walletA];

      // Check if exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('type', 'dm')
        .eq('participant_one', lower)
        .eq('participant_two', higher)
        .single();

      if (existing) {
        return NextResponse.json({
          conversation: conversationFromRow(existing as ConversationRow),
          created: false,
        });
      }

      // Create new DM
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'dm',
          participant_one: lower,
          participant_two: higher,
        })
        .select()
        .single();

      if (convError) {
        console.error('Failed to create DM:', convError);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      // Add participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: conv.id, wallet_address: walletA },
        { conversation_id: conv.id, wallet_address: walletB },
      ]);

      return NextResponse.json({
        conversation: conversationFromRow(conv as ConversationRow),
        created: true,
      });
    } else if (type === 'group') {
      // Create group chat
      if (!name) {
        return NextResponse.json({ error: 'Group name required' }, { status: 400 });
      }

      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'group',
          name,
          description: description || null,
          avatar_url: avatarUrl || null,
          owner_wallet: walletAddress.toLowerCase(),
          privacy: privacy || 'private',
        })
        .select()
        .single();

      if (convError) {
        console.error('Failed to create group:', convError);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
      }

      // Add owner as participant
      const participants = [
        { conversation_id: conv.id, wallet_address: walletAddress.toLowerCase(), role: 'owner' },
      ];

      // Add other members if provided
      if (memberWallets && Array.isArray(memberWallets)) {
        for (const w of memberWallets) {
          if (w.toLowerCase() !== walletAddress.toLowerCase()) {
            participants.push({
              conversation_id: conv.id,
              wallet_address: w.toLowerCase(),
              role: 'member',
            });
          }
        }
      }

      await supabase.from('conversation_participants').insert(participants);

      return NextResponse.json({
        conversation: conversationFromRow(conv as ConversationRow),
        created: true,
      });
    }

    return NextResponse.json({ error: 'Invalid conversation type' }, { status: 400 });
  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to get user info from members/djs
async function getUserInfo(supabase: ReturnType<typeof createServerClient>, wallets: string[]) {
  if (wallets.length === 0) return new Map();

  const lowerWallets = wallets.map((w) => w.toLowerCase());

  const { data: members } = await supabase
    .from('members')
    .select('wallet_address, display_name, avatar_url')
    .in('wallet_address', lowerWallets);

  const { data: djs } = await supabase
    .from('djs')
    .select('wallet_address, name, avatar_url, slug')
    .in('wallet_address', lowerWallets);

  const map = new Map<string, { name: string | null; avatar: string | null; isDj: boolean; djSlug: string | null }>();

  for (const m of members || []) {
    map.set(m.wallet_address, {
      name: m.display_name,
      avatar: m.avatar_url,
      isDj: false,
      djSlug: null,
    });
  }

  // DJs override members
  for (const d of djs || []) {
    map.set(d.wallet_address, {
      name: d.name,
      avatar: d.avatar_url,
      isDj: true,
      djSlug: d.slug,
    });
  }

  return map;
}

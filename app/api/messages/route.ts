import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { messageFromRow, DirectMessageRow } from '@/types/social';

// GET - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const wallet = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // For pagination

    if (!conversationId || !wallet) {
      return NextResponse.json({ error: 'Conversation ID and wallet required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    // Get messages
    let query = supabase
      .from('direct_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    const messages = (data || []).map((row) => messageFromRow(row as DirectMessageRow));

    // Get sender info
    const senderWallets = Array.from(new Set(messages.map((m) => m.senderWallet.toLowerCase())));
    const senderInfo = await getSenderInfo(supabase, senderWallets);

    // Enrich messages
    const enriched = messages.map((msg) => {
      const info = senderInfo.get(msg.senderWallet.toLowerCase());
      return {
        ...msg,
        senderName: info?.name || null,
        senderAvatar: info?.avatar || null,
      };
    });

    // Update last_read_at for this user
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('wallet_address', wallet.toLowerCase());

    // Reverse to get chronological order
    return NextResponse.json({ messages: enriched.reverse() });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderWallet, content, replyToId } = body;

    if (!conversationId || !senderWallet || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('wallet_address', senderWallet.toLowerCase())
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    // Insert message
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        conversation_id: conversationId,
        sender_wallet: senderWallet.toLowerCase(),
        content: content.trim(),
        reply_to_id: replyToId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to send message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Update sender's last_read_at
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('wallet_address', senderWallet.toLowerCase());

    const message = messageFromRow(data as DirectMessageRow);

    // Get sender info
    const senderInfo = await getSenderInfo(supabase, [senderWallet.toLowerCase()]);
    const info = senderInfo.get(senderWallet.toLowerCase());

    return NextResponse.json({
      message: {
        ...message,
        senderName: info?.name || null,
        senderAvatar: info?.avatar || null,
      },
    });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Edit a message
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, senderWallet, content } = body;

    if (!messageId || !senderWallet || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('direct_messages')
      .select('sender_wallet')
      .eq('id', messageId)
      .single();

    if (!existing || existing.sender_wallet.toLowerCase() !== senderWallet.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Update message
    const { data, error } = await supabase
      .from('direct_messages')
      .update({
        content: content.trim(),
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Failed to edit message:', error);
      return NextResponse.json({ error: 'Failed to edit message' }, { status: 500 });
    }

    return NextResponse.json({ message: messageFromRow(data as DirectMessageRow) });
  } catch (error) {
    console.error('Messages PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a message (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');
    const senderWallet = searchParams.get('wallet');

    if (!messageId || !senderWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('direct_messages')
      .select('sender_wallet')
      .eq('id', messageId)
      .single();

    if (!existing || existing.sender_wallet.toLowerCase() !== senderWallet.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Soft delete
    const { error } = await supabase
      .from('direct_messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) {
      console.error('Failed to delete message:', error);
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Messages DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to get sender info
async function getSenderInfo(supabase: ReturnType<typeof createServerClient>, wallets: string[]) {
  if (wallets.length === 0) return new Map();

  const { data: members } = await supabase
    .from('members')
    .select('wallet_address, display_name, avatar_url')
    .in('wallet_address', wallets);

  const { data: djs } = await supabase
    .from('djs')
    .select('wallet_address, name, avatar_url')
    .in('wallet_address', wallets);

  const map = new Map<string, { name: string | null; avatar: string | null }>();

  for (const m of members || []) {
    map.set(m.wallet_address, { name: m.display_name, avatar: m.avatar_url });
  }

  for (const d of djs || []) {
    map.set(d.wallet_address, { name: d.name, avatar: d.avatar_url });
  }

  return map;
}

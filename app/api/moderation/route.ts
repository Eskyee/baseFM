import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// POST - Moderation actions (delete message, ban user, timeout)
export async function POST(request: NextRequest) {
  try {
    const { action, streamId, messageId, targetWallet, moderatorWallet, duration } = await request.json();

    if (!action || !streamId || !moderatorWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify moderator is the stream owner (DJ)
    const { data: stream } = await supabase
      .from('streams')
      .select('dj_id, djs(wallet_address)')
      .eq('id', streamId)
      .single();

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const djs = stream.djs as unknown as { wallet_address: string } | { wallet_address: string }[] | null;
    const djWallet = Array.isArray(djs) ? djs[0]?.wallet_address : djs?.wallet_address;
    if (djWallet?.toLowerCase() !== moderatorWallet.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized to moderate' }, { status: 403 });
    }

    switch (action) {
      case 'delete': {
        // Delete a specific message
        if (!messageId) {
          return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_messages')
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', messageId)
          .eq('stream_id', streamId);

        if (error) throw error;

        return NextResponse.json({ success: true, action: 'deleted', messageId });
      }

      case 'timeout': {
        // Timeout a user for specified duration
        if (!targetWallet || !duration) {
          return NextResponse.json({ error: 'Target wallet and duration required' }, { status: 400 });
        }

        const timeoutUntil = new Date(Date.now() + duration * 1000).toISOString();

        const { error } = await supabase
          .from('chat_bans')
          .upsert({
            stream_id: streamId,
            wallet_address: targetWallet.toLowerCase(),
            banned_by: moderatorWallet.toLowerCase(),
            type: 'timeout',
            expires_at: timeoutUntil,
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'stream_id,wallet_address',
          });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          action: 'timeout',
          targetWallet,
          expiresAt: timeoutUntil
        });
      }

      case 'ban': {
        // Permanently ban a user from this stream's chat
        if (!targetWallet) {
          return NextResponse.json({ error: 'Target wallet required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_bans')
          .upsert({
            stream_id: streamId,
            wallet_address: targetWallet.toLowerCase(),
            banned_by: moderatorWallet.toLowerCase(),
            type: 'ban',
            expires_at: null,
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'stream_id,wallet_address',
          });

        if (error) throw error;

        return NextResponse.json({ success: true, action: 'banned', targetWallet });
      }

      case 'unban': {
        // Remove a ban/timeout
        if (!targetWallet) {
          return NextResponse.json({ error: 'Target wallet required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('chat_bans')
          .delete()
          .eq('stream_id', streamId)
          .eq('wallet_address', targetWallet.toLowerCase());

        if (error) throw error;

        return NextResponse.json({ success: true, action: 'unbanned', targetWallet });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ error: 'Moderation action failed' }, { status: 500 });
  }
}

// GET - Check if a user is banned/timed out
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const wallet = searchParams.get('wallet');

    if (!streamId || !wallet) {
      return NextResponse.json({ error: 'Stream ID and wallet required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: ban } = await supabase
      .from('chat_bans')
      .select('*')
      .eq('stream_id', streamId)
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    if (!ban) {
      return NextResponse.json({ banned: false });
    }

    // Check if timeout has expired
    if (ban.type === 'timeout' && ban.expires_at) {
      if (new Date(ban.expires_at) < new Date()) {
        // Timeout expired, delete it
        await supabase
          .from('chat_bans')
          .delete()
          .eq('id', ban.id);

        return NextResponse.json({ banned: false });
      }
    }

    return NextResponse.json({
      banned: true,
      type: ban.type,
      expiresAt: ban.expires_at,
    });
  } catch (error) {
    console.error('Ban check error:', error);
    return NextResponse.json({ error: 'Failed to check ban status' }, { status: 500 });
  }
}

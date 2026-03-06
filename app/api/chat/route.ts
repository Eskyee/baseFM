import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { chatMessageFromRow, ChatMessageRow } from '@/types/chat';
import { isValidWalletAddress, isValidUUID, validatePagination } from '@/lib/validation';
import { sanitizeChatMessage, sanitizeDisplayName } from '@/lib/validation/sanitize';

// Rate limiting configuration
const RATE_LIMIT = 10; // Max messages per window
const RATE_LIMIT_WINDOW_SECONDS = 60; // Window duration in seconds

/**
 * Distributed rate limiting using Supabase
 * Works across all serverless instances
 */
async function checkRateLimit(walletAddress: string): Promise<boolean> {
  const supabase = createServerClient();

  try {
    // Use the database function for atomic rate limit checking
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: walletAddress.toLowerCase(),
      p_context: 'chat',
      p_max_requests: RATE_LIMIT,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (error) {
      // If rate limit check fails, log but allow the request
      // This prevents rate limiting from breaking chat entirely
      console.error('Rate limit check failed:', error.message);
      return true;
    }

    return data === true;
  } catch (err) {
    console.error('Rate limit error:', err);
    // Fail open - allow request if rate limiting is broken
    return true;
  }
}

// GET - Fetch recent messages for a stream
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const { limit } = validatePagination(searchParams.get('limit'), null, 100, 50);

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID required' }, { status: 400 });
    }

    // Validate stream ID format
    if (!isValidUUID(streamId)) {
      return NextResponse.json({ error: 'Invalid stream ID format' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch chat:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    const messages = (data || []).map((row) => chatMessageFromRow(row as ChatMessageRow));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { streamId, walletAddress, message, senderName, senderAvatar, isDj } = body;

    if (!streamId || !walletAddress || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate input formats
    if (!isValidUUID(streamId)) {
      return NextResponse.json({ error: 'Invalid stream ID format' }, { status: 400 });
    }
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // Validate message length (before sanitization to prevent bypass)
    if (typeof message !== 'string' || message.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 chars)' }, { status: 400 });
    }

    // Comprehensive XSS sanitization using dedicated utility
    const sanitizedMessage = sanitizeChatMessage(message, 500);
    if (!sanitizedMessage) {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }

    const sanitizedName = senderName ? sanitizeDisplayName(senderName, 50) : null;

    // Distributed rate limiting via Supabase
    const withinLimit = await checkRateLimit(walletAddress);
    if (!withinLimit) {
      return NextResponse.json({ error: 'Too many messages. Please wait.' }, { status: 429 });
    }

    const supabase = createServerClient();

    // Insert message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        stream_id: streamId,
        wallet_address: walletAddress.toLowerCase(),
        message: sanitizedMessage,
        sender_name: sanitizedName,
        sender_avatar: senderAvatar || null,
        is_dj: isDj || false,
        is_mod: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to send message:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message: chatMessageFromRow(data as ChatMessageRow) });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

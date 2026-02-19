import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { chatMessageFromRow, ChatMessageRow } from '@/types/chat';

// Rate limiting: max messages per wallet per minute
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Periodically clean up expired entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

function checkRateLimit(walletAddress: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(walletAddress);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(walletAddress, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

// GET - Fetch recent messages for a stream
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID required' }, { status: 400 });
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

    // Validate message length
    if (message.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 chars)' }, { status: 400 });
    }

    // Basic XSS protection: strip HTML tags and sanitize
    const sanitizedMessage = message
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    const sanitizedName = senderName 
      ? senderName.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 50)
      : null;

    // Rate limiting
    if (!checkRateLimit(walletAddress)) {
      return NextResponse.json({ error: 'Too many messages. Please wait.' }, { status: 429 });
    }

    const supabase = createServerClient();

    // Insert message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        stream_id: streamId,
        wallet_address: walletAddress,
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

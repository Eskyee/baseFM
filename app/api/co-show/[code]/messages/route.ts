import { NextRequest, NextResponse } from 'next/server';
import { getCoShowByInviteCode, getCoShowMessages, saveCoShowMessage } from '@/lib/db/co-show';
import type { CoShowMessageType } from '@/types/co-show';

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const coShow = await getCoShowByInviteCode(params.code);
    if (!coShow) {
      return NextResponse.json({ error: 'Co-show not found' }, { status: 404 });
    }

    const messages = await getCoShowMessages(coShow.id, 50);
    // Return oldest-first for display
    return NextResponse.json({
      coShowId: coShow.id,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error('Error getting co-show messages:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const coShow = await getCoShowByInviteCode(params.code);
    if (!coShow) {
      return NextResponse.json({ error: 'Co-show not found' }, { status: 404 });
    }

    const body = await request.json();
    const { senderWallet, senderName, content, messageType } = body;

    if (!senderWallet || !senderName || !content) {
      return NextResponse.json(
        { error: 'senderWallet, senderName, and content are required' },
        { status: 400 }
      );
    }

    const message = await saveCoShowMessage({
      coShowId: coShow.id,
      senderWallet,
      senderName,
      content,
      messageType: (messageType || 'listener') as CoShowMessageType,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error saving co-show message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

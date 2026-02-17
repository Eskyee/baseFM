import { NextRequest, NextResponse } from 'next/server';
import { getThreadById, deleteThread, getThreadReplies } from '@/lib/db/threads';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerWallet = searchParams.get('viewer');
    const includeReplies = searchParams.get('replies') === 'true';

    const thread = await getThreadById(params.id, viewerWallet || undefined);

    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    let replies: Awaited<ReturnType<typeof getThreadReplies>> = [];
    if (includeReplies) {
      replies = await getThreadReplies(params.id, viewerWallet || undefined);
    }

    return NextResponse.json({ thread, replies });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    await deleteThread(params.id, walletAddress);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}

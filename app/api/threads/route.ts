import { NextRequest, NextResponse } from 'next/server';
import { getThreads, createThread } from '@/lib/db/threads';
import { checkERC20Balance } from '@/lib/token/tokenGate';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const parentId = searchParams.get('parentId');
    const authorWallet = searchParams.get('author');
    const viewerWallet = searchParams.get('viewer');

    const { threads, total } = await getThreads({
      limit,
      offset,
      parentId: parentId === 'null' ? null : parentId || null,
      authorWallet: authorWallet || undefined,
      viewerWallet: viewerWallet || undefined,
    });

    return NextResponse.json({ threads, total });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorWallet, content, mediaUrls, parentId, repostId } = body;

    // Validation
    if (!authorWallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content required' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Content must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Token gate check
    const tokenCheck = await checkERC20Balance(
      DJ_TOKEN_CONFIG.address,
      authorWallet,
      DJ_TOKEN_CONFIG.requiredAmount
    );

    if (!tokenCheck.hasAccess) {
      return NextResponse.json(
        {
          error: 'Token gate',
          details: `Requires ${DJ_TOKEN_CONFIG.requiredAmount.toLocaleString()} ${DJ_TOKEN_CONFIG.symbol}`,
        },
        { status: 403 }
      );
    }

    const thread = await createThread({
      authorWallet,
      content: content.trim(),
      mediaUrls: mediaUrls || [],
      parentId,
      repostId,
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}

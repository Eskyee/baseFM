import { NextRequest, NextResponse } from 'next/server';
import { likeThread, unlikeThread } from '@/lib/db/threads';
import { checkERC20Balance } from '@/lib/token/tokenGate';
import { DJ_TOKEN_CONFIG } from '@/lib/token/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Token gate check
    const tokenCheck = await checkERC20Balance(
      DJ_TOKEN_CONFIG.address,
      walletAddress,
      DJ_TOKEN_CONFIG.requiredAmount
    );

    if (!tokenCheck.hasAccess) {
      return NextResponse.json(
        { error: 'Token gate', details: 'Requires RAVE tokens' },
        { status: 403 }
      );
    }

    await likeThread(params.id, walletAddress);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error liking thread:', error);
    return NextResponse.json(
      { error: 'Failed to like thread' },
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

    await unlikeThread(params.id, walletAddress);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unliking thread:', error);
    return NextResponse.json(
      { error: 'Failed to unlike thread' },
      { status: 500 }
    );
  }
}

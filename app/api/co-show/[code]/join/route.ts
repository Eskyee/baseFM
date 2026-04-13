import { NextRequest, NextResponse } from 'next/server';
import { getCoShowByInviteCode, claimCoShow } from '@/lib/db/co-show';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body = await request.json();
    const { walletAddress, djName } = body;

    if (!walletAddress || !djName) {
      return NextResponse.json(
        { error: 'walletAddress and djName are required' },
        { status: 400 }
      );
    }

    const coShow = await getCoShowByInviteCode(params.code);

    if (!coShow) {
      return NextResponse.json({ error: 'Co-show not found' }, { status: 404 });
    }

    // Check expiry
    if (new Date(coShow.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This invite has expired' }, { status: 410 });
    }

    // Must be pending
    if (coShow.status !== 'pending') {
      return NextResponse.json(
        { error: 'This co-show has already been claimed' },
        { status: 409 }
      );
    }

    // Cannot be same wallet as host
    if (walletAddress.toLowerCase() === coShow.hostWallet.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot join your own co-show' },
        { status: 400 }
      );
    }

    const updated = await claimCoShow(coShow.id, walletAddress, djName);

    return NextResponse.json({ coShow: updated });
  } catch (error) {
    console.error('Error joining co-show:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to join co-show: ${msg}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { type Address, type Hash } from 'viem';
import { getStreamById } from '@/lib/db/streams';
import { getBillingPricing, getPlatformWalletAddress } from '@/lib/billing/config';
import { getStreamBillingSummary, recordStreamSessionPayment } from '@/lib/db/billing';
import { verifyUsdcTransfer } from '@/lib/onchain/verify-transaction';
import { isValidTxHash, isValidWalletAddress } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await getStreamById(params.id);
    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const summary = await getStreamBillingSummary(stream);
    return NextResponse.json({ billing: summary });
  } catch (error) {
    console.error('Error fetching stream billing summary:', error);
    // Surface the underlying reason so DJs (and we) can see the cause in
    // DevTools instead of a generic 500. getStreamBillingSummary itself
    // degrades gracefully now, so reaching here means an unexpected throw.
    const reason = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch billing summary',
        reason,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await getStreamById(params.id);
    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const body = await request.json();
    const { walletAddress, txHash } = body;

    if (!walletAddress || !txHash) {
      return NextResponse.json({ error: 'walletAddress and txHash are required' }, { status: 400 });
    }

    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    if (!isValidTxHash(txHash)) {
      return NextResponse.json({ error: 'Invalid transaction hash format' }, { status: 400 });
    }

    if (walletAddress.toLowerCase() !== stream.djWalletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const platformWallet = getPlatformWalletAddress();
    if (!platformWallet) {
      return NextResponse.json({ error: 'Platform wallet not configured' }, { status: 503 });
    }

    const pricing = getBillingPricing();
    const verification = await verifyUsdcTransfer(
      txHash as Hash,
      platformWallet as Address,
      pricing.streamSessionFeeUsdc,
      walletAddress.toLowerCase() as Address
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: `Stream session payment verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    const session = await recordStreamSessionPayment({
      streamId: params.id,
      djWalletAddress: walletAddress,
      txHash,
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error recording stream session payment:', error);
    return NextResponse.json({ error: 'Failed to record stream session payment' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { type Address, type Hash } from 'viem';
import { getStreamById } from '@/lib/db/streams';
import { getPlatformWalletAddress } from '@/lib/billing/config';
import { getStreamBillingSession, settleStreamMeteredFee } from '@/lib/db/billing';
import { verifyUsdcTransfer } from '@/lib/onchain/verify-transaction';
import { isValidTxHash, isValidWalletAddress } from '@/lib/validation';

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

    const billingSession = await getStreamBillingSession(params.id);
    if (!billingSession) {
      return NextResponse.json({ error: 'No billing session found for stream' }, { status: 400 });
    }

    if (billingSession.meteredFeeUsdc <= 0) {
      const settled = await settleStreamMeteredFee({ streamId: params.id, txHash });
      return NextResponse.json({ session: settled, waived: true });
    }

    const platformWallet = getPlatformWalletAddress();
    if (!platformWallet) {
      return NextResponse.json({ error: 'Platform wallet not configured' }, { status: 503 });
    }

    const verification = await verifyUsdcTransfer(
      txHash as Hash,
      platformWallet as Address,
      billingSession.meteredFeeUsdc,
      walletAddress.toLowerCase() as Address
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: `Metered fee verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    const session = await settleStreamMeteredFee({ streamId: params.id, txHash });
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error settling stream metered fee:', error);
    return NextResponse.json({ error: 'Failed to settle stream metered fee' }, { status: 500 });
  }
}

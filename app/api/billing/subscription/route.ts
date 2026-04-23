import { NextRequest, NextResponse } from 'next/server';
import { type Address, type Hash } from 'viem';
import { getBillingPricing, getPlatformWalletAddress } from '@/lib/billing/config';
import { recordSubscriptionPayment } from '@/lib/db/billing';
import { verifyUsdcTransfer } from '@/lib/onchain/verify-transaction';
import { isValidTxHash, isValidWalletAddress } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, txHash, months } = body;

    if (!walletAddress || !txHash) {
      return NextResponse.json({ error: 'walletAddress and txHash are required' }, { status: 400 });
    }

    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    if (!isValidTxHash(txHash)) {
      return NextResponse.json({ error: 'Invalid transaction hash format' }, { status: 400 });
    }

    const platformWallet = getPlatformWalletAddress();
    if (!platformWallet) {
      return NextResponse.json({ error: 'Platform wallet not configured' }, { status: 503 });
    }

    const pricing = getBillingPricing();
    const billingMonths = Math.max(Number(months) || 1, 1);
    const expectedAmount = pricing.monthlySubscriptionFeeUsdc * billingMonths;

    const verification = await verifyUsdcTransfer(
      txHash as Hash,
      platformWallet as Address,
      expectedAmount,
      walletAddress.toLowerCase() as Address
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: `Subscription payment verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    const subscription = await recordSubscriptionPayment({
      walletAddress,
      txHash,
      months: billingMonths,
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Subscription billing error:', error);
    return NextResponse.json({ error: 'Failed to record subscription payment' }, { status: 500 });
  }
}

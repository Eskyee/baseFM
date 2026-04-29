// app/api/headliner-codes/redeem/route.ts
//
// Public redeem endpoint. The user proves wallet ownership with a signed
// message — same pattern as /api/streams/[id]/stop. Once redeemed, the
// wallet has free DJ access for `duration_days` (default 30).

import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { redeemCode } from '@/lib/billing/headliner-codes';

const SIG_MAX_AGE_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code, walletAddress, signature, message, timestamp } = body as {
    code?: string;
    walletAddress?: string;
    signature?: `0x${string}`;
    message?: string;
    timestamp?: string;
  };

  if (!code || !walletAddress || !signature || !message || !timestamp) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const ts = Date.parse(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > SIG_MAX_AGE_MS) {
    return NextResponse.json({ error: 'Stale or invalid timestamp' }, { status: 401 });
  }

  // Message must mention both the code and the wallet to prevent replays.
  if (!message.includes(code) || !message.toLowerCase().includes(walletAddress.toLowerCase())) {
    return NextResponse.json({ error: 'Message does not bind code+wallet' }, { status: 400 });
  }

  const validSig = await verifyMessage({
    address: walletAddress as `0x${string}`,
    message,
    signature,
  });
  if (!validSig) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const result = await redeemCode(code, walletAddress);
  if (!result.ok) {
    const status =
      result.reason === 'not-found' ? 404 :
      result.reason === 'revoked' || result.reason === 'expired' || result.reason === 'exhausted' ? 410 :
      result.reason === 'already-redeemed' ? 409 :
      result.reason === 'invalid-input' ? 400 : 500;
    return NextResponse.json({ error: result.message, reason: result.reason }, { status });
  }

  return NextResponse.json({
    ok: true,
    accessEndsAt: result.redemption.accessEndsAt,
    durationDays: result.code.durationDays,
  });
}

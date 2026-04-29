// app/api/admin/headliner-codes/route.ts
//
// Admin-only API for issuing & listing headliner invite codes.
// Auth: requires a signed message from an admin wallet (ADMIN_WALLET_ADDRESS env).
//
// POST /api/admin/headliner-codes
//   body: { adminWallet, signature, message, nonce, timestamp,
//           code?, notes?, maxRedemptions?, durationDays?, expiresAt? }
//
// GET  /api/admin/headliner-codes
//   query: ?adminWallet=0x...&signature=...&message=...&nonce=...&timestamp=...
//   returns: { codes: HeadlinerCode[] }

import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import {
  issueCode,
  listCodes,
  revokeCode,
  isAdminWallet,
} from '@/lib/billing/headliner-codes';

const SIG_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

interface AuthInput {
  adminWallet?: string;
  signature?: `0x${string}`;
  message?: string;
  timestamp?: string;
}

async function authenticate(input: AuthInput): Promise<{ ok: true; wallet: string } | { ok: false; status: number; error: string }> {
  const { adminWallet, signature, message, timestamp } = input;

  if (!adminWallet || !signature || !message || !timestamp) {
    return { ok: false, status: 400, error: 'Missing auth fields' };
  }
  if (!isAdminWallet(adminWallet)) {
    return { ok: false, status: 403, error: 'Not an admin wallet' };
  }
  const ts = Date.parse(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > SIG_MAX_AGE_MS) {
    return { ok: false, status: 401, error: 'Stale or invalid timestamp' };
  }

  const valid = await verifyMessage({
    address: adminWallet as `0x${string}`,
    message,
    signature,
  });
  if (!valid) return { ok: false, status: 401, error: 'Invalid signature' };

  return { ok: true, wallet: adminWallet.toLowerCase() };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const auth = await authenticate(body);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Action: issue OR revoke
  if (body.action === 'revoke') {
    if (!body.codeId) return NextResponse.json({ error: 'codeId required' }, { status: 400 });
    try {
      await revokeCode(body.codeId);
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  // Default action: issue
  try {
    const code = await issueCode({
      issuedBy: auth.wallet,
      code: body.code,
      notes: body.notes,
      maxRedemptions: body.maxRedemptions ? Number(body.maxRedemptions) : undefined,
      durationDays: body.durationDays ? Number(body.durationDays) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    return NextResponse.json({ code }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const auth = await authenticate({
    adminWallet: url.searchParams.get('adminWallet') ?? undefined,
    signature: (url.searchParams.get('signature') ?? undefined) as `0x${string}` | undefined,
    message: url.searchParams.get('message') ?? undefined,
    timestamp: url.searchParams.get('timestamp') ?? undefined,
  });
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const codes = await listCodes();
    return NextResponse.json({ codes });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

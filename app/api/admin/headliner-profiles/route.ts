// app/api/admin/headliner-profiles/route.ts
//
// Admin-only API for creating, updating, and removing headliner profiles.
// Auth pattern matches /api/admin/headliner-codes — wallet signature
// against ADMIN_WALLET_ADDRESS env list.
//
// POST   /api/admin/headliner-profiles  — upsert a profile
// DELETE /api/admin/headliner-profiles  — delete by slug or id

import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { isAdminWallet } from '@/lib/billing/headliner-codes';
import {
  upsertHeadlinerProfile,
  deleteHeadlinerProfile,
} from '@/lib/headliners/profiles';

const SIG_MAX_AGE_MS = 5 * 60 * 1000;

interface AuthInput {
  adminWallet?: string;
  signature?: `0x${string}`;
  message?: string;
  timestamp?: string;
}

async function authenticate(input: AuthInput) {
  const { adminWallet, signature, message, timestamp } = input;
  if (!adminWallet || !signature || !message || !timestamp) {
    return { ok: false as const, status: 400, error: 'Missing auth fields' };
  }
  if (!isAdminWallet(adminWallet)) {
    return { ok: false as const, status: 403, error: 'Not an admin wallet' };
  }
  const ts = Date.parse(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > SIG_MAX_AGE_MS) {
    return { ok: false as const, status: 401, error: 'Stale or invalid timestamp' };
  }
  const valid = await verifyMessage({
    address: adminWallet as `0x${string}`,
    message,
    signature,
  });
  if (!valid) return { ok: false as const, status: 401, error: 'Invalid signature' };
  return { ok: true as const, wallet: adminWallet.toLowerCase() };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const auth = await authenticate(body);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!body.slug || !body.displayName) {
    return NextResponse.json({ error: 'slug and displayName are required' }, { status: 400 });
  }

  try {
    const profile = await upsertHeadlinerProfile({
      ...body,
      createdBy: auth.wallet,
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const auth = await authenticate(body);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const target = body.slug ?? body.id;
  if (!target) return NextResponse.json({ error: 'slug or id required' }, { status: 400 });

  try {
    await deleteHeadlinerProfile(target);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

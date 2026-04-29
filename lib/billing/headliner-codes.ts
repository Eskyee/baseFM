import { createClient } from '@supabase/supabase-js';

/**
 * Headliner invite-code system.
 *
 * Admin-issued codes that grant free DJ access for a fixed duration.
 * baseFM absorbs the Mux/infra cost as a marketing expense — the headliner
 * promotes the platform, we cover the streaming cost.
 *
 * Codes can be:
 *   - single-use (max_redemptions = 1) — typical for personal invites
 *   - multi-use (max_redemptions > 1) — for campaign codes, capped
 *   - time-limited (expires_at)        — code stops working after a date
 *   - revocable (revoked_at)            — admin soft-disable any time
 *
 * Each redemption writes a row to headliner_invite_redemptions with a per-
 * wallet access_ends_at, which tokenGate.ts checks alongside RAVE / AGENTBOT
 * / USDC / Stripe rails.
 */

export interface HeadlinerCode {
  id: string;
  code: string;
  issuedBy: string;
  notes: string | null;
  maxRedemptions: number;
  redemptions: number;
  durationDays: number;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface HeadlinerRedemption {
  id: string;
  codeId: string;
  walletAddress: string;
  redeemedAt: string;
  accessEndsAt: string;
}

export type RedeemResult =
  | { ok: true; redemption: HeadlinerRedemption; code: HeadlinerCode }
  | { ok: false; reason: 'not-found' | 'revoked' | 'expired' | 'exhausted' | 'already-redeemed' | 'invalid-input' | 'db-error'; message: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function adminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role credentials missing');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

function normaliseWallet(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Generate a human-friendly code: HEADLINER-XXXX (4 uppercase alphanumeric).
 * Excludes ambiguous chars (0/O, 1/I, etc.).
 */
export function generateCode(prefix: string = 'HEADLINER'): string {
  const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${prefix}-${suffix}`;
}

/**
 * Admin-only: create a new invite code.
 *
 * @param issuedBy admin wallet creating the code (already authorised by API route)
 */
export async function issueCode(input: {
  issuedBy: string;
  code?: string;                 // optional — auto-generated if omitted
  notes?: string;
  maxRedemptions?: number;       // default 1
  durationDays?: number;         // default 30
  expiresAt?: Date;              // default no expiry
}): Promise<HeadlinerCode> {
  const code = (input.code ?? generateCode()).toUpperCase();
  const supabase = adminClient();

  const { data, error } = await supabase
    .from('headliner_invite_codes')
    .insert({
      code,
      issued_by: normaliseWallet(input.issuedBy),
      notes: input.notes ?? null,
      max_redemptions: input.maxRedemptions ?? 1,
      duration_days: input.durationDays ?? 30,
      expires_at: input.expiresAt?.toISOString() ?? null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to issue code: ${error?.message ?? 'unknown'}`);
  return mapCodeRow(data);
}

/** Admin-only: list all codes (newest first). */
export async function listCodes(limit: number = 100): Promise<HeadlinerCode[]> {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from('headliner_invite_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCodeRow);
}

/** Admin-only: revoke a code (soft disable; keeps audit trail). */
export async function revokeCode(codeId: string): Promise<void> {
  const supabase = adminClient();
  const { error } = await supabase
    .from('headliner_invite_codes')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', codeId);
  if (error) throw new Error(error.message);
}

/**
 * Public-facing redeem flow. Returns a typed Result instead of throwing so the
 * API route can map errors to the right HTTP status.
 */
export async function redeemCode(
  rawCode: string,
  walletAddress: string
): Promise<RedeemResult> {
  if (!rawCode || !walletAddress) {
    return { ok: false, reason: 'invalid-input', message: 'Code and wallet are required.' };
  }

  const code = rawCode.trim().toUpperCase();
  const wallet = normaliseWallet(walletAddress);
  const supabase = adminClient();

  // Atomic-ish redeem: read code, validate, write redemption, bump counter.
  // Real production should wrap this in a Postgres function; this is fine for
  // expected admin-issue volumes.
  const { data: row, error } = await supabase
    .from('headliner_invite_codes')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) return { ok: false, reason: 'db-error', message: error.message };
  if (!row) return { ok: false, reason: 'not-found', message: 'Code not found.' };
  if (row.revoked_at) return { ok: false, reason: 'revoked', message: 'Code has been revoked.' };
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { ok: false, reason: 'expired', message: 'Code has expired.' };
  }
  if (row.redemptions >= row.max_redemptions) {
    return { ok: false, reason: 'exhausted', message: 'Code has no redemptions left.' };
  }

  // Has this wallet already redeemed this code?
  const { data: existing } = await supabase
    .from('headliner_invite_redemptions')
    .select('id')
    .eq('code_id', row.id)
    .eq('wallet_address', wallet)
    .maybeSingle();
  if (existing) {
    return { ok: false, reason: 'already-redeemed', message: 'This wallet has already redeemed this code.' };
  }

  const accessEndsAt = new Date(Date.now() + row.duration_days * 24 * 60 * 60 * 1000);

  const { data: redemption, error: redeemErr } = await supabase
    .from('headliner_invite_redemptions')
    .insert({
      code_id: row.id,
      wallet_address: wallet,
      access_ends_at: accessEndsAt.toISOString(),
    })
    .select()
    .single();

  if (redeemErr || !redemption) {
    return { ok: false, reason: 'db-error', message: redeemErr?.message ?? 'Failed to redeem' };
  }

  // Bump counter. If this race-loses against another concurrent redeem and
  // we go over max_redemptions, the unique constraint above still prevents
  // double-grants per wallet; admin can audit the overflow.
  await supabase
    .from('headliner_invite_codes')
    .update({ redemptions: row.redemptions + 1 })
    .eq('id', row.id);

  return {
    ok: true,
    redemption: mapRedemptionRow(redemption),
    code: mapCodeRow({ ...row, redemptions: row.redemptions + 1 }),
  };
}

/**
 * Gate check — does this wallet have an unexpired headliner redemption?
 * Called from tokenGate.ts alongside the RAVE / AGENTBOT / USDC / Stripe checks.
 */
export async function hasActiveHeadlinerAccess(walletAddress: string): Promise<boolean> {
  const wallet = normaliseWallet(walletAddress);
  const supabase = adminClient();
  const { data, error } = await supabase
    .from('headliner_invite_redemptions')
    .select('id')
    .eq('wallet_address', wallet)
    .gt('access_ends_at', new Date().toISOString())
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

// ---------- helpers ----------

interface CodeRow {
  id: string;
  code: string;
  issued_by: string;
  notes: string | null;
  max_redemptions: number;
  redemptions: number;
  duration_days: number;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

interface RedemptionRow {
  id: string;
  code_id: string;
  wallet_address: string;
  redeemed_at: string;
  access_ends_at: string;
}

function mapCodeRow(r: CodeRow): HeadlinerCode {
  return {
    id: r.id,
    code: r.code,
    issuedBy: r.issued_by,
    notes: r.notes,
    maxRedemptions: r.max_redemptions,
    redemptions: r.redemptions,
    durationDays: r.duration_days,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    revokedAt: r.revoked_at,
  };
}

function mapRedemptionRow(r: RedemptionRow): HeadlinerRedemption {
  return {
    id: r.id,
    codeId: r.code_id,
    walletAddress: r.wallet_address,
    redeemedAt: r.redeemed_at,
    accessEndsAt: r.access_ends_at,
  };
}

/** Admin auth helper — list of admin wallets from env. */
export function getAdminWallets(): string[] {
  return (process.env.ADMIN_WALLET_ADDRESS ?? '')
    .split(/[\n,]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminWallet(wallet: string | undefined | null): boolean {
  if (!wallet) return false;
  return getAdminWallets().includes(wallet.trim().toLowerCase());
}

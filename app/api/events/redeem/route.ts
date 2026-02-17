import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { createServerClient } from '@/lib/supabase/client';
import type { AccessTokenRow, EventRow } from '@/types/event';

// ============================================================
// Event Redeem API
// POST — Consume/redeem access at event entry
//
// Used by door staff / QR scanner.
// Marks the access pass as used. No wallet interaction at the door.
//
// UX Copy Rules:
//   ✅ "Welcome" / "Access valid"
//   ❌ No transaction signing, no gas, no wallet popups
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, eventId } = body as {
      wallet?: string;
      eventId?: string;
    };

    // ---- Validate inputs ----
    if (!wallet || !eventId) {
      return NextResponse.json(
        { error: 'wallet and eventId are required' },
        { status: 400 }
      );
    }

    if (!isAddress(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    const db = createServerClient();

    // ---- Verify event exists and is active ----
    const { data: eventRow, error: eventError } = await db
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single<EventRow>();

    if (eventError || !eventRow) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (eventRow.status !== 'active') {
      return NextResponse.json(
        { error: 'This event is not currently active' },
        { status: 400 }
      );
    }

    // ---- Find the access pass ----
    const { data: accessRow, error: accessError } = await db
      .from('access_tokens')
      .select('*')
      .eq('event_id', eventId)
      .eq('wallet', wallet.toLowerCase())
      .single<AccessTokenRow>();

    if (accessError || !accessRow) {
      // UX: "Access not found" — not "Token not found"
      return NextResponse.json(
        { valid: false, message: 'Access not found' },
        { status: 404 }
      );
    }

    // ---- Check if already consumed ----
    if (accessRow.consumed) {
      return NextResponse.json(
        { valid: false, message: 'This pass has already been used' },
        { status: 400 }
      );
    }

    // ---- Check expiry ----
    const now = Math.floor(Date.now() / 1000);
    if (accessRow.expires_at && accessRow.expires_at < now) {
      return NextResponse.json(
        { valid: false, message: 'This pass has expired' },
        { status: 400 }
      );
    }

    // ---- Consume the access pass ----
    const { error: updateError } = await db
      .from('access_tokens')
      .update({
        consumed: true,
        consumed_at: new Date().toISOString(),
      })
      .eq('id', accessRow.id);

    if (updateError) {
      console.error('Failed to consume access:', updateError);
      return NextResponse.json(
        { error: 'Failed to process entry' },
        { status: 500 }
      );
    }

    // UX-safe response for door staff / scanner
    return NextResponse.json({
      valid: true,
      message: 'Welcome',
      event: eventRow.name,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Event redeem error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

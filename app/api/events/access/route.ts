import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { createServerClient } from '@/lib/supabase/client';
import { isValidEventAccess } from '@/lib/onchain/gating';
import type { AccessTokenRow, EventRow } from '@/types/event';

// ============================================================
// Event Access API
// POST — Issue access (mint access pass for event)
// GET  — Check access status (does wallet have valid access?)
//
// UX Copy Rules:
//   ✅ Access, Pass, Entry, Confirmed
//   ❌ NFT, Token, Mint, Blockchain, Gas, Transaction
// ============================================================

/**
 * GET /api/events/access?wallet=0x...&eventId=abc
 * Check if a wallet has valid access for an event.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    const eventId = searchParams.get('eventId');

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

    // Check database for access token
    const { data: accessRow, error: dbError } = await db
      .from('access_tokens')
      .select('*')
      .eq('event_id', eventId)
      .eq('wallet', wallet.toLowerCase())
      .single<AccessTokenRow>();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = no rows — that's fine, means no access
      console.error('DB error checking access:', dbError);
      return NextResponse.json(
        { error: 'Failed to check access status' },
        { status: 500 }
      );
    }

    // Also check onchain if the event has a contract
    const { data: eventRow } = await db
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single<EventRow>();

    let onchainValid = false;
    if (eventRow?.nft_contract) {
      try {
        onchainValid = await isValidEventAccess(
          wallet as `0x${string}`,
          eventId
        );
      } catch {
        // Onchain check failed — fall back to DB only
      }
    }

    const hasAccess = !!(accessRow && !accessRow.consumed) || onchainValid;
    const isConsumed = accessRow?.consumed ?? false;
    const isExpired = accessRow?.expires_at
      ? accessRow.expires_at < Math.floor(Date.now() / 1000)
      : false;

    return NextResponse.json({
      hasAccess: hasAccess && !isExpired,
      consumed: isConsumed,
      expired: isExpired,
      // User-facing status
      status: isConsumed
        ? 'used'
        : isExpired
          ? 'expired'
          : hasAccess
            ? 'confirmed'
            : 'none',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Event access check error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/events/access
 * Issue access for a wallet to an event.
 * Body: { wallet: string, eventId: string }
 */
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

    // ---- Load event ----
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

    // ---- Enforce event rules ----
    if (eventRow.status !== 'active') {
      return NextResponse.json(
        { error: 'This event is not currently available' },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > eventRow.end_time) {
      return NextResponse.json(
        { error: 'This event has ended' },
        { status: 400 }
      );
    }

    if (eventRow.minted >= eventRow.max_supply) {
      return NextResponse.json(
        { error: 'No more passes available for this event' },
        { status: 400 }
      );
    }

    // ---- Check for existing access ----
    const { data: existing } = await db
      .from('access_tokens')
      .select('id')
      .eq('event_id', eventId)
      .eq('wallet', wallet.toLowerCase())
      .eq('consumed', false)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have access to this event' },
        { status: 409 }
      );
    }

    // ---- Mint onchain if contract is configured ----
    let txHash: string | undefined;
    if (eventRow.nft_contract) {
      try {
        // Use Bankr to mint the access pass
        const apiKey = process.env.NEXT_PUBLIC_BANKR_API_KEY;
        const privateKey = process.env.BANKR_PRIVATE_KEY;

        if (apiKey && privateKey) {
          // NOTE: @bankr/sdk is alpha — using 'any' for dynamic import type safety
          let BankrClient: any;
          try {
            const bankrModule = await import('@bankr/sdk');
            BankrClient = bankrModule.BankrClient ?? bankrModule.default;
          } catch {
            console.warn('Bankr SDK not available, skipping onchain mint');
          }

          if (BankrClient) {
            const bankr = new BankrClient({
              apiKey,
              privateKey,
              network: 'base',
            });

            const sanitizedName = eventRow.name.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
            const result = await bankr.promptAndWait({
              prompt: `mint an NFT called ${sanitizedName} for ${wallet} on base`,
            });

            txHash = result?.txHash ?? result?.hash;
          }
        }
      } catch (mintErr) {
        console.error('Onchain mint failed:', mintErr);
        // Continue — we still issue DB access even if onchain fails
        // The onchain portion can be retried
      }
    }

    // ---- Issue access in database ----
    const accessToken: Omit<AccessTokenRow, 'id' | 'created_at' | 'consumed_at'> = {
      event_id: eventId,
      wallet: wallet.toLowerCase(),
      token_id: null,
      issued_at: now,
      expires_at: eventRow.end_time,
      consumed: false,
    };

    const { error: insertError } = await db
      .from('access_tokens')
      .insert(accessToken);

    if (insertError) {
      console.error('Failed to insert access token:', insertError);
      return NextResponse.json(
        { error: 'Failed to issue access' },
        { status: 500 }
      );
    }

    // ---- Increment minted count ----
    await db
      .from('events')
      .update({ minted: eventRow.minted + 1 })
      .eq('id', eventId);

    // ---- Log the mint ----
    if (txHash) {
      try {
        await db.from('mint_logs').insert({
          wallet: wallet.toLowerCase(),
          event_id: eventId,
          tx_hash: txHash,
          timestamp: now,
          status: 'success',
        });
      } catch {
        // Silently ignore mint log errors
      }
    }

    // UX-safe response — no crypto language
    return NextResponse.json({
      success: true,
      message: "You're in",
      status: 'confirmed',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Event access issue error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

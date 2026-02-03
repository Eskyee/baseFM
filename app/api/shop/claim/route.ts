import { NextRequest, NextResponse } from 'next/server';
import { claimPendingPerks } from '@/lib/shopify/order-processor';
import { supabase } from '@/lib/supabase/client';

// POST /api/shop/claim - Claim pending perks
export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress } = await request.json();

    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: 'Email and wallet address required' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Claim pending perks
    const results = await claimPendingPerks(email, walletAddress as `0x${string}`);

    // Count successes and failures
    const successes = results.filter((r) => r.success).length;
    const failures = results.filter((r) => !r.success).length;

    return NextResponse.json({
      claimed: successes,
      failed: failures,
      results,
    });
  } catch (error) {
    console.error('Failed to claim perks:', error);
    return NextResponse.json(
      { error: 'Failed to claim perks' },
      { status: 500 }
    );
  }
}

// GET /api/shop/claim?email=xxx&wallet=xxx - Check pending claims
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const wallet = searchParams.get('wallet');

  if (!email && !wallet) {
    return NextResponse.json(
      { error: 'Email or wallet required' },
      { status: 400 }
    );
  }

  try {
    let query = supabase
      .from('pending_claims')
      .select('*')
      .eq('status', 'pending');

    if (email) {
      query = query.eq('customer_email', email);
    }

    const { data: pendingClaims, error } = await query;

    if (error) {
      throw error;
    }

    // Also get claimed entitlements if wallet provided
    let entitlements: unknown[] = [];
    if (wallet) {
      const { data } = await supabase
        .from('onchain_entitlements')
        .select('*')
        .eq('wallet_address', wallet)
        .eq('status', 'minted');

      entitlements = data || [];
    }

    return NextResponse.json({
      pendingClaims: pendingClaims || [],
      entitlements,
    });
  } catch (error) {
    console.error('Failed to fetch claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

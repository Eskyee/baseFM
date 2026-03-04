import { NextResponse } from 'next/server';

/**
 * GET /api/trading/balances
 * Fetches trading agent balance from Bankr API
 */
export async function GET() {
  const apiKey = process.env.BANKR_API_KEY;

  if (!apiKey) {
    // Return empty balance if not configured
    return NextResponse.json({
      id: 'unconfigured',
      totalUsd: 0,
      breakdown: {},
    });
  }

  try {
    const res = await fetch('https://api.bankr.bot/balances', {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      // Don't cache - we want live data
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Bankr balances error:', res.status, await res.text());
      return NextResponse.json({
        id: 'error',
        totalUsd: 0,
        breakdown: {},
      });
    }

    const data = await res.json();

    // Transform Bankr response to our TradingBalance format
    // Bankr returns balances per chain with token details
    let totalUsd = 0;
    const breakdown: Record<string, number> = {};

    if (data.balances && Array.isArray(data.balances)) {
      for (const balance of data.balances) {
        const symbol = balance.symbol || balance.token || 'UNKNOWN';
        const usdValue = parseFloat(balance.usdValue || balance.valueUsd || '0');
        if (usdValue > 0) {
          breakdown[symbol] = (breakdown[symbol] || 0) + usdValue;
          totalUsd += usdValue;
        }
      }
    }

    return NextResponse.json({
      id: Date.now().toString(),
      totalUsd,
      breakdown,
    });
  } catch (err) {
    console.error('Failed to fetch Bankr balances:', err);
    return NextResponse.json({
      id: 'error',
      totalUsd: 0,
      breakdown: {},
    });
  }
}

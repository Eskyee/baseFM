import { NextRequest, NextResponse } from 'next/server';
import { runTradingCycle, isBankrConfigured } from '@/lib/bankr';

/**
 * GET /api/cron/trading
 *
 * Vercel Cron Job endpoint that triggers the trading agent cycle.
 * Runs every 3 minutes (configured in vercel.json).
 *
 * Security:
 *   - Protected by CRON_SECRET header (Vercel automatically adds this)
 *   - Only runs if Bankr is configured
 */
export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel adds this header automatically)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require CRON_SECRET verification
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Bankr is configured
  if (!isBankrConfigured()) {
    return NextResponse.json(
      { error: 'Bankr not configured', skipped: true },
      { status: 200 }
    );
  }

  try {
    console.log('[Cron] Starting trading cycle...');
    const result = await runTradingCycle();

    console.log('[Cron] Trading cycle complete:', {
      shouldTrade: result.decision.shouldTrade,
      txHash: result.txHash,
      balance: result.balance.totalUsd,
    });

    return NextResponse.json({
      success: true,
      decision: result.decision,
      txHash: result.txHash,
      balance: result.balance,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Trading cycle failed';
    console.error('[Cron] Trading cycle error:', message);

    return NextResponse.json(
      { error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// Vercel Cron requires this config
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 second timeout for trading operations

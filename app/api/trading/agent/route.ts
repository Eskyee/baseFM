import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import {
  runTradingCycle,
  checkBalance,
  scan,
  decide,
  analyzeToken,
  isBankrConfigured,
} from '@/lib/bankr';
import { isAdminWallet } from '@/lib/admin/config';

/**
 * POST /api/trading/agent
 *
 * Trading Agent API - Implements Bankr agent workflow
 *
 * Actions:
 *   - cycle: Run full Scan → Decide → Execute → Balance cycle
 *   - scan: Scan for trending tokens only
 *   - decide: Make trade decision from scan result
 *   - balance: Check current portfolio
 *   - analyze: Analyze a specific token
 *
 * Request body:
 *   { action: 'cycle' | 'scan' | 'decide' | 'balance' | 'analyze', wallet?: string, token?: string }
 *
 * Security:
 *   - Admin wallet required for trade-related actions
 *   - Server-side only (uses BANKR_API_KEY)
 *   - Private keys never exposed to client
 */
export async function POST(req: NextRequest) {
  // Check if Bankr is configured
  if (!isBankrConfigured()) {
    return NextResponse.json(
      { error: 'Bankr API not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { action, token, scanResponse, wallet } = body as {
      action?: string;
      token?: string;
      scanResponse?: string;
      wallet?: string;
    };

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (cycle, scan, decide, balance, analyze)' },
        { status: 400 }
      );
    }

    // Protect trade-related actions - require admin wallet
    const protectedActions = ['cycle', 'scan', 'decide', 'analyze'];
    if (protectedActions.includes(action)) {
      if (!wallet || !isAdminWallet(wallet)) {
        return NextResponse.json(
          { error: 'Admin wallet required' },
          { status: 403 }
        );
      }
    }

    switch (action) {
      case 'cycle': {
        // Full trading cycle
        const result = await runTradingCycle();
        return NextResponse.json({
          success: true,
          decision: result.decision,
          txHash: result.txHash,
          balance: result.balance,
        });
      }

      case 'scan': {
        // Scan only
        const response = await scan();
        return NextResponse.json({
          success: true,
          response,
        });
      }

      case 'decide': {
        // Make decision from provided scan response
        if (!scanResponse) {
          return NextResponse.json(
            { error: 'scanResponse is required for decide action' },
            { status: 400 }
          );
        }
        const decision = await decide(scanResponse);
        return NextResponse.json({
          success: true,
          decision,
        });
      }

      case 'balance': {
        // Check balance only
        const balance = await checkBalance();
        return NextResponse.json({
          success: true,
          balance,
        });
      }

      case 'analyze': {
        // Analyze specific token
        if (!token) {
          return NextResponse.json(
            { error: 'token is required for analyze action' },
            { status: 400 }
          );
        }
        const analysis = await analyzeToken(token);
        return NextResponse.json({
          success: true,
          token,
          analysis,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Agent action failed';
    console.error('Trading agent error:', message);

    // Log error to database
    try {
      const db = createServerClient();
      await db.from('trading_logs').insert({
        type: 'error',
        content: `API error: ${message}`,
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/trading/agent
 *
 * Get agent status and recent activity
 */
export async function GET() {
  try {
    const db = createServerClient();

    // Get recent logs
    const { data: logs } = await db
      .from('trading_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get recent trades
    const { data: trades } = await db
      .from('trading_trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get latest balance snapshot
    const { data: balance } = await db
      .from('trading_balances')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      configured: isBankrConfigured(),
      recentLogs: logs || [],
      recentTrades: trades || [],
      latestBalance: balance || null,
    });
  } catch (err) {
    console.error('Failed to get agent status:', err);
    return NextResponse.json({
      configured: isBankrConfigured(),
      recentLogs: [],
      recentTrades: [],
      latestBalance: null,
    });
  }
}

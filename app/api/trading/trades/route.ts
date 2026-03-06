import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import type { Trade } from '@/types/trading';

// Never statically pre-render — this route reads from Supabase at runtime
export const dynamic = 'force-dynamic';

/**
 * GET /api/trading/trades
 * Fetches recent trades from local database
 */
export async function GET() {
  try {
    const db = createServerClient();

    const { data, error } = await db
      .from('trading_trades')
      .select('id, status, token_in, token_out, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // Table might not exist - return empty array
      if (error.code === '42P01') {
        return NextResponse.json([]);
      }
      console.error('Failed to fetch trades:', error);
      return NextResponse.json([]);
    }

    const trades: Trade[] = (data || []).map((row) => ({
      id: row.id,
      status: row.status as Trade['status'],
      tokenIn: row.token_in,
      tokenOut: row.token_out,
      createdAt: row.created_at,
    }));

    return NextResponse.json(trades);
  } catch (err) {
    console.error('Failed to fetch trades:', err);
    return NextResponse.json([]);
  }
}

/**
 * POST /api/trading/trades
 * Records a new trade
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { status, tokenIn, tokenOut, txHash } = body;

    if (!tokenIn || !tokenOut) {
      return NextResponse.json(
        { error: 'tokenIn and tokenOut are required' },
        { status: 400 }
      );
    }

    const db = createServerClient();

    const { data, error } = await db
      .from('trading_trades')
      .insert({
        status: status || 'pending',
        token_in: tokenIn,
        token_out: tokenOut,
        tx_hash: txHash || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert trade:', error);
      return NextResponse.json({ error: 'Failed to record trade' }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
      tokenIn: data.token_in,
      tokenOut: data.token_out,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error('Failed to record trade:', err);
    return NextResponse.json({ error: 'Failed to record trade' }, { status: 500 });
  }
}

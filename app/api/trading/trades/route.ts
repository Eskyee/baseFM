import { NextRequest, NextResponse } from 'next/server';
import { getLatestTrades, createTrade, updateTrade, getTradingStats } from '@/lib/db/trading';

export const dynamic = 'force-dynamic';

// GET - Fetch recent trades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const trades = await getLatestTrades({ limit });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Trading trades GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

// POST - Create a new trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, tokenIn, tokenOut, amountIn, amountOut, status, jobId, txHash, rawResponse } = body;

    if (!agentId || !tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, tokenIn, tokenOut, amountIn' },
        { status: 400 }
      );
    }

    const trade = await createTrade({
      agentId,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      status,
      jobId,
      txHash,
      rawResponse,
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Trading trades POST error:', error);
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}

// PATCH - Update a trade
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tradeId, status, amountOut, txHash, rawResponse } = body;

    if (!tradeId) {
      return NextResponse.json({ error: 'Missing tradeId' }, { status: 400 });
    }

    const trade = await updateTrade(tradeId, {
      status,
      amountOut,
      txHash,
      rawResponse,
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Trading trades PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

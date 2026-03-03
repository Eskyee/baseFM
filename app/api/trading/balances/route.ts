import { NextRequest, NextResponse } from 'next/server';
import { getLatestBalance, createBalance } from '@/lib/db/trading';

export const dynamic = 'force-dynamic';

// GET - Fetch latest balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    const balance = await getLatestBalance(agentId || undefined);

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Trading balances GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

// POST - Create a new balance snapshot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, totalUsd, breakdown } = body;

    if (!agentId || totalUsd === undefined || !breakdown) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, totalUsd, breakdown' },
        { status: 400 }
      );
    }

    const balance = await createBalance({
      agentId,
      totalUsd,
      breakdown,
    });

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Trading balances POST error:', error);
    return NextResponse.json({ error: 'Failed to create balance' }, { status: 500 });
  }
}

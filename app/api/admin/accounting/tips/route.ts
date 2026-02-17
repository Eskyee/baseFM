import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/admin/accounting/tips - Get tips data
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';

    // Calculate date filter
    let dateFilter: Date | null = null;
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);
    }

    // Build query for tips
    let query = supabase
      .from('tips')
      .select(`
        id,
        from_wallet,
        to_wallet,
        token,
        amount,
        tx_hash,
        created_at,
        djs (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (dateFilter) {
      query = query.gte('created_at', dateFilter.toISOString());
    }

    const { data: tipsData, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching tips:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Transform data
    const tips = (tipsData || []).map((t: Record<string, unknown>) => {
      const djs = t.djs as Record<string, unknown> | null;

      return {
        id: t.id as string,
        fromWallet: t.from_wallet as string,
        toWallet: t.to_wallet as string,
        toDjName: (djs?.name as string) || 'Unknown DJ',
        token: t.token as string,
        amount: parseFloat(t.amount as string),
        txHash: t.tx_hash as string,
        createdAt: t.created_at as string,
      };
    });

    // Calculate summary (approximate USD values)
    // These are rough estimates - in production, you'd want price feeds
    const tokenPrices: Record<string, number> = {
      ETH: 3000,
      USDC: 1,
      RAVE: 0.0001,
      cbBTC: 60000,
    };

    let totalAmount = 0;
    for (const tip of tips) {
      const price = tokenPrices[tip.token] || 0;
      totalAmount += tip.amount * price;
    }

    return NextResponse.json({
      tips,
      summary: {
        totalAmount,
        totalCount: tips.length,
      },
    });
  } catch (error) {
    console.error('Error in accounting tips API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

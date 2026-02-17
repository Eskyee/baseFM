import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

// GET /api/admin/accounting/tickets - Get ticket sales data
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const dateRange = searchParams.get('dateRange') || '30d';

    // Calculate date filter
    let dateFilter: Date | null = null;
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);
    }

    // Build query for ticket purchases
    let query = supabase
      .from('ticket_purchases')
      .select(`
        id,
        ticket_id,
        event_id,
        buyer_wallet,
        quantity,
        amount_usdc,
        tx_hash,
        promoter_wallet,
        status,
        purchased_at,
        event_tickets!inner (
          name,
          events!inner (
            title
          )
        )
      `)
      .eq('status', 'confirmed')
      .order('purchased_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (dateFilter) {
      query = query.gte('purchased_at', dateFilter.toISOString());
    }

    const { data: purchases, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching ticket purchases:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Transform data
    const sales = (purchases || []).map((p: Record<string, unknown>) => {
      const eventTickets = p.event_tickets as Record<string, unknown> | null;
      const events = eventTickets?.events as Record<string, unknown> | null;

      return {
        id: p.id,
        ticketId: p.ticket_id,
        ticketName: eventTickets?.name || 'Unknown',
        eventId: p.event_id,
        eventTitle: events?.title || 'Unknown Event',
        buyerWallet: p.buyer_wallet,
        quantity: p.quantity,
        amountUsdc: parseFloat(p.amount_usdc as string),
        txHash: p.tx_hash,
        promoterWallet: p.promoter_wallet,
        status: p.status,
        purchasedAt: p.purchased_at,
      };
    });

    // Calculate summary
    const totalRevenue = sales.reduce((sum: number, s: { amountUsdc: number }) => sum + s.amountUsdc, 0);
    const totalSold = sales.reduce((sum: number, s: { quantity: number }) => sum + s.quantity, 0);

    // Event breakdown
    const eventMap = new Map<string, { eventId: string; eventTitle: string; revenue: number; ticketsSold: number; promoterWallet: string }>();
    for (const sale of sales) {
      const existing = eventMap.get(sale.eventId);
      if (existing) {
        existing.revenue += sale.amountUsdc;
        existing.ticketsSold += sale.quantity;
      } else {
        eventMap.set(sale.eventId, {
          eventId: sale.eventId,
          eventTitle: sale.eventTitle,
          revenue: sale.amountUsdc,
          ticketsSold: sale.quantity,
          promoterWallet: sale.promoterWallet,
        });
      }
    }

    return NextResponse.json({
      sales,
      summary: {
        totalRevenue,
        totalSold,
        eventBreakdown: Array.from(eventMap.values()),
      },
    });
  } catch (error) {
    console.error('Error in accounting tickets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = "force-dynamic";

// GET /api/transactions?wallet=0x...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const walletLower = wallet.toLowerCase();
    const supabase = createServerClient();

    // Fetch tips sent by this wallet
    const { data: tipsSent } = await supabase
      .from('tips')
      .select('id, amount, token, tx_hash, created_at, dj_name')
      .eq('from_wallet', walletLower)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch tips received by this wallet (if they're a DJ)
    const { data: tipsReceived } = await supabase
      .from('tips')
      .select('id, amount, token, tx_hash, created_at, from_wallet')
      .eq('to_wallet', walletLower)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch ticket purchases
    const { data: ticketPurchases } = await supabase
      .from('ticket_purchases')
      .select('id, amount_usdc, tx_hash, created_at, event_id')
      .eq('wallet_address', walletLower)
      .order('created_at', { ascending: false })
      .limit(10);

    // Combine and format transactions
    const transactions = [];

    // Add tips sent
    if (tipsSent) {
      for (const tip of tipsSent) {
        transactions.push({
          id: `tip-sent-${tip.id}`,
          type: 'tip_sent',
          amount: tip.amount,
          token: tip.token,
          txHash: tip.tx_hash,
          timestamp: tip.created_at,
          description: tip.dj_name ? `To ${tip.dj_name}` : undefined,
        });
      }
    }

    // Add tips received
    if (tipsReceived) {
      for (const tip of tipsReceived) {
        transactions.push({
          id: `tip-recv-${tip.id}`,
          type: 'tip_received',
          amount: tip.amount,
          token: tip.token,
          txHash: tip.tx_hash,
          timestamp: tip.created_at,
          counterparty: tip.from_wallet,
        });
      }
    }

    // Add ticket purchases
    if (ticketPurchases) {
      for (const purchase of ticketPurchases) {
        transactions.push({
          id: `ticket-${purchase.id}`,
          type: 'ticket_purchase',
          amount: purchase.amount_usdc,
          token: 'USDC',
          txHash: purchase.tx_hash,
          timestamp: purchase.created_at,
          description: 'Event ticket',
        });
      }
    }

    // Sort by timestamp descending
    transactions.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ transactions: transactions.slice(0, 20) });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

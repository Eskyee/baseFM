import { NextRequest, NextResponse } from 'next/server';
import { getTicketById, recordTicketPurchase, hasTicketForEvent } from '@/lib/db/tickets';

// POST /api/tickets/purchase - Record a ticket purchase after onchain payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, buyerWallet, quantity, txHash } = body;

    if (!ticketId || !buyerWallet || !txHash) {
      return NextResponse.json(
        { error: 'ticketId, buyerWallet, and txHash are required' },
        { status: 400 }
      );
    }

    // Get ticket details
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check availability
    if (!ticket.isAvailable) {
      return NextResponse.json(
        { error: 'Ticket is sold out' },
        { status: 400 }
      );
    }

    // Check if promoter wallet exists
    if (!ticket.promoterWallet) {
      return NextResponse.json(
        { error: 'Event promoter wallet not configured' },
        { status: 400 }
      );
    }

    const qty = quantity || 1;
    const totalAmount = ticket.priceUsdc * qty;

    // Record the purchase
    const purchase = await recordTicketPurchase({
      ticketId,
      eventId: ticket.eventId,
      buyerWallet: buyerWallet.toLowerCase(),
      quantity: qty,
      amountUsdc: totalAmount,
      txHash,
      promoterWallet: ticket.promoterWallet,
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Failed to record purchase' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase,
      message: `Successfully purchased ${qty} ticket(s) for ${totalAmount} USDC`,
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

// GET /api/tickets/purchase?wallet=xxx&eventId=xxx - Check if wallet has ticket
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const eventId = searchParams.get('eventId');

  if (!wallet || !eventId) {
    return NextResponse.json(
      { error: 'wallet and eventId are required' },
      { status: 400 }
    );
  }

  const { hasTicket, ticketType, eventName } = await hasTicketForEvent(wallet, eventId);
  return NextResponse.json({ hasTicket, ticketType, eventName });
}

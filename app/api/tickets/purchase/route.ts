import { NextRequest, NextResponse } from 'next/server';
import { getTicketById, recordTicketPurchase, hasTicketForEvent } from '@/lib/db/tickets';
import { isValidWalletAddress, isValidUUID, isValidTxHash } from '@/lib/validation';
import { verifyUsdcTransfer } from '@/lib/onchain/verify-transaction';
import type { Hash, Address } from 'viem';

// POST /api/tickets/purchase - Record a ticket purchase after onchain payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, buyerWallet, quantity, txHash } = body;

    // Validate required fields
    if (!ticketId || !buyerWallet || !txHash) {
      return NextResponse.json(
        { error: 'ticketId, buyerWallet, and txHash are required' },
        { status: 400 }
      );
    }

    // Validate input formats
    if (!isValidUUID(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticketId format' },
        { status: 400 }
      );
    }
    if (!isValidWalletAddress(buyerWallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }
    if (!isValidTxHash(txHash)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
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

    // Verify the transaction on-chain
    const verification = await verifyUsdcTransfer(
      txHash as Hash,
      ticket.promoterWallet as Address,
      totalAmount,
      buyerWallet.toLowerCase() as Address
    );

    if (!verification.verified) {
      console.error('Transaction verification failed:', {
        txHash,
        expectedRecipient: ticket.promoterWallet,
        expectedAmount: totalAmount,
        error: verification.error,
      });
      return NextResponse.json(
        { error: `Transaction verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    // Record the purchase with verified transaction data
    const purchaseResult = await recordTicketPurchase({
      ticketId,
      eventId: ticket.eventId,
      buyerWallet: buyerWallet.toLowerCase(),
      quantity: qty,
      amountUsdc: totalAmount,
      txHash,
      promoterWallet: ticket.promoterWallet,
    });

    if (!purchaseResult) {
      console.error('Failed to record ticket purchase:', {
        ticketId,
        eventId: ticket.eventId,
        buyerWallet: buyerWallet.toLowerCase(),
        txHash,
      });
      return NextResponse.json(
        { error: 'Failed to record purchase in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      purchase: purchaseResult,
      verification: {
        verified: true,
        blockNumber: verification.blockNumber?.toString(),
        blockTimestamp: verification.blockTimestamp,
      },
      message: `Successfully purchased ${qty} ticket(s) for ${totalAmount} USDC`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing purchase:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
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

  // Validate input formats
  if (!isValidWalletAddress(wallet)) {
    return NextResponse.json(
      { error: 'Invalid wallet address format' },
      { status: 400 }
    );
  }
  if (!isValidUUID(eventId)) {
    return NextResponse.json(
      { error: 'Invalid eventId format' },
      { status: 400 }
    );
  }

  try {
    const { hasTicket, ticketType, eventName } = await hasTicketForEvent(wallet, eventId);
    return NextResponse.json({ hasTicket, ticketType, eventName });
  } catch (error) {
    console.error('Error checking ticket ownership:', error);
    return NextResponse.json(
      { error: 'Failed to check ticket ownership' },
      { status: 500 }
    );
  }
}

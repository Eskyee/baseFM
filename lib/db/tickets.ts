import { createServerClient } from '@/lib/supabase/client';

export interface EventTicket {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  priceUsdc: number;
  totalQuantity: number | null;
  soldCount: number;
  isActive: boolean;
  salesStartAt: string | null;
  salesEndAt: string | null;
  isAvailable: boolean;
  remaining: number | null;
  promoterWallet: string | null;
  promoterName: string | null;
}

export interface TicketPurchase {
  id: string;
  ticketId: string;
  eventId: string;
  buyerWallet: string;
  quantity: number;
  amountUsdc: number;
  txHash: string;
  promoterWallet: string;
  status: 'pending' | 'confirmed' | 'refunded' | 'cancelled';
  purchasedAt: string;
}

// Get available tickets for an event
export async function getEventTickets(eventId: string): Promise<EventTicket[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('ticket_availability')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    description: row.description,
    priceUsdc: parseFloat(row.price_usdc),
    totalQuantity: row.total_quantity,
    soldCount: row.sold_count,
    isActive: row.is_active,
    salesStartAt: row.sales_start_at,
    salesEndAt: row.sales_end_at,
    isAvailable: row.is_available,
    remaining: row.remaining,
    promoterWallet: row.promoter_wallet,
    promoterName: row.promoter_name,
  }));
}

// Get ticket by ID with promoter wallet
export async function getTicketById(ticketId: string): Promise<EventTicket | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('ticket_availability')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    eventId: data.event_id,
    name: data.name,
    description: data.description,
    priceUsdc: parseFloat(data.price_usdc),
    totalQuantity: data.total_quantity,
    soldCount: data.sold_count,
    isActive: data.is_active,
    salesStartAt: data.sales_start_at,
    salesEndAt: data.sales_end_at,
    isAvailable: data.is_available,
    remaining: data.remaining,
    promoterWallet: data.promoter_wallet,
    promoterName: data.promoter_name,
  };
}

// Record a ticket purchase
export async function recordTicketPurchase(purchase: {
  ticketId: string;
  eventId: string;
  buyerWallet: string;
  quantity: number;
  amountUsdc: number;
  txHash: string;
  promoterWallet: string;
}): Promise<TicketPurchase | null> {
  const supabase = createServerClient();

  // Record the purchase
  const { data, error } = await supabase
    .from('ticket_purchases')
    .insert({
      ticket_id: purchase.ticketId,
      event_id: purchase.eventId,
      buyer_wallet: purchase.buyerWallet,
      quantity: purchase.quantity,
      amount_usdc: purchase.amountUsdc,
      tx_hash: purchase.txHash,
      promoter_wallet: purchase.promoterWallet,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording purchase:', error);
    return null;
  }

  // Increment sold count
  await supabase.rpc('increment_ticket_sold', {
    ticket_uuid: purchase.ticketId,
    qty: purchase.quantity,
  });

  return {
    id: data.id,
    ticketId: data.ticket_id,
    eventId: data.event_id,
    buyerWallet: data.buyer_wallet,
    quantity: data.quantity,
    amountUsdc: parseFloat(data.amount_usdc),
    txHash: data.tx_hash,
    promoterWallet: data.promoter_wallet,
    status: data.status,
    purchasedAt: data.purchased_at,
  };
}

// Check if wallet has ticket for event
export async function hasTicketForEvent(
  walletAddress: string,
  eventId: string
): Promise<{ hasTicket: boolean; ticketType?: string; eventName?: string }> {
  const supabase = createServerClient();

  // Get purchase with ticket and event details
  const { data, error } = await supabase
    .from('ticket_purchases')
    .select(`
      id,
      ticket_id,
      event_tickets!inner (
        name
      ),
      events!inner (
        title
      )
    `)
    .eq('buyer_wallet', walletAddress.toLowerCase())
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .limit(1);

  if (error) {
    console.error('Error checking ticket:', error);
    return { hasTicket: false };
  }

  if (!data || data.length === 0) {
    return { hasTicket: false };
  }

  // Supabase returns arrays for joined tables
  const purchase = data[0] as {
    id: string;
    ticket_id: string;
    event_tickets: { name: string }[];
    events: { title: string }[];
  };

  return {
    hasTicket: true,
    ticketType: purchase.event_tickets?.[0]?.name || 'General Admission',
    eventName: purchase.events?.[0]?.title,
  };
}

// Get purchases for a wallet
export async function getWalletPurchases(walletAddress: string): Promise<TicketPurchase[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('ticket_purchases')
    .select('*')
    .eq('buyer_wallet', walletAddress.toLowerCase())
    .order('purchased_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    ticketId: row.ticket_id,
    eventId: row.event_id,
    buyerWallet: row.buyer_wallet,
    quantity: row.quantity,
    amountUsdc: parseFloat(row.amount_usdc),
    txHash: row.tx_hash,
    promoterWallet: row.promoter_wallet,
    status: row.status,
    purchasedAt: row.purchased_at,
  }));
}

// Create a ticket for an event (for promoters)
export async function createEventTicket(ticket: {
  eventId: string;
  name: string;
  description?: string;
  priceUsdc: number;
  totalQuantity?: number;
  salesStartAt?: string;
  salesEndAt?: string;
}): Promise<EventTicket | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('event_tickets')
    .insert({
      event_id: ticket.eventId,
      name: ticket.name,
      description: ticket.description,
      price_usdc: ticket.priceUsdc,
      total_quantity: ticket.totalQuantity,
      sales_start_at: ticket.salesStartAt,
      sales_end_at: ticket.salesEndAt,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    return null;
  }

  return {
    id: data.id,
    eventId: data.event_id,
    name: data.name,
    description: data.description,
    priceUsdc: parseFloat(data.price_usdc),
    totalQuantity: data.total_quantity,
    soldCount: data.sold_count,
    isActive: data.is_active,
    salesStartAt: data.sales_start_at,
    salesEndAt: data.sales_end_at,
    isAvailable: true,
    remaining: data.total_quantity,
    promoterWallet: null,
    promoterName: null,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { getEventTickets, createEventTicket } from '@/lib/db/tickets';

// GET /api/tickets?eventId=xxx - Get tickets for an event
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json(
      { error: 'eventId is required' },
      { status: 400 }
    );
  }

  const tickets = await getEventTickets(eventId);
  return NextResponse.json({ tickets });
}

// POST /api/tickets - Create a ticket for an event (promoters only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, description, priceUsdc, totalQuantity } = body;

    if (!eventId || !priceUsdc) {
      return NextResponse.json(
        { error: 'eventId and priceUsdc are required' },
        { status: 400 }
      );
    }

    const ticket = await createEventTicket({
      eventId,
      name: name || 'General Admission',
      description,
      priceUsdc: parseFloat(priceUsdc),
      totalQuantity: totalQuantity ? parseInt(totalQuantity) : undefined,
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

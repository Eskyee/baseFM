import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, getUpcomingEvents, getPastEvents } from '@/lib/db/events';
import { createEventTicket } from '@/lib/db/tickets';

// GET all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const past = searchParams.get('past') === 'true';
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'cancelled' | null;
    const promoterId = searchParams.get('promoterId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let events;

    if (upcoming) {
      events = await getUpcomingEvents(limit);
    } else if (past) {
      events = await getPastEvents(limit);
    } else {
      events = await getAllEvents({
        status: status || 'approved',
        promoterId: promoterId || undefined,
        limit,
      });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST create new event (submission)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      subtitle,
      description,
      date,
      startTime,
      endTime,
      displayDate,
      venue,
      address,
      city,
      country,
      imageUrl,
      coverImageUrl,
      headliners,
      tags,
      genres,
      ticketUrl,
      ticketPrice,
      promoterId,
      createdByWallet,
      // Ticket sales
      enableTicketSales,
      paymentWallet,
      ticketTiers,
    } = body;

    if (!title || !date || !venue || !displayDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, venue, displayDate' },
        { status: 400 }
      );
    }

    // Validate ticket sales fields if enabled
    if (enableTicketSales) {
      if (!paymentWallet) {
        return NextResponse.json(
          { error: 'Payment wallet required for ticket sales' },
          { status: 400 }
        );
      }
      if (!ticketTiers || ticketTiers.length === 0) {
        return NextResponse.json(
          { error: 'At least one ticket tier required for ticket sales' },
          { status: 400 }
        );
      }
    }

    const event = await createEvent({
      title,
      subtitle,
      description,
      date,
      startTime,
      endTime,
      displayDate,
      venue,
      address,
      city,
      country,
      imageUrl,
      coverImageUrl,
      headliners,
      tags,
      genres,
      ticketUrl,
      ticketPrice,
      promoterId,
      createdByWallet,
      enableTicketSales,
      promoterWallet: paymentWallet,
      ticketTiers,
    });

    // Create ticket tiers if ticket sales enabled
    const createdTickets = [];
    if (enableTicketSales && ticketTiers && ticketTiers.length > 0) {
      for (const tier of ticketTiers) {
        const ticket = await createEventTicket({
          eventId: event.id,
          name: tier.name,
          description: tier.description,
          priceUsdc: tier.priceUsdc,
          totalQuantity: tier.quantity || undefined,
        });
        if (ticket) {
          createdTickets.push(ticket);
        }
      }
    }

    return NextResponse.json({
      event,
      tickets: createdTickets.length > 0 ? createdTickets : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

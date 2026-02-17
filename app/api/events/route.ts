import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, getUpcomingEvents, getPastEvents } from '@/lib/db/events';

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
    } = body;

    if (!title || !date || !venue || !displayDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, venue, displayDate' },
        { status: 400 }
      );
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
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

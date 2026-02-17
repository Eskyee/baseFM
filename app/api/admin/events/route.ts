import { NextRequest, NextResponse } from 'next/server';
import { isAdminWallet } from '@/lib/admin/config';
import { getAllEventsAdmin, setEventStatus, setEventFeatured, deleteEvent } from '@/lib/db/events';

// GET all events (including pending) - admin only
export async function GET() {
  try {
    const events = await getAllEventsAdmin();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Admin Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// PATCH - update event status (approve, reject, feature)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, eventId, action, value } = body;

    // Check admin authorization
    if (!isAdminWallet(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!eventId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let event;

    switch (action) {
      case 'approve':
        event = await setEventStatus(eventId, 'approved');
        break;
      case 'reject':
        event = await setEventStatus(eventId, 'rejected');
        break;
      case 'cancel':
        event = await setEventStatus(eventId, 'cancelled');
        break;
      case 'pending':
        event = await setEventStatus(eventId, 'pending');
        break;
      case 'setFeatured':
        event = await setEventFeatured(eventId, value);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Admin Events PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - remove event
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, eventId } = body;

    // Check admin authorization
    if (!isAdminWallet(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    await deleteEvent(eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Events DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

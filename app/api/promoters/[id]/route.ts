import { NextRequest, NextResponse } from 'next/server';
import { getPromoterById, getPromoterBySlug, updatePromoter, deletePromoter } from '@/lib/db/promoters';
import { getAllEvents } from '@/lib/db/events';

// GET single promoter by ID or slug (includes their events)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try by ID first, then by slug
    let promoter = await getPromoterById(id);
    if (!promoter) {
      promoter = await getPromoterBySlug(id);
    }

    if (!promoter) {
      return NextResponse.json({ error: 'Promoter not found' }, { status: 404 });
    }

    // Get promoter's events (both upcoming and past)
    const events = await getAllEvents({
      promoterId: promoter.id,
    });

    return NextResponse.json({ promoter, events });
  } catch (error) {
    console.error('Promoter GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch promoter' }, { status: 500 });
  }
}

// PATCH update promoter
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const promoter = await updatePromoter(id, body);

    return NextResponse.json({ promoter });
  } catch (error) {
    console.error('Promoter PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update promoter' }, { status: 500 });
  }
}

// DELETE promoter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deletePromoter(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Promoter DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete promoter' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { eventFromRow, toPublicEvent } from '@/types/event';
import type { EventRow } from '@/types/event';

// ============================================================
// Public Events API — no auth required
// GET — Return public events (active + upcoming)
//
// Query params:
//   ?status=active       — filter by status (default: active)
//   ?limit=20            — max results (default: 50)
//   ?includeEnded=true   — include past events
//   ?id=<eventId>        — fetch a single event by ID
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get('id');
    const status = searchParams.get('status') || 'active';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const includeEnded = searchParams.get('includeEnded') === 'true';

    const db = createServerClient();

    // ---- Single event fetch ----
    if (singleId) {
      const { data, error } = await db
        .from('events')
        .select('*')
        .eq('id', singleId)
        .neq('status', 'draft') // Never expose drafts publicly
        .single<EventRow>();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        event: toPublicEvent(eventFromRow(data)),
      });
    }

    // ---- List events ----
    let query = db
      .from('events')
      .select('*')
      .neq('status', 'draft') // Never expose drafts publicly
      .order('start_time', { ascending: true })
      .limit(limit);

    if (!includeEnded) {
      // Only active events by default
      query = query.eq('status', status);
    } else {
      // Include both active and ended
      query = query.in('status', ['active', 'ended']);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch public events:', error);
      return NextResponse.json(
        { error: 'Failed to load events' },
        { status: 500 }
      );
    }

    const events = (data as EventRow[]).map((row) =>
      toPublicEvent(eventFromRow(row))
    );

    return NextResponse.json({ events });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Public events API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

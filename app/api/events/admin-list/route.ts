import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { createServerClient } from '@/lib/supabase/client';
import { isAdminWallet } from '@/lib/admin/config';
import { eventFromRow } from '@/types/event';
import type { EventRow } from '@/types/event';

// ============================================================
// Admin Events API — CRUD for events
// All methods require admin wallet verification
// ============================================================

function checkAdmin(walletAddress: string | undefined | null) {
  if (!walletAddress || !isAdminWallet(walletAddress)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return null;
}

/**
 * GET /api/events/admin-list
 * List all events (admin view — includes drafts)
 */
export async function GET() {
  try {
    const db = createServerClient();
    const { data, error } = await db
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    const events = (data as EventRow[]).map((row) => eventFromRow(row));
    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/events/admin-list
 * Create a new event
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, name, startTime, endTime, maxSupply, nftType, nftContract, artistAddress } = body;

    const denied = checkAdmin(walletAddress);
    if (denied) return denied;

    if (!name || !startTime || !endTime) {
      return NextResponse.json({ error: 'name, startTime, endTime are required' }, { status: 400 });
    }

    if (nftContract && !isAddress(nftContract)) {
      return NextResponse.json({ error: 'Invalid contract address' }, { status: 400 });
    }

    if (artistAddress && !isAddress(artistAddress)) {
      return NextResponse.json({ error: 'Invalid artist address' }, { status: 400 });
    }

    const db = createServerClient();
    const { data, error } = await db
      .from('events')
      .insert({
        name: name.trim(),
        start_time: startTime,
        end_time: endTime,
        max_supply: maxSupply || 100,
        minted: 0,
        nft_type: nftType || 'ERC1155',
        nft_contract: nftContract || null,
        artist_address: artistAddress || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create event:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: eventFromRow(data as EventRow) });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * PATCH /api/events/admin-list
 * Update event status or edit event details
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, eventId, status, updates } = body;

    const denied = checkAdmin(walletAddress);
    if (denied) return denied;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const db = createServerClient();

    // Full edit mode — updates object with event detail fields
    if (updates && typeof updates === 'object') {
      const allowedFields = [
        'name', 'title', 'subtitle', 'description', 'location', 'venue',
        'address', 'city', 'country', 'event_type', 'start_time', 'end_time',
        'display_date', 'max_supply', 'nft_type', 'nft_contract',
        'artist_address', 'stream_url', 'cover_image_url', 'image_url',
        'tags', 'headliners', 'ticket_url', 'ticket_price', 'genres',
        'promoter_id', 'status',
      ];

      const updateData: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in updates) {
          updateData[key] = updates[key];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      const { error } = await db
        .from('events')
        .update(updateData)
        .eq('id', eventId);

      if (error) {
        console.error('Failed to update event:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Legacy status-only mode
    if (!status) {
      return NextResponse.json({ error: 'status or updates required' }, { status: 400 });
    }

    const validStatuses = ['draft', 'active', 'ended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { error } = await db
      .from('events')
      .update({ status })
      .eq('id', eventId);

    if (error) {
      console.error('Failed to update event:', error);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

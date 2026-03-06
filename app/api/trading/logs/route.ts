import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import type { TradingLog } from '@/types/trading';

// Never statically pre-render — this route reads from Supabase at runtime
export const dynamic = 'force-dynamic';

/**
 * GET /api/trading/logs
 * Fetches trading activity logs
 * Query params:
 *   - after: ISO timestamp to fetch logs after (for polling)
 */
export async function GET(req: NextRequest) {
  try {
    const after = req.nextUrl.searchParams.get('after');
    const db = createServerClient();

    let query = db
      .from('trading_logs')
      .select('id, type, content, created_at')
      .order('created_at', { ascending: true });

    if (after) {
      query = query.gt('created_at', after);
    }

    // Limit to last 200 if no 'after' param
    if (!after) {
      query = query.limit(200);
    }

    const { data, error } = await query;

    if (error) {
      // Table might not exist - return empty array
      if (error.code === '42P01') {
        return NextResponse.json([]);
      }
      console.error('Failed to fetch logs:', error);
      return NextResponse.json([]);
    }

    const logs: TradingLog[] = (data || []).map((row) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      createdAt: row.created_at,
    }));

    return NextResponse.json(logs);
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    return NextResponse.json([]);
  }
}

/**
 * POST /api/trading/logs
 * Adds a new log entry
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'type and content are required' },
        { status: 400 }
      );
    }

    const validTypes = [
      'trade',
      'response',
      'analysis',
      'error',
      'balance_update',
      'scanning',
      'system',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Allowed: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const db = createServerClient();

    const { data, error } = await db
      .from('trading_logs')
      .insert({ type, content })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert log:', error);
      return NextResponse.json({ error: 'Failed to add log' }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      type: data.type,
      content: data.content,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error('Failed to add log:', err);
    return NextResponse.json({ error: 'Failed to add log' }, { status: 500 });
  }
}

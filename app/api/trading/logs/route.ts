import { NextRequest, NextResponse } from 'next/server';
import { getLatestTradingLogs, createTradingLog } from '@/lib/db/trading';

export const dynamic = 'force-dynamic';

// GET - Fetch trading logs (supports polling with ?after= timestamp)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const after = searchParams.get('after');
    const limit = parseInt(searchParams.get('limit') || '100');

    const logs = await getLatestTradingLogs({
      after: after || undefined,
      limit: after ? undefined : limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Trading logs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

// POST - Create a new trading log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, type, content, rawData, jobId, threadId } = body;

    if (!agentId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, type, content' },
        { status: 400 }
      );
    }

    const log = await createTradingLog({
      agentId,
      type,
      content,
      rawData,
      jobId,
      threadId,
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Trading logs POST error:', error);
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}

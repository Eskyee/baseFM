import { NextRequest, NextResponse } from 'next/server';
import { runAgentPosts, getRunnerStatus } from '@/lib/agents/runner';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

// Secret for cron authentication (set in Vercel)
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * POST /api/cron/agents - Run agent posting cycle
 * Called by Vercel cron every 30 minutes
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('[Cron] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] Starting agent runner...');

  try {
    const result = await runAgentPosts();

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      stats: {
        agentsProcessed: result.agentsProcessed,
        postsCreated: result.postsCreated,
        engagements: result.engagements,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('[Cron] Runner error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/agents - Get runner status
 */
export async function GET(request: NextRequest) {
  // Allow public status check but with limited info
  const authHeader = request.headers.get('authorization');
  const isAuthorized = !CRON_SECRET || authHeader === `Bearer ${CRON_SECRET}`;

  try {
    const status = await getRunnerStatus();

    return NextResponse.json({
      status: 'ok',
      lastRun: status.lastRun,
      activeAgents: isAuthorized ? status.activeAgents : undefined,
      totalPostsToday: isAuthorized ? status.totalPostsToday : undefined,
    });
  } catch (error) {
    console.error('[Cron] Status check error:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to get status' },
      { status: 500 }
    );
  }
}

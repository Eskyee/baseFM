import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentByHandle,
  getMusicSources,
  createTrack,
  updateMusicSourceSync,
  logAgentActivity,
} from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// POST /api/agents/[handle]/sync - Sync tracks from connected music platforms
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, platform } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    // Get agent and verify ownership
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.ownerWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get connected music sources
    const musicSources = await getMusicSources(agent.id);
    const sourcesToSync = platform
      ? musicSources.filter((s) => s.platform === platform)
      : musicSources.filter((s) => s.status === 'connected' && s.syncEnabled);

    if (sourcesToSync.length === 0) {
      return NextResponse.json(
        { error: 'No music sources connected or enabled for sync' },
        { status: 400 }
      );
    }

    const results: Array<{
      platform: string;
      success: boolean;
      tracksSynced: number;
      error?: string;
    }> = [];

    for (const source of sourcesToSync) {
      try {
        // In a real implementation, this would call platform-specific APIs
        // For now, we simulate a sync and mark the source as synced
        const tracksSynced = await syncPlatformTracks(agent.id, source.platform, source.profileUrl);

        await updateMusicSourceSync(agent.id, source.platform, tracksSynced);

        await logAgentActivity(agent.id, 'track_sync', {
          platform: source.platform,
          additionalData: { tracksSynced },
        });

        results.push({
          platform: source.platform,
          success: true,
          tracksSynced,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sync failed';
        results.push({
          platform: source.platform,
          success: false,
          tracksSynced: 0,
          error: errorMessage,
        });
      }
    }

    const totalSynced = results.reduce((sum, r) => sum + r.tracksSynced, 0);
    const allSucceeded = results.every((r) => r.success);

    return NextResponse.json({
      success: allSucceeded,
      totalTracksSynced: totalSynced,
      results,
      message: allSucceeded
        ? `Successfully synced ${totalSynced} tracks`
        : 'Some platforms failed to sync',
    });
  } catch (error) {
    console.error('Error syncing tracks:', error);
    const message = error instanceof Error ? error.message : 'Failed to sync tracks';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Placeholder sync function - in production this would integrate with actual platform APIs
async function syncPlatformTracks(
  agentId: string,
  platform: string,
  profileUrl?: string
): Promise<number> {
  // This is a placeholder that simulates track syncing
  // In production, this would:
  // 1. Call the platform's API (SoundCloud, Mixcloud, etc.)
  // 2. Fetch track metadata
  // 3. Create or update tracks in the database

  // For demonstration, we'll create a sample track if none exist
  if (platform === 'manual') {
    // Manual sources don't auto-sync
    return 0;
  }

  // Simulate finding tracks (in production, fetch from API)
  const simulatedTracks = [
    {
      title: `Sample Track - ${platform}`,
      audioUrl: profileUrl || `https://${platform}.com/tracks/sample`,
      genre: 'Electronic',
      tags: ['techno', 'electronic'],
    },
  ];

  let synced = 0;
  for (const track of simulatedTracks) {
    try {
      await createTrack(agentId, {
        title: track.title,
        audioUrl: track.audioUrl,
        genre: track.genre,
        tags: track.tags,
        sourcePlatform: platform,
        sourceUrl: track.audioUrl,
      });
      synced++;
    } catch {
      // Track might already exist, that's ok
    }
  }

  return synced;
}

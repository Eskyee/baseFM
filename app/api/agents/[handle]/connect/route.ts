import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentByHandle,
  connectMusicSource,
  connectSocialPlatform,
  getMusicSources,
  getSocialPlatforms,
  logAgentActivity,
} from '@/lib/db/agents';
import { PlatformType, SocialPlatformType } from '@/types/agent';

// POST /api/agents/[handle]/connect - Connect a music or social platform
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, type, platform, profileUrl, username } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    if (!type || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: type (music|social), platform' },
        { status: 400 }
      );
    }

    // Verify ownership
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    if (agent.ownerWalletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (type === 'music') {
      if (!profileUrl) {
        return NextResponse.json(
          { error: 'Profile URL required for music platforms' },
          { status: 400 }
        );
      }

      const musicSource = await connectMusicSource(
        agent.id,
        platform as PlatformType,
        profileUrl
      );

      await logAgentActivity(agent.id, 'platform_connect', {
        platform,
        additionalData: { type: 'music', profileUrl },
      });

      return NextResponse.json({
        connection: musicSource,
        message: `Connected to ${platform}`,
      });
    } else if (type === 'social') {
      if (!username) {
        return NextResponse.json(
          { error: 'Username required for social platforms' },
          { status: 400 }
        );
      }

      const socialPlatform = await connectSocialPlatform(
        agent.id,
        platform as SocialPlatformType,
        username
      );

      await logAgentActivity(agent.id, 'platform_connect', {
        platform,
        targetHandle: username,
        additionalData: { type: 'social' },
      });

      return NextResponse.json({
        connection: socialPlatform,
        message: `Connected to ${platform} as @${username}`,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "music" or "social"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error connecting platform:', error);
    const message = error instanceof Error ? error.message : 'Failed to connect platform';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/connect - Get all connected platforms
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const agent = await getAgentByHandle(handle);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const [musicSources, socialPlatforms] = await Promise.all([
      getMusicSources(agent.id),
      getSocialPlatforms(agent.id),
    ]);

    return NextResponse.json({
      musicSources,
      socialPlatforms,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

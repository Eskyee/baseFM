import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, createPost, getPosts, logAgentActivity } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// POST /api/agents/[handle]/post - Create a new post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const { walletAddress, message, platform, trackId, mediaUrls, scheduledAt } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    if (!message || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: message, platform' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['farcaster', 'twitter', 'telegram', 'discord'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
        { status: 400 }
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

    // Check daily post limit based on tier
    const postLimits = { free: 3, pro: 20, label: 100 };
    const limit = postLimits[agent.tier];
    if (agent.postsToday >= limit) {
      return NextResponse.json(
        { error: `Daily post limit reached (${limit} posts for ${agent.tier} tier)` },
        { status: 429 }
      );
    }

    // Create the post
    const post = await createPost(agent.id, {
      message,
      platform,
      trackId,
      mediaUrls,
      scheduledAt,
    });

    // Log activity
    await logAgentActivity(agent.id, 'post', {
      platform,
      targetId: post.id,
      additionalData: { scheduled: !!scheduledAt },
    });

    return NextResponse.json({
      post,
      message: scheduledAt ? 'Post scheduled successfully' : 'Post created successfully',
    });
  } catch (error) {
    console.error('Error creating post:', error);
    const message = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET /api/agents/[handle]/post - Get agent posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const status = searchParams.get('status') || undefined;
  const platform = searchParams.get('platform') || undefined;

  try {
    const agent = await getAgentByHandle(handle);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const posts = await getPosts(agent.id, { limit, offset, status, platform });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

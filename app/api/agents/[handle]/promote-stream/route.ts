import { NextRequest, NextResponse } from 'next/server';
import { getAgentByHandle, createPost, logAgentActivity, getSocialPlatforms } from '@/lib/db/agents';

export const dynamic = 'force-dynamic';

// POST /api/agents/[handle]/promote-stream - Promote a live stream
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  try {
    const body = await request.json();
    const {
      walletAddress,
      streamId,
      streamTitle,
      streamUrl,
      platforms,
      customMessage,
    } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required for authentication' },
        { status: 401 }
      );
    }

    if (!streamUrl) {
      return NextResponse.json(
        { error: 'Stream URL is required' },
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

    // Get connected social platforms
    const connectedPlatforms = await getSocialPlatforms(agent.id);
    const activePlatforms = connectedPlatforms.filter(
      (p) => p.status === 'connected' && p.canPost
    );

    if (activePlatforms.length === 0) {
      return NextResponse.json(
        { error: 'No social platforms connected with posting permissions' },
        { status: 400 }
      );
    }

    // Filter to requested platforms or use all
    const targetPlatforms = platforms
      ? activePlatforms.filter((p) => platforms.includes(p.platform))
      : activePlatforms;

    if (targetPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'None of the requested platforms are connected' },
        { status: 400 }
      );
    }

    // Generate stream promotion message
    const defaultMessage = generateStreamMessage(agent.artistName, streamTitle, streamUrl, agent.tone);
    const message = customMessage || defaultMessage;

    // Create posts for each platform
    const results: Array<{ platform: string; success: boolean; postId?: string; error?: string }> = [];

    for (const platform of targetPlatforms) {
      try {
        const post = await createPost(agent.id, {
          message,
          platform: platform.platform,
        });

        // Log activity
        await logAgentActivity(agent.id, 'post', {
          platform: platform.platform,
          targetId: post.id,
          additionalData: { type: 'stream_promotion', streamId },
        });

        results.push({
          platform: platform.platform,
          success: true,
          postId: post.id,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
        results.push({
          platform: platform.platform,
          success: false,
          error: errorMessage,
        });
      }
    }

    const successful = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: successful > 0,
      message: `Stream promoted to ${successful}/${results.length} platforms`,
      results,
      generatedMessage: message,
    });
  } catch (error) {
    console.error('Error promoting stream:', error);
    const message = error instanceof Error ? error.message : 'Failed to promote stream';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function generateStreamMessage(
  artistName: string,
  streamTitle: string | undefined,
  streamUrl: string,
  tone: string
): string {
  const title = streamTitle || 'Live Set';

  const templates: Record<string, string[]> = {
    professional: [
      `${artistName} is now live: "${title}"\n\nTune in: ${streamUrl}`,
      `Live now: ${artistName} presents "${title}"\n\n${streamUrl}`,
    ],
    underground: [
      `${artistName} going live rn\n\n"${title}"\n\n${streamUrl}`,
      `vibes loading... ${artistName} is live\n\n${streamUrl}`,
    ],
    hype: [
      `WE'RE LIVE! ${artistName} - "${title}"\n\nJoin the party: ${streamUrl}`,
      `IT'S ON! ${artistName} live right now!\n\n${streamUrl}`,
    ],
    chill: [
      `${artistName} is live with some sounds\n\n"${title}"\n\n${streamUrl}`,
      `Come hang - ${artistName} streaming now\n\n${streamUrl}`,
    ],
    mysterious: [
      `transmission incoming...\n\n${artistName}\n"${title}"\n\n${streamUrl}`,
      `${artistName} :: live :: ${title}\n\n${streamUrl}`,
    ],
  };

  const toneTemplates = templates[tone] || templates.underground;
  return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
}

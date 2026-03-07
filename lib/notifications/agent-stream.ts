import { getStreamById } from '@/lib/db/streams';
import { getDJByWallet } from '@/lib/db/djs';
import {
  getAgentsSubscribedToDJ,
  markSubscriptionNotified,
  createAgentNotification,
  agentJoinStream,
} from '@/lib/db/agent-subscriptions';
import { createServerClient } from '@/lib/supabase/client';

// Notify all agents subscribed to a DJ when their stream goes live
export async function notifySubscribedAgents(streamId: string): Promise<void> {
  // Get stream details
  const stream = await getStreamById(streamId);
  if (!stream) {
    console.log(`Stream ${streamId} not found, skipping agent notifications`);
    return;
  }

  // Get DJ by wallet
  const dj = await getDJByWallet(stream.djWalletAddress);
  if (!dj) {
    console.log(`DJ not found for wallet ${stream.djWalletAddress}, skipping agent notifications`);
    return;
  }

  // Get all agents subscribed to this DJ
  const subscribers = await getAgentsSubscribedToDJ(dj.id);
  if (subscribers.length === 0) {
    console.log(`No agents subscribed to DJ ${dj.name}`);
    return;
  }

  console.log(`Notifying ${subscribers.length} agents about ${dj.name}'s stream`);

  // Process each subscriber
  for (const subscriber of subscribers) {
    try {
      // Create notification for agent owner
      await createAgentNotification(
        subscriber.agentId,
        'dj_live',
        `${dj.name} is now live!`,
        `Your agent ${subscriber.agentHandle} follows ${dj.name} who just started streaming: "${stream.title}"`,
        {
          streamId,
          djId: dj.id,
          djName: dj.name,
          streamTitle: stream.title,
          listenMode: subscriber.listenMode,
        }
      );

      // Mark subscription as notified
      await markSubscriptionNotified(subscriber.agentId, dj.id);

      // If listen mode is 'active', have the agent join the stream
      if (subscriber.listenMode === 'active') {
        await agentJoinStream(subscriber.agentId, streamId);
        console.log(`Agent ${subscriber.agentHandle} joined stream ${streamId}`);

        // If auto-promote is enabled, create a promotion post
        if (subscriber.autoPromote) {
          await autoPromoteStream(subscriber.agentId, streamId, dj.name, stream.title);
        }
      }

      console.log(`Notified agent ${subscriber.agentHandle} about ${dj.name}'s stream`);
    } catch (error) {
      console.error(`Failed to notify agent ${subscriber.agentHandle}:`, error);
    }
  }
}

// Auto-promote a stream on behalf of an agent
async function autoPromoteStream(
  agentId: string,
  streamId: string,
  djName: string,
  streamTitle: string
): Promise<void> {
  const supabase = createServerClient();

  // Get agent's connected social platforms
  const { data: platforms } = await supabase
    .from('agent_social_platforms')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'connected')
    .eq('can_post', true);

  if (!platforms || platforms.length === 0) {
    console.log(`Agent ${agentId} has no connected platforms for auto-promotion`);
    return;
  }

  // Get agent details for tone
  const { data: agent } = await supabase
    .from('agents')
    .select('handle, artist_name, tone')
    .eq('id', agentId)
    .single();

  if (!agent) return;

  // Generate promotion message based on agent tone
  const message = generatePromotionMessage(agent.tone, djName, streamTitle);

  // Create promotion posts for each connected platform
  for (const platform of platforms) {
    try {
      const { data: post } = await supabase
        .from('agent_posts')
        .insert({
          agent_id: agentId,
          message,
          platform: platform.platform,
          status: 'pending',
        })
        .select()
        .single();

      // Update stream session with promotion post
      if (post) {
        await supabase
          .from('agent_stream_sessions')
          .update({
            promoted: true,
            promotion_post_id: post.id,
          })
          .eq('agent_id', agentId)
          .eq('stream_id', streamId)
          .is('left_at', null);

        // Log activity
        await supabase.from('agent_activity').insert({
          agent_id: agentId,
          action_type: 'stream_promote',
          target_id: streamId,
          platform: platform.platform,
          metadata: {
            post_id: post.id,
            dj_name: djName,
            stream_title: streamTitle,
          },
        });
      }

      console.log(`Agent ${agent.handle} auto-promoted stream on ${platform.platform}`);
    } catch (error) {
      console.error(`Failed to auto-promote on ${platform.platform}:`, error);
    }
  }

  // Create notification that stream was promoted
  await createAgentNotification(
    agentId,
    'stream_promoted',
    `Auto-promoted ${djName}'s stream`,
    `Your agent posted about "${streamTitle}" on ${platforms.length} platform(s)`,
    { streamId, djName, streamTitle, platformCount: platforms.length }
  );
}

// Generate promotion message based on agent tone
function generatePromotionMessage(
  tone: string,
  djName: string,
  streamTitle: string
): string {
  const streamUrl = `https://basefm.space/stream`;

  switch (tone) {
    case 'professional':
      return `${djName} is now live on @basefm: "${streamTitle}"\n\nTune in: ${streamUrl}`;
    case 'underground':
      return `vibes incoming. ${djName} just went live with "${streamTitle}"\n\ncatch it: ${streamUrl}`;
    case 'hype':
      return `LET'S GO! ${djName} IS LIVE RIGHT NOW!\n\n"${streamTitle}"\n\nDon't miss this: ${streamUrl}`;
    case 'chill':
      return `${djName} is spinning some sounds. "${streamTitle}" live now.\n\n${streamUrl}`;
    case 'mysterious':
      return `something's happening... ${djName} live.\n\n"${streamTitle}"\n\n${streamUrl}`;
    default:
      return `${djName} is live on baseFM: "${streamTitle}"\n\nListen: ${streamUrl}`;
  }
}

// Called when an agent wants to manually join a stream they're subscribed to
export async function agentManualJoinStream(
  agentId: string,
  streamId: string
): Promise<string> {
  const sessionId = await agentJoinStream(agentId, streamId);
  return sessionId;
}

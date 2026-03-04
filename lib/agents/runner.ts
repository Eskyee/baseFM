// Agent Runner Service
// Handles automated posting for active agents

import { createServerClient } from '@/lib/supabase/client';
import {
  getAllAgents,
  getTracks,
  getSocialPlatforms,
  createPost,
  updatePostStatus,
  logAgentActivity,
  getActiveBoost,
} from '@/lib/db/agents';
import { Agent, AgentTrack, AgentSocialPlatform } from '@/types/agent';
import { postToFarcaster, searchCasts, likeCast } from './farcaster';
import { generatePostContent, getPostLimitForTier, isPeakHour } from './content';

interface RunnerResult {
  success: boolean;
  agentsProcessed: number;
  postsCreated: number;
  engagements: number;
  errors: string[];
}

interface AgentWithContext {
  agent: Agent;
  tracks: AgentTrack[];
  platforms: AgentSocialPlatform[];
  boost: { multiplier: number } | null;
}

/**
 * Main runner function - called by cron job
 * Processes all active agents and creates posts
 */
export async function runAgentPosts(): Promise<RunnerResult> {
  const result: RunnerResult = {
    success: true,
    agentsProcessed: 0,
    postsCreated: 0,
    engagements: 0,
    errors: [],
  };

  try {
    // Get all active agents
    const agents = await getAllAgents({ status: 'active' });
    console.log(`[Runner] Found ${agents.length} active agents`);

    // Process each agent
    for (const agent of agents) {
      try {
        const processed = await processAgent(agent);
        result.agentsProcessed++;
        result.postsCreated += processed.posts;
        result.engagements += processed.engagements;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Agent ${agent.handle}: ${message}`);
        console.error(`[Runner] Error processing agent ${agent.handle}:`, error);
      }
    }

    // Update last run timestamp
    await updateLastRunTimestamp();

  } catch (error) {
    result.success = false;
    const message = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Runner error: ${message}`);
    console.error('[Runner] Fatal error:', error);
  }

  console.log(`[Runner] Complete: ${result.agentsProcessed} agents, ${result.postsCreated} posts, ${result.engagements} engagements`);
  return result;
}

/**
 * Process a single agent - check limits, generate content, post
 */
async function processAgent(agent: Agent): Promise<{ posts: number; engagements: number }> {
  const stats = { posts: 0, engagements: 0 };

  // Check daily post limit
  const limit = getPostLimitForTier(agent.tier);
  if (agent.postsToday >= limit) {
    console.log(`[Runner] Agent ${agent.handle} at daily limit (${limit})`);
    return stats;
  }

  // Get agent context
  const context = await getAgentContext(agent);
  if (!context) {
    console.log(`[Runner] No context for agent ${agent.handle}`);
    return stats;
  }

  // Check if agent has Farcaster connected
  const farcasterPlatform = context.platforms.find(p => p.platform === 'farcaster' && p.status === 'connected');
  if (!farcasterPlatform) {
    console.log(`[Runner] Agent ${agent.handle} has no Farcaster connection`);
    return stats;
  }

  // Determine posting behavior based on frequency
  const shouldPost = shouldAgentPost(agent, context);
  if (!shouldPost) {
    console.log(`[Runner] Agent ${agent.handle} skipping this cycle`);
    return stats;
  }

  // Create a post
  const postResult = await createAgentPost(context);
  if (postResult) {
    stats.posts++;
    await incrementDailyPostCount(agent.id);
  }

  // Auto-engage if enabled
  if (agent.autoEngage && isPeakHour(agent)) {
    const engageResult = await autoEngage(context);
    stats.engagements += engageResult;
  }

  return stats;
}

/**
 * Get full context for an agent (tracks, platforms, boost)
 */
async function getAgentContext(agent: Agent): Promise<AgentWithContext | null> {
  try {
    const [tracks, platforms, boost] = await Promise.all([
      getTracks(agent.id, { limit: 10 }),
      getSocialPlatforms(agent.id),
      getActiveBoost(agent.id),
    ]);

    return { agent, tracks, platforms, boost };
  } catch (error) {
    console.error(`[Runner] Error getting context for ${agent.handle}:`, error);
    return null;
  }
}

/**
 * Determine if agent should post this cycle based on frequency
 */
function shouldAgentPost(agent: Agent, context: AgentWithContext): boolean {
  // Boosted agents always post during peak hours
  if (context.boost && isPeakHour(agent)) {
    return true;
  }

  // Frequency-based posting probability
  const probabilities = {
    minimal: 0.2,   // 20% chance per cycle
    moderate: 0.5,  // 50% chance per cycle
    active: 0.8,    // 80% chance per cycle
  };

  const probability = probabilities[agent.postingFrequency];

  // Higher probability during peak hours
  const adjustedProbability = isPeakHour(agent) ? probability * 1.5 : probability;

  return Math.random() < Math.min(adjustedProbability, 1);
}

/**
 * Create and publish a post for an agent
 */
async function createAgentPost(context: AgentWithContext): Promise<boolean> {
  const { agent, tracks, platforms } = context;

  // Get Farcaster signer UUID from platform data
  const farcasterPlatform = platforms.find(p => p.platform === 'farcaster');
  const signerUuid = farcasterPlatform?.platformUserId;

  if (!signerUuid) {
    console.log(`[Runner] No Farcaster signer for ${agent.handle}`);
    return false;
  }

  // Pick a track to promote (prefer recent, unpromoted tracks)
  const track = pickTrackToPromote(tracks);

  // Generate content
  const content = generatePostContent({
    agent,
    track,
    type: track ? 'track_promo' : 'general_promo',
  });

  console.log(`[Runner] Creating post for ${agent.handle}: "${content.slice(0, 50)}..."`);

  // Create post record in database
  const post = await createPost(agent.id, {
    message: content,
    platform: 'farcaster',
    trackId: track?.id,
  });

  // Post to Farcaster
  const embeds = track?.sourceUrl ? [{ url: track.sourceUrl }] : [];
  const result = await postToFarcaster({
    signerUuid,
    text: content,
    embeds,
    channelId: agent.targetChannels[0], // Use first target channel if set
  });

  // Update post status
  if (result.success) {
    await updatePostStatus(post.id, 'posted', {
      platformPostId: result.castHash,
      platformPostUrl: result.castUrl,
    });

    await logAgentActivity(agent.id, 'post', {
      platform: 'farcaster',
      targetId: result.castHash,
      success: true,
    });

    console.log(`[Runner] Posted successfully: ${result.castUrl}`);
    return true;
  } else {
    await updatePostStatus(post.id, 'failed', {
      errorMessage: result.error,
    });

    await logAgentActivity(agent.id, 'post', {
      platform: 'farcaster',
      success: false,
      errorMessage: result.error,
    });

    console.error(`[Runner] Post failed: ${result.error}`);
    return false;
  }
}

/**
 * Pick a track to promote from agent's catalog
 */
function pickTrackToPromote(tracks: AgentTrack[]): AgentTrack | undefined {
  if (tracks.length === 0) return undefined;

  // Prefer featured tracks
  const featured = tracks.filter(t => t.isFeatured);
  if (featured.length > 0) {
    return featured[Math.floor(Math.random() * featured.length)];
  }

  // Otherwise pick randomly from recent tracks
  const recentTracks = tracks.slice(0, 5);
  return recentTracks[Math.floor(Math.random() * recentTracks.length)];
}

/**
 * Auto-engage with relevant content on Farcaster
 */
async function autoEngage(context: AgentWithContext): Promise<number> {
  const { agent, platforms } = context;
  let engagements = 0;

  const farcasterPlatform = platforms.find(p => p.platform === 'farcaster');
  const signerUuid = farcasterPlatform?.platformUserId;

  if (!signerUuid) return 0;

  // Search for relevant content based on agent's genres
  const searchTerms = agent.genres.slice(0, 2);

  for (const term of searchTerms) {
    try {
      const casts = await searchCasts(term, 5);

      for (const cast of casts) {
        // Skip if it's the agent's own content
        if (cast.authorUsername === agent.handle) continue;

        // Like the cast
        const liked = await likeCast(signerUuid, cast.hash);
        if (liked) {
          engagements++;
          await logAgentActivity(agent.id, 'like', {
            platform: 'farcaster',
            targetId: cast.hash,
            targetHandle: cast.authorUsername,
            success: true,
          });
        }

        // Limit engagements per cycle
        if (engagements >= 3) break;
      }
    } catch (error) {
      console.error(`[Runner] Engagement error for ${agent.handle}:`, error);
    }

    if (engagements >= 3) break;
  }

  return engagements;
}

/**
 * Increment agent's daily post count
 */
async function incrementDailyPostCount(agentId: string): Promise<void> {
  const supabase = createServerClient();

  await supabase.rpc('increment_agent_daily_posts', { agent_id: agentId });
}

/**
 * Update the last run timestamp in system config
 */
async function updateLastRunTimestamp(): Promise<void> {
  const supabase = createServerClient();

  await supabase
    .from('system_config')
    .upsert({
      key: 'agent_runner_last_run',
      value: new Date().toISOString(),
    }, {
      onConflict: 'key',
    });
}

/**
 * Get runner status
 */
export async function getRunnerStatus(): Promise<{
  lastRun: string | null;
  activeAgents: number;
  totalPostsToday: number;
}> {
  const supabase = createServerClient();

  const [configResult, agentsResult] = await Promise.all([
    supabase
      .from('system_config')
      .select('value')
      .eq('key', 'agent_runner_last_run')
      .single(),
    supabase
      .from('agents')
      .select('posts_today')
      .eq('status', 'active'),
  ]);

  const activeAgents = agentsResult.data?.length || 0;
  const totalPostsToday = agentsResult.data?.reduce((sum, a) => sum + (a.posts_today || 0), 0) || 0;

  return {
    lastRun: configResult.data?.value || null,
    activeAgents,
    totalPostsToday,
  };
}

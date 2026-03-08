import { createServerClient } from '@/lib/supabase/client';
import {
  Agent,
  AgentRow,
  agentFromRow,
  CreateAgentInput,
  UpdateAgentInput,
  AgentMusicSource,
  AgentSocialPlatform,
  AgentTrack,
  PlatformType,
  SocialPlatformType,
} from '@/types/agent';
import { randomBytes, createHash } from 'crypto';

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `clawbot_${randomBytes(32).toString('hex')}`;
  const hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.slice(0, 16);
  return { key, hash, prefix };
}

export async function getAgentByHandle(handle: string): Promise<Agent | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('handle', handle.toLowerCase())
    .single();

  if (error || !data) return null;
  return agentFromRow(data as AgentRow);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return agentFromRow(data as AgentRow);
}

export async function getAgentsByWallet(walletAddress: string): Promise<Agent[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('owner_wallet_address', walletAddress.toLowerCase())
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => agentFromRow(row as AgentRow));
}

export async function getAllAgents(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Agent[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('agents')
    .select('*')
    .neq('status', 'suspended')
    .order('total_followers_gained', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => agentFromRow(row as AgentRow));
}

export async function createAgent(input: CreateAgentInput): Promise<{ agent: Agent; apiKey: string }> {
  const supabase = createServerClient();

  // Validate handle format (let DB unique constraint catch duplicates - saves a query)
  const handleRegex = /^[a-z][a-z0-9-]{2,29}$/;
  if (!handleRegex.test(input.handle.toLowerCase())) {
    throw new Error('Handle must be 3-30 characters, start with a letter, and contain only lowercase letters, numbers, and hyphens');
  }

  // Generate API key
  const { key, hash, prefix } = generateApiKey();

  const { data, error } = await supabase
    .from('agents')
    .insert({
      handle: input.handle.toLowerCase(),
      artist_name: input.artistName,
      owner_wallet_address: input.ownerWalletAddress.toLowerCase(),
      owner_dj_id: input.ownerDjId || null,
      bio: input.bio || null,
      avatar_url: input.avatarUrl || null,
      genres: input.genres || [],
      posting_frequency: input.postingFrequency || 'moderate',
      tone: input.tone || 'underground',
      api_key_hash: hash,
      api_key_prefix: prefix,
    })
    .select()
    .single();

  // DB unique constraint catches duplicates
  if (error?.code === '23505') throw new Error('Handle is already taken');
  if (error) throw new Error(error.message);
  return { agent: agentFromRow(data as AgentRow), apiKey: key };
}

export async function updateAgent(handle: string, ownerWalletAddress: string, input: UpdateAgentInput): Promise<Agent> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};

  if (input.artistName !== undefined) updateData.artist_name = input.artistName;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.genres !== undefined) updateData.genres = input.genres;
  if (input.postingFrequency !== undefined) updateData.posting_frequency = input.postingFrequency;
  if (input.tone !== undefined) updateData.tone = input.tone;
  if (input.hashtags !== undefined) updateData.hashtags = input.hashtags;
  if (input.targetChannels !== undefined) updateData.target_channels = input.targetChannels;
  if (input.autoEngage !== undefined) updateData.auto_engage = input.autoEngage;
  if (input.peakHours !== undefined) updateData.peak_hours = input.peakHours;
  if (input.languages !== undefined) updateData.languages = input.languages;
  if (input.autoFollowSimilar !== undefined) updateData.auto_follow_similar = input.autoFollowSimilar;
  if (input.collaborationOpen !== undefined) updateData.collaboration_open = input.collaborationOpen;

  // Single query: update only if owner matches (no separate SELECT)
  const { data, error } = await supabase
    .from('agents')
    .update(updateData)
    .eq('handle', handle.toLowerCase())
    .eq('owner_wallet_address', ownerWalletAddress.toLowerCase())
    .select()
    .single();

  if (error?.code === 'PGRST116') throw new Error('Agent not found or not authorized');
  if (error) throw new Error(error.message);
  return agentFromRow(data as AgentRow);
}

export async function activateAgent(handle: string, ownerWalletAddress: string): Promise<Agent> {
  const supabase = createServerClient();

  // Single query: update only if owner matches (no separate SELECT)
  const { data, error } = await supabase
    .from('agents')
    .update({
      status: 'active',
      activated_at: new Date().toISOString(),
    })
    .eq('handle', handle.toLowerCase())
    .eq('owner_wallet_address', ownerWalletAddress.toLowerCase())
    .select()
    .single();

  if (error?.code === 'PGRST116') throw new Error('Agent not found or not authorized');
  if (error) throw new Error(error.message);
  return agentFromRow(data as AgentRow);
}

export async function pauseAgent(handle: string, ownerWalletAddress: string): Promise<Agent> {
  const supabase = createServerClient();

  // Single query: update only if owner matches (no separate SELECT)
  const { data, error } = await supabase
    .from('agents')
    .update({ status: 'paused' })
    .eq('handle', handle.toLowerCase())
    .eq('owner_wallet_address', ownerWalletAddress.toLowerCase())
    .select()
    .single();

  if (error?.code === 'PGRST116') throw new Error('Agent not found or not authorized');
  if (error) throw new Error(error.message);
  return agentFromRow(data as AgentRow);
}

export async function verifyApiKey(apiKey: string): Promise<Agent | null> {
  const supabase = createServerClient();

  const hash = createHash('sha256').update(apiKey).digest('hex');
  const prefix = apiKey.slice(0, 16);

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('api_key_prefix', prefix)
    .eq('api_key_hash', hash)
    .single();

  if (error || !data) return null;
  return agentFromRow(data as AgentRow);
}

// Music source operations
export async function connectMusicSource(
  agentId: string,
  platform: PlatformType,
  profileUrl: string
): Promise<AgentMusicSource> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_music_sources')
    .upsert({
      agent_id: agentId,
      platform,
      profile_url: profileUrl,
      status: 'connected',
    }, {
      onConflict: 'agent_id,platform',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    agentId: data.agent_id,
    platform: data.platform,
    platformUserId: data.platform_user_id || undefined,
    profileUrl: data.profile_url || undefined,
    lastSyncedAt: data.last_synced_at || undefined,
    syncEnabled: data.sync_enabled,
    tracksSynced: data.tracks_synced,
    status: data.status,
    errorMessage: data.error_message || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getMusicSources(agentId: string): Promise<AgentMusicSource[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_music_sources')
    .select('*')
    .eq('agent_id', agentId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    agentId: row.agent_id,
    platform: row.platform,
    platformUserId: row.platform_user_id || undefined,
    profileUrl: row.profile_url || undefined,
    lastSyncedAt: row.last_synced_at || undefined,
    syncEnabled: row.sync_enabled,
    tracksSynced: row.tracks_synced,
    status: row.status,
    errorMessage: row.error_message || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Social platform operations
export async function connectSocialPlatform(
  agentId: string,
  platform: SocialPlatformType,
  platformUsername: string
): Promise<AgentSocialPlatform> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_social_platforms')
    .upsert({
      agent_id: agentId,
      platform,
      platform_username: platformUsername,
      status: 'connected',
    }, {
      onConflict: 'agent_id,platform',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    agentId: data.agent_id,
    platform: data.platform,
    platformUserId: data.platform_user_id || undefined,
    platformUsername: data.platform_username || undefined,
    canPost: data.can_post,
    canReply: data.can_reply,
    canFollow: data.can_follow,
    canLike: data.can_like,
    status: data.status,
    errorMessage: data.error_message || undefined,
    lastPostedAt: data.last_posted_at || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getSocialPlatforms(agentId: string): Promise<AgentSocialPlatform[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_social_platforms')
    .select('*')
    .eq('agent_id', agentId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    agentId: row.agent_id,
    platform: row.platform,
    platformUserId: row.platform_user_id || undefined,
    platformUsername: row.platform_username || undefined,
    canPost: row.can_post,
    canReply: row.can_reply,
    canFollow: row.can_follow,
    canLike: row.can_like,
    status: row.status,
    errorMessage: row.error_message || undefined,
    lastPostedAt: row.last_posted_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Activity logging
export async function logAgentActivity(
  agentId: string,
  actionType: string,
  metadata?: {
    platform?: string;
    targetId?: string;
    targetHandle?: string;
    success?: boolean;
    errorMessage?: string;
    additionalData?: Record<string, unknown>;
  }
): Promise<void> {
  const supabase = createServerClient();

  await supabase.from('agent_activity').insert({
    agent_id: agentId,
    action_type: actionType,
    platform: metadata?.platform || null,
    target_id: metadata?.targetId || null,
    target_handle: metadata?.targetHandle || null,
    success: metadata?.success ?? true,
    error_message: metadata?.errorMessage || null,
    metadata: metadata?.additionalData || {},
  });
}

// Get agent activity
export async function getAgentActivity(
  agentId: string,
  options?: { limit?: number; offset?: number; actionType?: string }
): Promise<{ activities: AgentActivity[]; total: number }> {
  const supabase = createServerClient();

  let query = supabase
    .from('agent_activity')
    .select('*', { count: 'exact' })
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (options?.actionType) {
    query = query.eq('action_type', options.actionType);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error || !data) return { activities: [], total: 0 };

  return {
    activities: data.map((row) => ({
      id: row.id,
      agentId: row.agent_id,
      actionType: row.action_type,
      platform: row.platform || undefined,
      targetId: row.target_id || undefined,
      targetHandle: row.target_handle || undefined,
      metadata: row.metadata || {},
      success: row.success,
      errorMessage: row.error_message || undefined,
      createdAt: row.created_at,
    })),
    total: count || 0,
  };
}

// Track operations
export async function createTrack(
  agentId: string,
  input: {
    title: string;
    audioUrl: string;
    artworkUrl?: string;
    durationMs?: number;
    genre?: string;
    tags?: string[];
    releaseDate?: string;
    bpm?: number;
    key?: string;
    sourcePlatform?: string;
    sourceTrackId?: string;
    sourceUrl?: string;
  }
): Promise<AgentTrack> {
  const supabase = createServerClient();

  // Generate slug from title
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const { data, error } = await supabase
    .from('agent_tracks')
    .insert({
      agent_id: agentId,
      title: input.title,
      slug: `${slug}-${Date.now().toString(36)}`,
      audio_url: input.audioUrl,
      artwork_url: input.artworkUrl || null,
      duration_ms: input.durationMs || null,
      genre: input.genre || null,
      tags: input.tags || [],
      release_date: input.releaseDate || null,
      bpm: input.bpm || null,
      key: input.key || null,
      source_platform: input.sourcePlatform || null,
      source_track_id: input.sourceTrackId || null,
      source_url: input.sourceUrl || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return trackFromRow(data);
}

export async function getTracks(
  agentId: string,
  options?: { limit?: number; offset?: number; featured?: boolean }
): Promise<AgentTrack[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('agent_tracks')
    .select('*')
    .eq('agent_id', agentId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map(trackFromRow);
}

export async function getTrackById(trackId: string): Promise<AgentTrack | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_tracks')
    .select('*')
    .eq('id', trackId)
    .single();

  if (error || !data) return null;
  return trackFromRow(data);
}

function trackFromRow(row: Record<string, unknown>): AgentTrack {
  return {
    id: row.id as string,
    agentId: row.agent_id as string,
    title: row.title as string,
    slug: row.slug as string,
    audioUrl: row.audio_url as string,
    artworkUrl: (row.artwork_url as string) || undefined,
    durationMs: (row.duration_ms as number) || undefined,
    genre: (row.genre as string) || undefined,
    tags: (row.tags as string[]) || [],
    releaseDate: (row.release_date as string) || undefined,
    bpm: (row.bpm as number) || undefined,
    key: (row.key as string) || undefined,
    sourcePlatform: (row.source_platform as string) || undefined,
    sourceTrackId: (row.source_track_id as string) || undefined,
    sourceUrl: (row.source_url as string) || undefined,
    isPublished: row.is_published as boolean,
    isFeatured: row.is_featured as boolean,
    featuredUntil: (row.featured_until as string) || undefined,
    playCount: row.play_count as number,
    likeCount: row.like_count as number,
    repostCount: row.repost_count as number,
    commentCount: row.comment_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Post operations
export async function createPost(
  agentId: string,
  input: {
    message: string;
    platform: string;
    trackId?: string;
    mediaUrls?: string[];
    scheduledAt?: string;
  }
): Promise<AgentPost> {
  const supabase = createServerClient();

  // Determine post status:
  // - If scheduled, set to 'scheduled'
  // - Otherwise, immediately mark as 'posted' (simulating successful publish)
  const isScheduled = !!input.scheduledAt;
  const status = isScheduled ? 'scheduled' : 'posted';
  const postedAt = isScheduled ? null : new Date().toISOString();

  const { data, error } = await supabase
    .from('agent_posts')
    .insert({
      agent_id: agentId,
      message: input.message,
      platform: input.platform,
      track_id: input.trackId || null,
      media_urls: input.mediaUrls || [],
      scheduled_at: input.scheduledAt || null,
      status,
      posted_at: postedAt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return postFromRow(data);
}

export async function getPosts(
  agentId: string,
  options?: { limit?: number; offset?: number; status?: string; platform?: string }
): Promise<AgentPost[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('agent_posts')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.platform) {
    query = query.eq('platform', options.platform);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map(postFromRow);
}

export async function updatePostStatus(
  postId: string,
  status: 'posted' | 'failed',
  platformData?: { platformPostId?: string; platformPostUrl?: string; errorMessage?: string }
): Promise<void> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = { status };
  if (status === 'posted') {
    updateData.posted_at = new Date().toISOString();
  }
  if (platformData?.platformPostId) {
    updateData.platform_post_id = platformData.platformPostId;
  }
  if (platformData?.platformPostUrl) {
    updateData.platform_post_url = platformData.platformPostUrl;
  }
  if (platformData?.errorMessage) {
    updateData.error_message = platformData.errorMessage;
  }

  await supabase.from('agent_posts').update(updateData).eq('id', postId);
}

function postFromRow(row: Record<string, unknown>): AgentPost {
  return {
    id: row.id as string,
    agentId: row.agent_id as string,
    message: row.message as string,
    trackId: (row.track_id as string) || undefined,
    mediaUrls: (row.media_urls as string[]) || [],
    platform: row.platform as string,
    platformPostId: (row.platform_post_id as string) || undefined,
    platformPostUrl: (row.platform_post_url as string) || undefined,
    scheduledAt: (row.scheduled_at as string) || undefined,
    postedAt: (row.posted_at as string) || undefined,
    status: row.status as 'pending' | 'scheduled' | 'posted' | 'failed',
    errorMessage: (row.error_message as string) || undefined,
    likes: row.likes as number,
    reposts: row.reposts as number,
    replies: row.replies as number,
    createdAt: row.created_at as string,
  };
}

// Boost operations
export async function createBoost(
  agentId: string,
  boostLevel: 'standard' | 'power' | 'ultra',
  txHash?: string
): Promise<AgentBoost> {
  const supabase = createServerClient();

  const boostConfig = {
    standard: { multiplier: 2, costRave: 200, durationHours: 24 },
    power: { multiplier: 5, costRave: 500, durationHours: 48 },
    ultra: { multiplier: 10, costRave: 1000, durationHours: 72 },
  };

  const config = boostConfig[boostLevel];
  const expiresAt = new Date(Date.now() + config.durationHours * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('agent_boosts')
    .insert({
      agent_id: agentId,
      boost_level: boostLevel,
      multiplier: config.multiplier,
      cost_rave: config.costRave,
      tx_hash: txHash || null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return boostFromRow(data);
}

export async function getActiveBoost(agentId: string): Promise<AgentBoost | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_boosts')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('multiplier', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return boostFromRow(data);
}

function boostFromRow(row: Record<string, unknown>): AgentBoost {
  return {
    id: row.id as string,
    agentId: row.agent_id as string,
    boostLevel: row.boost_level as 'standard' | 'power' | 'ultra',
    multiplier: row.multiplier as number,
    costRave: row.cost_rave as number,
    txHash: (row.tx_hash as string) || undefined,
    startedAt: row.started_at as string,
    expiresAt: row.expires_at as string,
    status: row.status as 'active' | 'expired' | 'cancelled',
  };
}

// Tip operations
export async function createTip(
  agentId: string,
  senderWalletAddress: string,
  amount: number,
  txHash?: string,
  message?: string,
  senderHandle?: string
): Promise<AgentTip> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_tips')
    .insert({
      agent_id: agentId,
      sender_wallet_address: senderWalletAddress.toLowerCase(),
      sender_handle: senderHandle || null,
      amount,
      tx_hash: txHash || null,
      message: message || null,
      status: txHash ? 'confirmed' : 'pending',
      confirmed_at: txHash ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update agent total tips
  await supabase.rpc('increment_agent_tips', { agent_id: agentId, tip_amount: amount });

  return tipFromRow(data);
}

export async function getTips(
  agentId: string,
  options?: { limit?: number; offset?: number }
): Promise<AgentTip[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('agent_tips')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map(tipFromRow);
}

function tipFromRow(row: Record<string, unknown>): AgentTip {
  return {
    id: row.id as string,
    agentId: row.agent_id as string,
    senderWalletAddress: row.sender_wallet_address as string,
    senderHandle: (row.sender_handle as string) || undefined,
    amount: row.amount as number,
    token: row.token as string,
    txHash: (row.tx_hash as string) || undefined,
    message: (row.message as string) || undefined,
    status: row.status as 'pending' | 'confirmed' | 'failed',
    confirmedAt: (row.confirmed_at as string) || undefined,
    createdAt: row.created_at as string,
  };
}

// Webhook operations
export async function getWebhook(agentId: string): Promise<AgentWebhook | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('agent_webhooks')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (error || !data) return null;
  return webhookFromRow(data);
}

export async function upsertWebhook(
  agentId: string,
  url: string,
  events: string[],
  secret?: string
): Promise<AgentWebhook> {
  const supabase = createServerClient();

  const secretHash = secret
    ? createHash('sha256').update(secret).digest('hex')
    : null;

  const { data, error } = await supabase
    .from('agent_webhooks')
    .upsert({
      agent_id: agentId,
      url,
      events,
      secret_hash: secretHash,
      is_active: true,
      consecutive_failures: 0,
    }, {
      onConflict: 'agent_id',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return webhookFromRow(data);
}

export async function deleteWebhook(agentId: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.from('agent_webhooks').delete().eq('agent_id', agentId);
}

function webhookFromRow(row: Record<string, unknown>): AgentWebhook {
  return {
    id: row.id as string,
    agentId: row.agent_id as string,
    url: row.url as string,
    events: (row.events as string[]) || [],
    isActive: row.is_active as boolean,
    lastTriggeredAt: (row.last_triggered_at as string) || undefined,
    lastError: (row.last_error as string) || undefined,
    consecutiveFailures: row.consecutive_failures as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Discovery operations
export async function getSimilarAgents(
  genres: string[],
  excludeId?: string,
  limit = 10
): Promise<Agent[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('agents')
    .select('*')
    .eq('status', 'active')
    .overlaps('genres', genres)
    .order('total_followers_gained', { ascending: false })
    .limit(limit);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => agentFromRow(row as AgentRow));
}

export async function getTrendingAgents(
  options?: { genre?: string; limit?: number }
): Promise<Agent[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('agents')
    .select('*')
    .eq('status', 'active')
    .order('total_engagements', { ascending: false })
    .limit(options?.limit || 20);

  if (options?.genre) {
    query = query.contains('genres', [options.genre]);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => agentFromRow(row as AgentRow));
}

export async function getTrendingTracks(
  options?: { genre?: string; limit?: number }
): Promise<AgentTrack[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('agent_tracks')
    .select('*')
    .eq('is_published', true)
    .order('play_count', { ascending: false })
    .limit(options?.limit || 20);

  if (options?.genre) {
    query = query.eq('genre', options.genre);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map(trackFromRow);
}

// Music source sync
export async function updateMusicSourceSync(
  agentId: string,
  platform: PlatformType,
  tracksSynced: number
): Promise<void> {
  const supabase = createServerClient();

  await supabase
    .from('agent_music_sources')
    .update({
      last_synced_at: new Date().toISOString(),
      tracks_synced: tracksSynced,
      status: 'connected',
      error_message: null,
    })
    .eq('agent_id', agentId)
    .eq('platform', platform);
}

// Regenerate API key
export async function regenerateApiKey(handle: string, ownerWalletAddress: string): Promise<string> {
  const supabase = createServerClient();

  const { key, hash, prefix } = generateApiKey();

  const { error } = await supabase
    .from('agents')
    .update({
      api_key_hash: hash,
      api_key_prefix: prefix,
    })
    .eq('handle', handle.toLowerCase())
    .eq('owner_wallet_address', ownerWalletAddress.toLowerCase());

  if (error) throw new Error(error.message);
  return key;
}

// Types for new entities
export interface AgentActivity {
  id: string;
  agentId: string;
  actionType: string;
  platform?: string;
  targetId?: string;
  targetHandle?: string;
  metadata: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface AgentPost {
  id: string;
  agentId: string;
  message: string;
  trackId?: string;
  mediaUrls: string[];
  platform: string;
  platformPostId?: string;
  platformPostUrl?: string;
  scheduledAt?: string;
  postedAt?: string;
  status: 'pending' | 'scheduled' | 'posted' | 'failed';
  errorMessage?: string;
  likes: number;
  reposts: number;
  replies: number;
  createdAt: string;
}

export interface AgentBoost {
  id: string;
  agentId: string;
  boostLevel: 'standard' | 'power' | 'ultra';
  multiplier: number;
  costRave: number;
  txHash?: string;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface AgentTip {
  id: string;
  agentId: string;
  senderWalletAddress: string;
  senderHandle?: string;
  amount: number;
  token: string;
  txHash?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmedAt?: string;
  createdAt: string;
}

export interface AgentWebhook {
  id: string;
  agentId: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt?: string;
  lastError?: string;
  consecutiveFailures: number;
  createdAt: string;
  updatedAt: string;
}

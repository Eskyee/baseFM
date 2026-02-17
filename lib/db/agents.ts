import { createServerClient } from '@/lib/supabase/client';
import {
  Agent,
  AgentRow,
  agentFromRow,
  CreateAgentInput,
  UpdateAgentInput,
  AgentMusicSource,
  AgentSocialPlatform,
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

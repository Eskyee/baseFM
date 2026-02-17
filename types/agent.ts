export type AgentStatus = 'inactive' | 'active' | 'paused' | 'suspended';
export type AgentTier = 'free' | 'pro' | 'label';
export type PostingFrequency = 'minimal' | 'moderate' | 'active';
export type AgentTone = 'professional' | 'underground' | 'hype' | 'chill' | 'mysterious';
export type PlatformType = 'soundcloud' | 'mixcloud' | 'bandcamp' | 'spotify' | 'basefm' | 'manual';
export type SocialPlatformType = 'farcaster' | 'twitter' | 'telegram' | 'discord';
export type ConnectionStatus = 'pending' | 'connected' | 'disconnected' | 'error';

export interface Agent {
  id: string;
  handle: string;
  artistName: string;
  bio?: string;
  avatarUrl?: string;
  ownerWalletAddress: string;
  ownerDjId?: string;
  apiKeyPrefix: string;
  genres: string[];
  postingFrequency: PostingFrequency;
  tone: AgentTone;
  hashtags: string[];
  targetChannels: string[];
  autoEngage: boolean;
  peakHours: number[];
  languages: string[];
  status: AgentStatus;
  activatedAt?: string;
  lastActiveAt?: string;
  tier: AgentTier;
  tierExpiresAt?: string;
  totalPosts: number;
  totalEngagements: number;
  totalFollowersGained: number;
  totalTrackPlays: number;
  totalTipsReceivedRave: number;
  postsToday: number;
  postsTodayResetAt: string;
  autoFollowSimilar: boolean;
  collaborationOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRow {
  id: string;
  handle: string;
  artist_name: string;
  bio: string | null;
  avatar_url: string | null;
  owner_wallet_address: string;
  owner_dj_id: string | null;
  api_key_hash: string;
  api_key_prefix: string;
  genres: string[];
  posting_frequency: PostingFrequency;
  tone: AgentTone;
  hashtags: string[];
  target_channels: string[];
  auto_engage: boolean;
  peak_hours: number[];
  languages: string[];
  status: AgentStatus;
  activated_at: string | null;
  last_active_at: string | null;
  tier: AgentTier;
  tier_expires_at: string | null;
  total_posts: number;
  total_engagements: number;
  total_followers_gained: number;
  total_track_plays: number;
  total_tips_received_rave: number;
  posts_today: number;
  posts_today_reset_at: string;
  auto_follow_similar: boolean;
  collaboration_open: boolean;
  created_at: string;
  updated_at: string;
}

export function agentFromRow(row: AgentRow): Agent {
  return {
    id: row.id,
    handle: row.handle,
    artistName: row.artist_name,
    bio: row.bio || undefined,
    avatarUrl: row.avatar_url || undefined,
    ownerWalletAddress: row.owner_wallet_address,
    ownerDjId: row.owner_dj_id || undefined,
    apiKeyPrefix: row.api_key_prefix,
    genres: row.genres || [],
    postingFrequency: row.posting_frequency,
    tone: row.tone,
    hashtags: row.hashtags || [],
    targetChannels: row.target_channels || [],
    autoEngage: row.auto_engage,
    peakHours: row.peak_hours || [],
    languages: row.languages || [],
    status: row.status,
    activatedAt: row.activated_at || undefined,
    lastActiveAt: row.last_active_at || undefined,
    tier: row.tier,
    tierExpiresAt: row.tier_expires_at || undefined,
    totalPosts: row.total_posts,
    totalEngagements: row.total_engagements,
    totalFollowersGained: row.total_followers_gained,
    totalTrackPlays: row.total_track_plays,
    totalTipsReceivedRave: row.total_tips_received_rave,
    postsToday: row.posts_today,
    postsTodayResetAt: row.posts_today_reset_at,
    autoFollowSimilar: row.auto_follow_similar,
    collaborationOpen: row.collaboration_open,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateAgentInput {
  handle: string;
  artistName: string;
  ownerWalletAddress: string;
  ownerDjId?: string;
  bio?: string;
  avatarUrl?: string;
  genres?: string[];
  postingFrequency?: PostingFrequency;
  tone?: AgentTone;
}

export interface UpdateAgentInput {
  artistName?: string;
  bio?: string;
  avatarUrl?: string;
  genres?: string[];
  postingFrequency?: PostingFrequency;
  tone?: AgentTone;
  hashtags?: string[];
  targetChannels?: string[];
  autoEngage?: boolean;
  peakHours?: number[];
  languages?: string[];
  autoFollowSimilar?: boolean;
  collaborationOpen?: boolean;
}

export interface AgentMusicSource {
  id: string;
  agentId: string;
  platform: PlatformType;
  platformUserId?: string;
  profileUrl?: string;
  lastSyncedAt?: string;
  syncEnabled: boolean;
  tracksSynced: number;
  status: ConnectionStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSocialPlatform {
  id: string;
  agentId: string;
  platform: SocialPlatformType;
  platformUserId?: string;
  platformUsername?: string;
  canPost: boolean;
  canReply: boolean;
  canFollow: boolean;
  canLike: boolean;
  status: ConnectionStatus;
  errorMessage?: string;
  lastPostedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTrack {
  id: string;
  agentId: string;
  title: string;
  slug: string;
  audioUrl: string;
  artworkUrl?: string;
  durationMs?: number;
  genre?: string;
  tags: string[];
  releaseDate?: string;
  bpm?: number;
  key?: string;
  sourcePlatform?: string;
  sourceTrackId?: string;
  sourceUrl?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredUntil?: string;
  playCount: number;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

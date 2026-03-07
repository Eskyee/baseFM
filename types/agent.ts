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

export interface AgentPostAgent {
  id: string;
  handle: string;
  artist_name: string;
  avatar_url: string | null;
  genres: string[];
  tier: AgentTier;
  status: AgentStatus;
}

export interface AgentPost {
  id: string;
  agent_id: string;
  message: string;
  media_urls: string[] | null;
  platform: SocialPlatformType;
  platform_post_url: string | null;
  posted_at: string;
  likes: number;
  reposts: number;
  replies: number;
  track_id: string | null;
  agents: AgentPostAgent[];
}

export interface AgentTrackInfo {
  id: string;
  title: string;
  artwork_url: string | null;
  audio_url: string;
}

// Agent DJ Subscription Types
export type ListenMode = 'notify' | 'active' | 'passive';

export interface AgentDJSubscription {
  id: string;
  agentId: string;
  djId: string;
  notifyOnLive: boolean;
  autoPromote: boolean;
  listenMode: ListenMode;
  streamsNotified: number;
  streamsPromoted: number;
  lastNotifiedAt?: string;
  lastPromotedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Joined DJ info
  dj?: {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string;
  };
}

export interface AgentDJSubscriptionRow {
  id: string;
  agent_id: string;
  dj_id: string;
  notify_on_live: boolean;
  auto_promote: boolean;
  listen_mode: ListenMode;
  streams_notified: number;
  streams_promoted: number;
  last_notified_at: string | null;
  last_promoted_at: string | null;
  created_at: string;
  updated_at: string;
  djs?: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
  };
}

export function subscriptionFromRow(row: AgentDJSubscriptionRow): AgentDJSubscription {
  return {
    id: row.id,
    agentId: row.agent_id,
    djId: row.dj_id,
    notifyOnLive: row.notify_on_live,
    autoPromote: row.auto_promote,
    listenMode: row.listen_mode,
    streamsNotified: row.streams_notified,
    streamsPromoted: row.streams_promoted,
    lastNotifiedAt: row.last_notified_at || undefined,
    lastPromotedAt: row.last_promoted_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dj: row.djs ? {
      id: row.djs.id,
      name: row.djs.name,
      slug: row.djs.slug,
      avatarUrl: row.djs.avatar_url || undefined,
    } : undefined,
  };
}

export interface AgentStreamSession {
  id: string;
  agentId: string;
  streamId: string;
  subscriptionId?: string;
  joinedAt: string;
  leftAt?: string;
  durationSeconds?: number;
  promoted: boolean;
  promotionPostId?: string;
  createdAt: string;
}

export interface CreateSubscriptionInput {
  agentId: string;
  djId: string;
  notifyOnLive?: boolean;
  autoPromote?: boolean;
  listenMode?: ListenMode;
}

export interface UpdateSubscriptionInput {
  notifyOnLive?: boolean;
  autoPromote?: boolean;
  listenMode?: ListenMode;
}

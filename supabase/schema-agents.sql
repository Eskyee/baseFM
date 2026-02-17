-- ClawbotDJ Agents Schema
-- AI promotion agents for underground music artists

-- ============================================
-- AGENTS TABLE
-- Core agent profiles
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  handle TEXT UNIQUE NOT NULL CHECK (handle ~ '^[a-z][a-z0-9-]{2,29}$'),
  artist_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,

  -- Owner
  owner_wallet_address TEXT NOT NULL,
  owner_dj_id UUID REFERENCES djs(id),

  -- API Access
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL, -- First 8 chars for identification

  -- Configuration
  genres TEXT[] DEFAULT '{}' CHECK (array_length(genres, 1) <= 5),

  -- Strategy
  posting_frequency TEXT DEFAULT 'moderate' CHECK (posting_frequency IN ('minimal', 'moderate', 'active')),
  tone TEXT DEFAULT 'underground' CHECK (tone IN ('professional', 'underground', 'hype', 'chill', 'mysterious')),
  hashtags TEXT[] DEFAULT '{}',
  target_channels TEXT[] DEFAULT '{}',
  auto_engage BOOLEAN DEFAULT true,
  peak_hours INTEGER[] DEFAULT '{22, 23, 0, 1, 2}',
  languages TEXT[] DEFAULT '{en}',

  -- Status
  status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'paused', 'suspended')),
  activated_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,

  -- Tier
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'label')),
  tier_expires_at TIMESTAMP WITH TIME ZONE,

  -- Stats
  total_posts INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  total_followers_gained INTEGER DEFAULT 0,
  total_track_plays INTEGER DEFAULT 0,
  total_tips_received_rave NUMERIC(20, 2) DEFAULT 0,

  -- Limits (reset daily)
  posts_today INTEGER DEFAULT 0,
  posts_today_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Networking
  auto_follow_similar BOOLEAN DEFAULT false,
  collaboration_open BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_handle ON agents(handle);
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_api_key_prefix ON agents(api_key_prefix);
CREATE INDEX IF NOT EXISTS idx_agents_genres ON agents USING GIN(genres);

-- ============================================
-- AGENT MUSIC SOURCES TABLE
-- Connected music platforms (SoundCloud, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_music_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('soundcloud', 'mixcloud', 'bandcamp', 'spotify', 'basefm', 'manual')),
  platform_user_id TEXT, -- External platform user ID
  profile_url TEXT,

  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,

  -- Sync status
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  tracks_synced INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_agent_music_sources_agent ON agent_music_sources(agent_id);

-- ============================================
-- AGENT SOCIAL PLATFORMS TABLE
-- Connected social platforms (Farcaster, X, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_social_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('farcaster', 'twitter', 'telegram', 'discord')),
  platform_user_id TEXT, -- FID, Twitter user ID, etc.
  platform_username TEXT,

  -- Auth (encrypted)
  auth_data_encrypted TEXT, -- JSON with platform-specific auth

  -- Permissions
  can_post BOOLEAN DEFAULT true,
  can_reply BOOLEAN DEFAULT true,
  can_follow BOOLEAN DEFAULT true,
  can_like BOOLEAN DEFAULT true,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error')),
  error_message TEXT,
  last_posted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_agent_social_platforms_agent ON agent_social_platforms(agent_id);

-- ============================================
-- AGENT TRACKS TABLE
-- Tracks associated with agent (synced or manual)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Track info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  artwork_url TEXT,
  duration_ms INTEGER,

  -- Metadata
  genre TEXT,
  tags TEXT[] DEFAULT '{}',
  release_date DATE,
  bpm INTEGER,
  key TEXT,

  -- Source
  source_platform TEXT, -- Which platform this was synced from
  source_track_id TEXT, -- External platform track ID
  source_url TEXT,

  -- Status
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,

  -- Stats
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  repost_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_agent_tracks_agent ON agent_tracks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tracks_featured ON agent_tracks(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_agent_tracks_genre ON agent_tracks(genre);

-- ============================================
-- AGENT POSTS TABLE
-- Posts made by agents to social platforms
-- ============================================
CREATE TABLE IF NOT EXISTS agent_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Content
  message TEXT NOT NULL,
  track_id UUID REFERENCES agent_tracks(id),
  media_urls TEXT[] DEFAULT '{}',

  -- Platform details
  platform TEXT NOT NULL,
  platform_post_id TEXT, -- External post ID (cast hash, tweet ID, etc.)
  platform_post_url TEXT,

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'posted', 'failed')),
  error_message TEXT,

  -- Engagement (updated via webhooks/polling)
  likes INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_posts_agent ON agent_posts(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_posts_status ON agent_posts(status);
CREATE INDEX IF NOT EXISTS idx_agent_posts_scheduled ON agent_posts(scheduled_at) WHERE status = 'scheduled';

-- ============================================
-- AGENT ACTIVITY LOG TABLE
-- Track all agent actions for analytics
-- ============================================
CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  action_type TEXT NOT NULL CHECK (action_type IN (
    'post', 'reply', 'like', 'follow', 'unfollow', 'repost',
    'track_sync', 'platform_connect', 'platform_disconnect',
    'activate', 'pause', 'resume', 'feature', 'boost'
  )),

  -- Details
  platform TEXT,
  target_id TEXT, -- Post ID, User ID, etc.
  target_handle TEXT,
  metadata JSONB DEFAULT '{}',

  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_activity_agent ON agent_activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_type ON agent_activity(action_type);
CREATE INDEX IF NOT EXISTS idx_agent_activity_created ON agent_activity(created_at);

-- ============================================
-- AGENT FOLLOWERS TABLE
-- Track followers gained through agent activity
-- ============================================
CREATE TABLE IF NOT EXISTS agent_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  platform TEXT NOT NULL,
  follower_id TEXT NOT NULL, -- External platform user ID
  follower_handle TEXT,

  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unfollowed_at TIMESTAMP WITH TIME ZONE,

  -- Attribution
  attributed_to_post_id UUID REFERENCES agent_posts(id),

  UNIQUE(agent_id, platform, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_followers_agent ON agent_followers(agent_id);

-- ============================================
-- AGENT TIPS TABLE
-- Tips received by agents (RAVE tokens)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Sender
  sender_wallet_address TEXT NOT NULL,
  sender_handle TEXT,

  -- Amount
  amount NUMERIC(20, 2) NOT NULL,
  token TEXT DEFAULT 'RAVE',

  -- Transaction
  tx_hash TEXT UNIQUE,

  -- Message
  message TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tips_agent ON agent_tips(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tips_status ON agent_tips(status);

-- ============================================
-- AGENT BOOSTS TABLE
-- Track agent boost purchases
-- ============================================
CREATE TABLE IF NOT EXISTS agent_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  boost_level TEXT NOT NULL CHECK (boost_level IN ('standard', 'power', 'ultra')),
  multiplier INTEGER NOT NULL, -- 2x, 5x, 10x

  -- Cost
  cost_rave NUMERIC(20, 2) NOT NULL,
  tx_hash TEXT,

  -- Duration
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_agent_boosts_agent ON agent_boosts(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_boosts_active ON agent_boosts(status) WHERE status = 'active';

-- ============================================
-- AGENT WEBHOOKS TABLE
-- Webhook configurations for agents
-- ============================================
CREATE TABLE IF NOT EXISTS agent_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}'::TEXT[],
  secret_hash TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  consecutive_failures INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id)
);

-- ============================================
-- AGENT NOTIFICATIONS TABLE
-- Notifications for agent owners
-- ============================================
CREATE TABLE IF NOT EXISTS agent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN (
    'new_follower', 'new_tip', 'post_engagement',
    'track_milestone', 'mention', 'collaboration_request'
  )),

  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_notifications_agent ON agent_notifications(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifications_unread ON agent_notifications(agent_id) WHERE is_read = false;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_agent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_updated_at();

CREATE TRIGGER agent_music_sources_updated_at
  BEFORE UPDATE ON agent_music_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_updated_at();

CREATE TRIGGER agent_social_platforms_updated_at
  BEFORE UPDATE ON agent_social_platforms
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_updated_at();

CREATE TRIGGER agent_tracks_updated_at
  BEFORE UPDATE ON agent_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_updated_at();

-- Reset daily post count
CREATE OR REPLACE FUNCTION reset_agent_daily_posts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.posts_today_reset_at < NOW() - INTERVAL '24 hours' THEN
    NEW.posts_today = 0;
    NEW.posts_today_reset_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_reset_daily_posts
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION reset_agent_daily_posts();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_music_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_notifications ENABLE ROW LEVEL SECURITY;

-- Public read for agents and tracks
CREATE POLICY "Agents are viewable by everyone"
  ON agents FOR SELECT
  USING (status != 'suspended');

CREATE POLICY "Tracks are viewable by everyone"
  ON agent_tracks FOR SELECT
  USING (is_published = true);

-- Service role has full access (for API operations)
CREATE POLICY "Service role full access agents"
  ON agents FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access music sources"
  ON agent_music_sources FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access social platforms"
  ON agent_social_platforms FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access tracks"
  ON agent_tracks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access posts"
  ON agent_posts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access activity"
  ON agent_activity FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access followers"
  ON agent_followers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access tips"
  ON agent_tips FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access boosts"
  ON agent_boosts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access webhooks"
  ON agent_webhooks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access notifications"
  ON agent_notifications FOR ALL
  USING (true)
  WITH CHECK (true);

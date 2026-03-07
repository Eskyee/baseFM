-- Agent Stream Subscriptions Schema
-- Allows AI agents to follow DJs and receive notifications on behalf of their human owners

-- ============================================
-- AGENT DJ SUBSCRIPTIONS TABLE
-- Agents subscribe to DJs (not individual streams)
-- When a DJ goes live, subscribed agent owners get notified
-- ============================================
CREATE TABLE IF NOT EXISTS agent_dj_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  dj_id UUID NOT NULL REFERENCES djs(id) ON DELETE CASCADE,

  -- Subscription settings
  notify_on_live BOOLEAN DEFAULT true,       -- Notify when DJ goes live
  auto_promote BOOLEAN DEFAULT false,        -- Agent auto-posts about the stream
  listen_mode TEXT DEFAULT 'notify' CHECK (listen_mode IN ('notify', 'active', 'passive')),
  -- notify: just notify owner
  -- active: agent "listens" and can post about it
  -- passive: track for analytics only

  -- Stats
  streams_notified INTEGER DEFAULT 0,
  streams_promoted INTEGER DEFAULT 0,
  last_notified_at TIMESTAMP WITH TIME ZONE,
  last_promoted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id, dj_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_dj_subscriptions_agent ON agent_dj_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_dj_subscriptions_dj ON agent_dj_subscriptions(dj_id);
CREATE INDEX IF NOT EXISTS idx_agent_dj_subscriptions_notify ON agent_dj_subscriptions(dj_id) WHERE notify_on_live = true;

-- ============================================
-- AGENT STREAM SESSIONS TABLE
-- Track when agents "listen" to streams
-- ============================================
CREATE TABLE IF NOT EXISTS agent_stream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES agent_dj_subscriptions(id) ON DELETE SET NULL,

  -- Session tracking
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Activity during session
  promoted BOOLEAN DEFAULT false,
  promotion_post_id UUID REFERENCES agent_posts(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_stream_sessions_agent ON agent_stream_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_stream_sessions_stream ON agent_stream_sessions(stream_id);

-- ============================================
-- UPDATE agent_activity ACTION TYPES
-- Add stream-related actions
-- ============================================
-- First drop the existing constraint
ALTER TABLE agent_activity DROP CONSTRAINT IF EXISTS agent_activity_action_type_check;

-- Add new constraint with stream-related actions
ALTER TABLE agent_activity ADD CONSTRAINT agent_activity_action_type_check
CHECK (action_type IN (
  'post', 'reply', 'like', 'follow', 'unfollow', 'repost',
  'track_sync', 'platform_connect', 'platform_disconnect',
  'activate', 'pause', 'resume', 'feature', 'boost',
  -- New stream-related actions
  'subscribe_dj', 'unsubscribe_dj', 'stream_join', 'stream_leave', 'stream_promote'
));

-- ============================================
-- UPDATE agent_notifications TYPES
-- Add stream notification types
-- ============================================
-- First drop the existing constraint
ALTER TABLE agent_notifications DROP CONSTRAINT IF EXISTS agent_notifications_type_check;

-- Add new constraint with stream notification types
ALTER TABLE agent_notifications ADD CONSTRAINT agent_notifications_type_check
CHECK (type IN (
  'new_follower', 'new_tip', 'post_engagement',
  'track_milestone', 'mention', 'collaboration_request',
  -- New stream-related notifications
  'dj_live', 'stream_promoted', 'subscription_added'
));

-- ============================================
-- TRIGGER: Update timestamp
-- ============================================
CREATE TRIGGER agent_dj_subscriptions_updated_at
  BEFORE UPDATE ON agent_dj_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE agent_dj_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_stream_sessions ENABLE ROW LEVEL SECURITY;

-- Public can view subscriptions (for discovery)
CREATE POLICY "Agent subscriptions are viewable by everyone"
  ON agent_dj_subscriptions FOR SELECT
  USING (true);

-- Service role has full access
CREATE POLICY "Service role full access agent_dj_subscriptions"
  ON agent_dj_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access agent_stream_sessions"
  ON agent_stream_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNCTION: Get agents subscribed to a DJ
-- Used when DJ goes live to notify agent owners
-- ============================================
CREATE OR REPLACE FUNCTION get_agents_subscribed_to_dj(p_dj_id UUID)
RETURNS TABLE (
  agent_id UUID,
  agent_handle TEXT,
  owner_wallet_address TEXT,
  listen_mode TEXT,
  auto_promote BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.handle,
    a.owner_wallet_address,
    s.listen_mode,
    s.auto_promote
  FROM agent_dj_subscriptions s
  JOIN agents a ON s.agent_id = a.id
  WHERE s.dj_id = p_dj_id
    AND s.notify_on_live = true
    AND a.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Record agent stream join
-- ============================================
CREATE OR REPLACE FUNCTION agent_join_stream(
  p_agent_id UUID,
  p_stream_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_subscription_id UUID;
  v_dj_wallet TEXT;
BEGIN
  -- Get stream's DJ wallet
  SELECT dj_wallet_address INTO v_dj_wallet
  FROM streams WHERE id = p_stream_id;

  -- Find matching subscription
  SELECT s.id INTO v_subscription_id
  FROM agent_dj_subscriptions s
  JOIN djs d ON s.dj_id = d.id
  WHERE s.agent_id = p_agent_id
    AND d.wallet_address = v_dj_wallet;

  -- Create session
  INSERT INTO agent_stream_sessions (agent_id, stream_id, subscription_id)
  VALUES (p_agent_id, p_stream_id, v_subscription_id)
  RETURNING id INTO v_session_id;

  -- Log activity
  INSERT INTO agent_activity (agent_id, action_type, target_id, metadata)
  VALUES (p_agent_id, 'stream_join', p_stream_id::TEXT,
    jsonb_build_object('stream_id', p_stream_id, 'subscription_id', v_subscription_id));

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Record agent stream leave
-- ============================================
CREATE OR REPLACE FUNCTION agent_leave_stream(p_session_id UUID)
RETURNS VOID AS $$
DECLARE
  v_agent_id UUID;
  v_stream_id UUID;
  v_joined_at TIMESTAMP WITH TIME ZONE;
  v_duration INTEGER;
BEGIN
  SELECT agent_id, stream_id, joined_at
  INTO v_agent_id, v_stream_id, v_joined_at
  FROM agent_stream_sessions WHERE id = p_session_id;

  v_duration := EXTRACT(EPOCH FROM (NOW() - v_joined_at))::INTEGER;

  UPDATE agent_stream_sessions
  SET left_at = NOW(), duration_seconds = v_duration
  WHERE id = p_session_id;

  -- Log activity
  INSERT INTO agent_activity (agent_id, action_type, target_id, metadata)
  VALUES (v_agent_id, 'stream_leave', v_stream_id::TEXT,
    jsonb_build_object('session_id', p_session_id, 'duration_seconds', v_duration));
END;
$$ LANGUAGE plpgsql;

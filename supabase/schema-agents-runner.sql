-- Agent Runner Support Schema
-- Additional tables and functions for the automated agent posting system

-- ============================================
-- SYSTEM CONFIG TABLE
-- Key-value store for system settings
-- ============================================
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Increment agent's daily post count
CREATE OR REPLACE FUNCTION increment_agent_daily_posts(agent_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET posts_today = posts_today + 1,
      total_posts = total_posts + 1,
      last_active_at = NOW()
  WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql;

-- Increment agent's tip total
CREATE OR REPLACE FUNCTION increment_agent_tips(agent_id UUID, tip_amount NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET total_tips_received_rave = total_tips_received_rave + tip_amount
  WHERE id = agent_id;
END;
$$ LANGUAGE plpgsql;

-- Reset daily post counts (run at midnight UTC)
CREATE OR REPLACE FUNCTION reset_all_agent_daily_posts()
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET posts_today = 0,
      posts_today_reset_at = NOW()
  WHERE posts_today > 0;
END;
$$ LANGUAGE plpgsql;

-- Get agents that are due for posting
CREATE OR REPLACE FUNCTION get_agents_due_for_posting()
RETURNS TABLE(
  id UUID,
  handle TEXT,
  artist_name TEXT,
  tier TEXT,
  posting_frequency TEXT,
  posts_today INTEGER,
  peak_hours INTEGER[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.handle,
    a.artist_name,
    a.tier,
    a.posting_frequency,
    a.posts_today,
    a.peak_hours
  FROM agents a
  WHERE a.status = 'active'
    AND (
      (a.tier = 'free' AND a.posts_today < 3) OR
      (a.tier = 'pro' AND a.posts_today < 15) OR
      (a.tier = 'label' AND a.posts_today < 50)
    )
  ORDER BY
    -- Priority: boosted agents first
    (SELECT COUNT(*) FROM agent_boosts b WHERE b.agent_id = a.id AND b.status = 'active' AND b.expires_at > NOW()) DESC,
    -- Then by posting frequency
    CASE a.posting_frequency
      WHEN 'active' THEN 1
      WHEN 'moderate' THEN 2
      WHEN 'minimal' THEN 3
    END,
    -- Finally by last activity (least recent first)
    a.last_active_at NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Expire old boosts
CREATE OR REPLACE FUNCTION expire_agent_boosts()
RETURNS void AS $$
BEGIN
  UPDATE agent_boosts
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES FOR RUNNER PERFORMANCE
-- ============================================

-- Index for finding active agents quickly
CREATE INDEX IF NOT EXISTS idx_agents_active_posting
  ON agents(status, posts_today, posting_frequency)
  WHERE status = 'active';

-- Index for finding due posts
CREATE INDEX IF NOT EXISTS idx_agent_posts_pending
  ON agent_posts(agent_id, status, scheduled_at)
  WHERE status IN ('pending', 'scheduled');

-- ============================================
-- SCHEDULED JOBS (via pg_cron if available)
-- ============================================

-- Note: These require pg_cron extension to be enabled
-- If not available, handle via Vercel cron or external scheduler

-- Reset daily post counts at midnight UTC
-- SELECT cron.schedule('reset-agent-posts', '0 0 * * *', 'SELECT reset_all_agent_daily_posts()');

-- Expire old boosts every hour
-- SELECT cron.schedule('expire-boosts', '0 * * * *', 'SELECT expire_agent_boosts()');

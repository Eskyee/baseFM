-- DJ Mixes: Audio uploads stored on Mux
-- Allows DJs to showcase their recorded mixes on their profile

CREATE TABLE IF NOT EXISTS dj_mixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID NOT NULL REFERENCES djs(id) ON DELETE CASCADE,

  -- Mix info
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  duration_seconds INTEGER,

  -- Mux asset details
  mux_asset_id TEXT NOT NULL,
  mux_playback_id TEXT NOT NULL,

  -- Artwork
  cover_image_url TEXT,

  -- Stats
  play_count INTEGER DEFAULT 0,

  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,

  -- Timestamps
  recorded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dj_mixes_dj ON dj_mixes(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_mixes_featured ON dj_mixes(is_featured);
CREATE INDEX IF NOT EXISTS idx_dj_mixes_plays ON dj_mixes(play_count DESC);

-- RLS
ALTER TABLE dj_mixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mixes are viewable if public" ON dj_mixes FOR SELECT USING (is_public = true);
CREATE POLICY "DJs can manage their mixes" ON dj_mixes FOR ALL USING (true);

-- ============================================
-- DJ FOLLOWERS
-- ============================================
CREATE TABLE IF NOT EXISTS dj_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID NOT NULL REFERENCES djs(id) ON DELETE CASCADE,
  follower_wallet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dj_id, follower_wallet)
);

CREATE INDEX IF NOT EXISTS idx_dj_followers_dj ON dj_followers(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_followers_wallet ON dj_followers(follower_wallet);

ALTER TABLE dj_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Followers are viewable" ON dj_followers FOR SELECT USING (true);
CREATE POLICY "Anyone can follow" ON dj_followers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can unfollow" ON dj_followers FOR DELETE USING (true);

-- ============================================
-- DJ OF THE DAY
-- ============================================
CREATE TABLE IF NOT EXISTS dj_of_the_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID NOT NULL REFERENCES djs(id) ON DELETE CASCADE,
  featured_date DATE NOT NULL UNIQUE,
  reason TEXT, -- Why they're featured (e.g., "Most active", "New DJ", "Community pick")
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dj_of_day_date ON dj_of_the_day(featured_date DESC);

ALTER TABLE dj_of_the_day ENABLE ROW LEVEL SECURITY;
CREATE POLICY "DJ of day is viewable" ON dj_of_the_day FOR SELECT USING (true);
CREATE POLICY "Admin can set DJ of day" ON dj_of_the_day FOR ALL USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get follower count for a DJ
CREATE OR REPLACE FUNCTION get_dj_follower_count(dj_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM dj_followers WHERE dj_id = dj_uuid);
END;
$$ LANGUAGE plpgsql;

-- Get total tips for a DJ
CREATE OR REPLACE FUNCTION get_dj_total_tips(dj_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE((SELECT SUM(amount_eth) FROM tips WHERE dj_id = dj_uuid AND status = 'confirmed'), 0);
END;
$$ LANGUAGE plpgsql;

-- Automatically select DJ of the day based on activity
CREATE OR REPLACE FUNCTION auto_select_dj_of_day()
RETURNS UUID AS $$
DECLARE
  selected_dj_id UUID;
BEGIN
  -- Select DJ with most activity (shows + tips) who hasn't been featured recently
  SELECT d.id INTO selected_dj_id
  FROM djs d
  LEFT JOIN dj_of_the_day dotd ON d.id = dotd.dj_id AND dotd.featured_date > CURRENT_DATE - INTERVAL '30 days'
  WHERE d.is_banned = false
    AND d.is_verified = true
    AND dotd.id IS NULL
  ORDER BY d.total_shows DESC, d.total_listeners DESC
  LIMIT 1;

  -- If no verified DJ found, get any active DJ
  IF selected_dj_id IS NULL THEN
    SELECT d.id INTO selected_dj_id
    FROM djs d
    LEFT JOIN dj_of_the_day dotd ON d.id = dotd.dj_id AND dotd.featured_date > CURRENT_DATE - INTERVAL '7 days'
    WHERE d.is_banned = false
      AND dotd.id IS NULL
      AND d.total_shows > 0
    ORDER BY d.total_shows DESC
    LIMIT 1;
  END IF;

  RETURN selected_dj_id;
END;
$$ LANGUAGE plpgsql;

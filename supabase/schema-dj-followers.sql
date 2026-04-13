-- DJ Followers table
-- Tracks which wallets follow which DJs on baseFM

CREATE TABLE IF NOT EXISTS dj_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID NOT NULL REFERENCES djs(id) ON DELETE CASCADE,
  follower_wallet TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dj_id, follower_wallet)
);

CREATE INDEX IF NOT EXISTS idx_dj_followers_dj_id ON dj_followers(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_followers_wallet ON dj_followers(follower_wallet);

-- RLS
ALTER TABLE dj_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DJ followers are viewable by all" ON dj_followers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can follow a DJ" ON dj_followers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can unfollow a DJ" ON dj_followers
  FOR DELETE USING (true);

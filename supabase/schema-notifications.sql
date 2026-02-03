-- Favorites table - users following DJs
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  dj_id UUID NOT NULL REFERENCES djs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, dj_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_wallet ON favorites(wallet_address);
CREATE INDEX IF NOT EXISTS idx_favorites_dj ON favorites(dj_id);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_wallet ON push_subscriptions(wallet_address);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Users can add favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove favorites" ON favorites FOR DELETE USING (true);

CREATE POLICY "Users can manage push subscriptions" ON push_subscriptions FOR ALL USING (true);

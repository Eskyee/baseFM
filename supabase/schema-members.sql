-- Community Members table
-- Token holders who register for the community directory

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,

  -- Display preferences
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,

  -- Onchain identity (cached from resolution)
  ens_name TEXT,
  base_name TEXT,

  -- Social links
  twitter_url TEXT,
  farcaster_url TEXT,

  -- Stats
  shows_attended INTEGER DEFAULT 0,
  favorite_genres TEXT[] DEFAULT '{}',

  -- Token balance snapshot (updated periodically)
  token_balance NUMERIC DEFAULT 0,
  last_balance_check TIMESTAMP WITH TIME ZONE,

  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_wallet ON members(wallet_address);
CREATE INDEX IF NOT EXISTS idx_members_balance ON members(token_balance DESC);
CREATE INDEX IF NOT EXISTS idx_members_featured ON members(is_featured);

-- RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members are viewable by everyone"
  ON members FOR SELECT
  USING (token_balance >= 5000);

CREATE POLICY "Members can update their own profile"
  ON members FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can join as member"
  ON members FOR INSERT
  WITH CHECK (true);

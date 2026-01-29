-- DJ Profiles table
CREATE TABLE IF NOT EXISTS djs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  genres TEXT[] DEFAULT '{}',

  -- Social links
  twitter_url TEXT,
  instagram_url TEXT,
  soundcloud_url TEXT,
  mixcloud_url TEXT,
  website_url TEXT,

  -- Status
  is_resident BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,

  -- Stats (updated via triggers or cron)
  total_shows INTEGER DEFAULT 0,
  total_listeners INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_djs_wallet_address ON djs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_djs_slug ON djs(slug);
CREATE INDEX IF NOT EXISTS idx_djs_is_resident ON djs(is_resident);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_djs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER djs_updated_at
  BEFORE UPDATE ON djs
  FOR EACH ROW
  EXECUTE FUNCTION update_djs_updated_at();

-- Enable RLS
ALTER TABLE djs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "DJs are viewable by everyone"
  ON djs FOR SELECT
  USING (NOT is_banned);

CREATE POLICY "DJs can update their own profile"
  ON djs FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can create a DJ profile"
  ON djs FOR INSERT
  WITH CHECK (true);

-- Events table for community events and parties
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,

  -- Date & Time
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  display_date TEXT NOT NULL,

  -- Location
  venue TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,

  -- Media
  image_url TEXT,
  cover_image_url TEXT,

  -- Details
  headliners TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  genres TEXT[] DEFAULT '{}',
  ticket_url TEXT,
  ticket_price TEXT,

  -- Relationships
  promoter_id UUID REFERENCES promoters(id) ON DELETE SET NULL,
  created_by_wallet TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promoters/Collectives table
CREATE TABLE IF NOT EXISTS promoters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,

  -- Media
  logo_url TEXT,
  cover_image_url TEXT,

  -- Contact & Links
  email TEXT,
  website_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  farcaster_url TEXT,

  -- Location
  city TEXT,
  country TEXT,

  -- Type
  type TEXT DEFAULT 'promoter' CHECK (type IN ('promoter', 'collective', 'venue', 'label', 'organization')),
  genres TEXT[] DEFAULT '{}',

  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,

  -- Stats
  total_events INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event artists/DJs junction table
CREATE TABLE IF NOT EXISTS event_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  dj_id UUID REFERENCES djs(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'performer' CHECK (role IN ('headliner', 'performer', 'resident', 'special_guest')),
  set_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, dj_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_promoter_id ON events(promoter_id);
CREATE INDEX IF NOT EXISTS idx_promoters_slug ON promoters(slug);
CREATE INDEX IF NOT EXISTS idx_promoters_wallet ON promoters(wallet_address);
CREATE INDEX IF NOT EXISTS idx_event_artists_event ON event_artists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_artists_dj ON event_artists(dj_id);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

CREATE OR REPLACE FUNCTION update_promoters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promoters_updated_at
  BEFORE UPDATE ON promoters
  FOR EACH ROW
  EXECUTE FUNCTION update_promoters_updated_at();

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Approved events are viewable by everyone"
  ON events FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Anyone can submit events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Event creators can update their pending events"
  ON events FOR UPDATE
  USING (status = 'pending');

-- RLS Policies for promoters
CREATE POLICY "Non-banned promoters are viewable by everyone"
  ON promoters FOR SELECT
  USING (NOT is_banned);

CREATE POLICY "Anyone can create a promoter profile"
  ON promoters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Promoters can update their own profile"
  ON promoters FOR UPDATE
  USING (true);

-- RLS Policies for event_artists
CREATE POLICY "Event artists are viewable by everyone"
  ON event_artists FOR SELECT
  USING (true);

CREATE POLICY "Event creators can manage artists"
  ON event_artists FOR ALL
  USING (true);

-- Function to increment promoter event count
CREATE OR REPLACE FUNCTION increment_promoter_events(promoter_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE promoters
  SET total_events = total_events + 1
  WHERE id = promoter_uuid;
END;
$$ LANGUAGE plpgsql;

-- Event Crew Management Schema
-- For coordinating promoters, door staff, artists, and production crew

-- Crew roles for events (comprehensive festival production)
CREATE TYPE crew_role AS ENUM (
  -- Management
  'promoter',           -- Event owner/organizer
  'production_manager', -- Overall production lead
  'stage_manager',      -- Stage coordination
  'event_coordinator',  -- General coordination

  -- Front of House
  'door',               -- Door/ticket scanning
  'box_office',         -- Ticket sales on-site
  'vip_host',           -- VIP area management
  'cloakroom',          -- Coat check

  -- Security & Safety
  'security',           -- Security team
  'medical',            -- First aid/paramedic
  'fire_marshal',       -- Fire safety

  -- Technical - Audio
  'sound_engineer',     -- FOH sound
  'monitor_engineer',   -- Stage monitors
  'audio_tech',         -- Audio technician

  -- Technical - Visual
  'lighting_tech',      -- Lighting operator
  'visual_tech',        -- VJ/video
  'laser_tech',         -- Laser operator

  -- Stage & Build
  'stage_build',        -- Stage construction
  'rigging',            -- Rigging crew
  'backline',           -- Backline/equipment
  'decor',              -- Decoration/theming

  -- Artists & Talent
  'artist',             -- Performing DJ/artist
  'manager',            -- Artist manager
  'talent_liaison',     -- Artist hospitality

  -- Hospitality
  'bar',                -- Bar staff
  'catering',           -- Food service
  'hospitality',        -- Green room/backstage

  -- Operations
  'runner',             -- General runner
  'transport',          -- Artist transport
  'parking',            -- Parking crew
  'cleaning',           -- Cleaning crew

  -- Media & Promo
  'media',              -- Photographer/videographer
  'marketing',          -- Promo team
  'social_media',       -- Live social coverage

  -- Misc
  'volunteer',          -- Volunteer staff
  'other'               -- Other roles
);

-- Event crew members
CREATE TABLE IF NOT EXISTS event_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  role crew_role NOT NULL DEFAULT 'door',
  name TEXT,                              -- Display name for crew member
  contact TEXT,                           -- Phone/Telegram/Discord handle
  set_time TIMESTAMPTZ,                   -- For artists: scheduled performance time
  set_duration_minutes INTEGER,           -- For artists: set length
  checked_in BOOLEAN DEFAULT false,       -- Has crew member arrived
  checked_in_at TIMESTAMPTZ,
  notes TEXT,                             -- Internal notes
  added_by TEXT NOT NULL,                 -- Wallet of who added them
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, wallet_address)        -- One entry per wallet per event
);

-- Crew notifications log
CREATE TABLE IF NOT EXISTS crew_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,        -- 'doors_open', 'artist_arriving', 'milestone', etc.
  message TEXT NOT NULL,
  sent_to_roles crew_role[],              -- Which roles received this
  sent_via TEXT[] DEFAULT '{}',           -- ['push', 'slack', 'sms']
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by TEXT                            -- Wallet of sender
);

-- Event stats snapshots (for live dashboard)
CREATE TABLE IF NOT EXISTS event_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tickets_sold INTEGER DEFAULT 0,
  tickets_scanned INTEGER DEFAULT 0,
  revenue_usdc DECIMAL(12, 2) DEFAULT 0,
  current_capacity INTEGER DEFAULT 0,     -- People currently inside
  snapshot_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_stats ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_event_crew_event ON event_crew(event_id);
CREATE INDEX idx_event_crew_wallet ON event_crew(wallet_address);
CREATE INDEX idx_event_crew_role ON event_crew(role);
CREATE INDEX idx_crew_notifications_event ON crew_notifications(event_id);
CREATE INDEX idx_event_stats_event ON event_stats(event_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE event_crew;
ALTER PUBLICATION supabase_realtime ADD TABLE event_stats;

-- Helper view: Get crew with check-in status for an event
CREATE OR REPLACE VIEW event_crew_status AS
SELECT
  ec.*,
  e.title as event_title,
  e.date as event_date,
  CASE
    WHEN ec.role = 'artist' AND ec.set_time IS NOT NULL
    THEN ec.set_time - NOW()
    ELSE NULL
  END as time_until_set
FROM event_crew ec
JOIN events e ON e.id = ec.event_id;

-- Relay destinations for the baseFM Distribution panel.
-- A relay is anywhere baseFM's master feed gets pushed to (the station's own
-- player, basefm.space embeds, optional YouTube / Twitch endpoints, etc).
-- We do NOT store any RTMP push keys here — those live in encoder configs
-- only — we only track the discoverability + health surface.

CREATE TABLE IF NOT EXISTS relays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,           -- stable identifier, e.g. 'origin', 'basefm-space', 'youtube'
  name TEXT NOT NULL,                 -- human label
  type TEXT NOT NULL,                 -- 'origin' | 'first-party' | 'youtube' | 'other'
  required BOOLEAN NOT NULL DEFAULT FALSE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'healthy' | 'pending' | 'degraded' | 'failed' | 'offline'
  viewer_url TEXT,                    -- where listeners can watch the relay
  probe_url TEXT,                     -- optional explicit probe target (defaults to viewer_url)
  last_healthy_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  last_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relays_status ON relays(status);
CREATE INDEX IF NOT EXISTS idx_relays_type ON relays(type);

-- Seed the canonical relays the Distribution panel expects.
INSERT INTO relays (key, name, type, required, enabled, status)
VALUES
  ('origin',        'Mux Origin',       'origin',      TRUE,  TRUE, 'pending'),
  ('basefm-space',  'basefm.space',     'first-party', TRUE,  TRUE, 'pending')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security: relays are public read; only service role writes.
ALTER TABLE relays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "relays_public_read" ON relays;
CREATE POLICY "relays_public_read" ON relays
  FOR SELECT USING (true);

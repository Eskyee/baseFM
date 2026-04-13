-- Co-DJ / B2B show schema for baseFM
CREATE TABLE IF NOT EXISTS co_shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id text NOT NULL,
  host_wallet text NOT NULL,
  host_name text NOT NULL,
  co_dj_wallet text,
  co_dj_name text,
  invite_code text UNIQUE NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 8),
  status text NOT NULL DEFAULT 'pending',
  mux_stream_key text,
  mux_rtmp_url text,
  mux_playback_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE TABLE IF NOT EXISTS co_show_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  co_show_id uuid REFERENCES co_shows(id) ON DELETE CASCADE,
  sender_wallet text NOT NULL,
  sender_name text NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'listener',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_co_shows_stream_id ON co_shows(stream_id);
CREATE INDEX IF NOT EXISTS idx_co_shows_invite_code ON co_shows(invite_code);
CREATE INDEX IF NOT EXISTS idx_co_shows_status ON co_shows(status);
CREATE INDEX IF NOT EXISTS idx_co_show_messages_co_show_id ON co_show_messages(co_show_id, created_at DESC);

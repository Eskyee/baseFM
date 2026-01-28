-- baseFM Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STREAMS TABLE
-- ============================================
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  dj_name TEXT NOT NULL,
  dj_wallet_address TEXT NOT NULL,

  -- Streaming
  status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'PREPARING', 'LIVE', 'ENDING', 'ENDED')),
  mux_live_stream_id TEXT,
  mux_stream_key TEXT,
  mux_playback_id TEXT,
  rtmp_url TEXT,
  hls_playback_url TEXT,

  -- Scheduling
  scheduled_start_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Token Gating
  is_gated BOOLEAN DEFAULT FALSE,
  required_token_address TEXT,
  required_token_amount NUMERIC,

  -- Metadata
  cover_image_url TEXT,
  genre TEXT,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_wallet_address CHECK (dj_wallet_address ~* '^0x[a-fA-F0-9]{40}$')
);

-- ============================================
-- STREAM ACTIVITY TABLE (for analytics)
-- ============================================
CREATE TABLE stream_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('STREAM_STARTED', 'STREAM_ENDED', 'LISTENER_JOINED', 'LISTENER_LEFT')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_streams_status ON streams(status);
CREATE INDEX idx_streams_dj_wallet ON streams(dj_wallet_address);
CREATE INDEX idx_streams_created_at ON streams(created_at DESC);
CREATE INDEX idx_streams_is_gated ON streams(is_gated);
CREATE INDEX idx_stream_activity_stream_id ON stream_activity(stream_id);
CREATE INDEX idx_stream_activity_created_at ON stream_activity(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_activity ENABLE ROW LEVEL SECURITY;

-- Public read access for streams
CREATE POLICY "Public read access" ON streams
  FOR SELECT
  USING (true);

-- Public insert/update (in production, you'd want more restrictive policies)
CREATE POLICY "Public insert access" ON streams
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access" ON streams
  FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access" ON streams
  FOR DELETE
  USING (true);

-- Public access for stream_activity
CREATE POLICY "Public read access" ON stream_activity
  FOR SELECT
  USING (true);

CREATE POLICY "Public insert access" ON stream_activity
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_streams_updated_at
  BEFORE UPDATE ON streams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Get listener count for a stream
CREATE OR REPLACE FUNCTION get_listener_count(stream_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  join_count INTEGER;
  leave_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO join_count
  FROM stream_activity
  WHERE stream_id = stream_uuid AND event_type = 'LISTENER_JOINED';

  SELECT COUNT(*) INTO leave_count
  FROM stream_activity
  WHERE stream_id = stream_uuid AND event_type = 'LISTENER_LEFT';

  RETURN GREATEST(join_count - leave_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- Live streams view
CREATE VIEW live_streams AS
SELECT * FROM streams
WHERE status = 'LIVE'
ORDER BY actual_start_time DESC;

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE streams;
ALTER PUBLICATION supabase_realtime ADD TABLE stream_activity;

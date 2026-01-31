-- Chat Moderation Schema for baseFM
-- Run this in Supabase SQL Editor

-- Add deleted column to chat_messages if not exists
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add viewer tracking columns to streams if not exists
ALTER TABLE streams
ADD COLUMN IF NOT EXISTS viewer_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS peak_viewers INTEGER DEFAULT 0;

-- Create chat_bans table for timeouts and bans
CREATE TABLE IF NOT EXISTS chat_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  banned_by TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('timeout', 'ban')),
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, wallet_address)
);

-- Create index for fast ban lookups
CREATE INDEX IF NOT EXISTS idx_chat_bans_stream_wallet
ON chat_bans(stream_id, wallet_address);

CREATE INDEX IF NOT EXISTS idx_chat_bans_expires
ON chat_bans(expires_at)
WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE chat_bans ENABLE ROW LEVEL SECURITY;

-- Policies for chat_bans
CREATE POLICY "Anyone can check bans"
  ON chat_bans FOR SELECT
  USING (true);

CREATE POLICY "Stream owners can manage bans"
  ON chat_bans FOR ALL
  USING (true);

-- Create view for active bans (excludes expired timeouts)
CREATE OR REPLACE VIEW active_chat_bans AS
SELECT *
FROM chat_bans
WHERE type = 'ban'
   OR (type = 'timeout' AND expires_at > NOW());

-- Function to clean up expired timeouts (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_timeouts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_bans
  WHERE type = 'timeout'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON chat_bans TO authenticated;
GRANT ALL ON chat_bans TO service_role;
GRANT SELECT ON active_chat_bans TO authenticated;
GRANT SELECT ON active_chat_bans TO anon;

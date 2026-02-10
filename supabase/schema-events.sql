-- ============================================================
-- baseFM Event System — Supabase Schema
-- Tables: events, access_tokens, mint_logs
--
-- Run this in your Supabase SQL editor or via CLI:
--   supabase db push
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- EVENTS TABLE
-- Matches types/event.ts → Event type
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  max_supply INTEGER NOT NULL DEFAULT 100,
  minted INTEGER NOT NULL DEFAULT 0,
  nft_contract TEXT,                    -- 0x... address or NULL
  nft_type TEXT NOT NULL DEFAULT 'ERC721' CHECK (nft_type IN ('ERC721', 'ERC1155')),
  artist_address TEXT,                  -- 0x... address or NULL
  revenue_split_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT events_supply_check CHECK (minted <= max_supply),
  CONSTRAINT events_time_check CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

-- ============================================================
-- ACCESS TOKENS TABLE
-- Matches types/event.ts → AccessToken type
-- Represents a wallet's access pass for an event
-- ============================================================
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,                 -- lowercase 0x... address
  token_id TEXT,                        -- onchain token ID if minted
  issued_at BIGINT NOT NULL,            -- unix timestamp
  expires_at BIGINT,                    -- unix timestamp or NULL for no expiry
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One active (non-consumed) access per wallet per event
  CONSTRAINT unique_active_access UNIQUE (event_id, wallet)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_access_tokens_event ON access_tokens(event_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_wallet ON access_tokens(wallet);
CREATE INDEX IF NOT EXISTS idx_access_tokens_lookup ON access_tokens(event_id, wallet, consumed);

-- ============================================================
-- MINT LOGS TABLE
-- Tracks all onchain mint operations
-- ============================================================
CREATE TABLE IF NOT EXISTS mint_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,                 -- lowercase 0x... address
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  tx_hash TEXT NOT NULL,
  timestamp BIGINT NOT NULL,            -- unix timestamp
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mint_logs_wallet ON mint_logs(wallet);
CREATE INDEX IF NOT EXISTS idx_mint_logs_event ON mint_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_mint_logs_status ON mint_logs(status);
CREATE INDEX IF NOT EXISTS idx_mint_logs_tx ON mint_logs(tx_hash);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS but allow service role full access
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE mint_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for active events
CREATE POLICY "Anyone can read active events"
  ON events FOR SELECT
  USING (status = 'active');

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role full access on events"
  ON events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on access_tokens"
  ON access_tokens FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on mint_logs"
  ON mint_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Users can read their own access tokens
CREATE POLICY "Users can read own access tokens"
  ON access_tokens FOR SELECT
  USING (true);

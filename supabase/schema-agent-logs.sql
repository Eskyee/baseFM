-- ============================================================
-- Agent Logs Schema (Bankr Compatibility)
--
-- This extends the trading tables to support the full Bankr
-- agent workflow: Scan → Decide → Execute → Balance
--
-- Based on Bankr documentation:
-- https://docs.bankr.bot
-- ============================================================

-- Ensure trading_logs has metadata column for Bankr data
ALTER TABLE trading_logs
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add index on metadata for JSONB queries
CREATE INDEX IF NOT EXISTS idx_trading_logs_metadata
ON trading_logs USING GIN (metadata);

-- Add amount columns to trades if not present
ALTER TABLE trading_trades
ADD COLUMN IF NOT EXISTS amount_in NUMERIC,
ADD COLUMN IF NOT EXISTS amount_out NUMERIC,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- ============================================================
-- Agent Activity Log (alternative to trading_logs)
-- For comprehensive agent tracking across all actions
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT,  -- Optional: link to specific agent
  type TEXT NOT NULL CHECK (type IN (
    'scan',
    'decide',
    'execute',
    'balance',
    'trade',
    'response',
    'analysis',
    'error',
    'balance_update',
    'scanning',
    'system'
  )),
  content TEXT NOT NULL,
  metadata JSONB,
  prompt TEXT,  -- Original prompt sent to Bankr
  response TEXT,  -- Full response from Bankr
  job_id TEXT,  -- Bankr job ID for tracing
  tx_hash TEXT,  -- Transaction hash if trade executed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for agent_logs
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_type ON agent_logs(type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_job_id ON agent_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_tx_hash ON agent_logs(tx_hash);

-- ============================================================
-- Agent Sessions
-- Track trading cycles and their outcomes
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  scan_response TEXT,
  decision JSONB,
  tx_hash TEXT,
  balance_before JSONB,
  balance_after JSONB,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_started_at ON agent_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);

-- ============================================================
-- Token Picks
-- Store parsed token picks from Bankr scans
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_token_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  conviction TEXT NOT NULL CHECK (conviction IN ('high', 'medium', 'low')),
  is_tradable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_token_picks_session ON agent_token_picks(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_token_picks_token ON agent_token_picks(token);

-- ============================================================
-- RLS Policies
-- ============================================================

-- Enable RLS
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_token_picks ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to agent_logs"
  ON agent_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to agent_sessions"
  ON agent_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to agent_token_picks"
  ON agent_token_picks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow anon read access for dashboard
CREATE POLICY "Anon can read agent_logs"
  ON agent_logs
  FOR SELECT
  USING (true);

CREATE POLICY "Anon can read agent_sessions"
  ON agent_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Anon can read agent_token_picks"
  ON agent_token_picks
  FOR SELECT
  USING (true);

-- ============================================================
-- Trading Tables Schema
-- For tracking trading agent activity
-- ============================================================

-- Trading trades table
CREATE TABLE IF NOT EXISTS trading_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  amount_in NUMERIC,
  amount_out NUMERIC,
  tx_hash TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trading logs table (activity feed)
CREATE TABLE IF NOT EXISTS trading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('trade', 'response', 'analysis', 'error', 'balance_update', 'scanning', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trading balances snapshot table (optional - for historical tracking)
CREATE TABLE IF NOT EXISTS trading_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_usd NUMERIC NOT NULL DEFAULT 0,
  breakdown JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trading_trades_created_at ON trading_trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_trades_status ON trading_trades(status);
CREATE INDEX IF NOT EXISTS idx_trading_logs_created_at ON trading_logs(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_trading_logs_type ON trading_logs(type);

-- Update trigger for trading_trades
CREATE OR REPLACE FUNCTION update_trading_trades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trading_trades_updated_at ON trading_trades;
CREATE TRIGGER trading_trades_updated_at
  BEFORE UPDATE ON trading_trades
  FOR EACH ROW
  EXECUTE FUNCTION update_trading_trades_updated_at();

-- RLS Policies (enable if needed)
-- ALTER TABLE trading_trades ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trading_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trading_balances ENABLE ROW LEVEL SECURITY;

-- Grant access for service role (API routes use service role key)
-- GRANT ALL ON trading_trades TO service_role;
-- GRANT ALL ON trading_logs TO service_role;
-- GRANT ALL ON trading_balances TO service_role;

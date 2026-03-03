-- Trading Agent System
-- Tables for autonomous trading bot activity tracking (inspired by Bankr)

-- Trading activity logs
CREATE TABLE IF NOT EXISTS trading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Agent reference
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

  -- Log type
  type TEXT NOT NULL CHECK (type IN ('prompt', 'response', 'trade', 'error', 'balance_update', 'analysis', 'scanning', 'system')),

  -- Log content
  content TEXT NOT NULL,

  -- Raw data (JSON for structured info)
  raw_data JSONB,

  -- Job tracking
  job_id TEXT,
  thread_id TEXT
);

-- Trades table
CREATE TABLE IF NOT EXISTS trading_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Agent reference
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

  -- Trade details
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  amount_in TEXT NOT NULL,
  amount_out TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),

  -- Job reference
  job_id TEXT,

  -- Blockchain data
  tx_hash TEXT,

  -- Raw response from trading API
  raw_response JSONB
);

-- Portfolio balances table
CREATE TABLE IF NOT EXISTS trading_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Agent reference
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

  -- Total USD value
  total_usd NUMERIC NOT NULL DEFAULT 0,

  -- Token breakdown (JSON: { "USDC": 100, "ETH": 50, ... })
  breakdown JSONB DEFAULT '{}'
);

-- Indexes for trading_logs
CREATE INDEX IF NOT EXISTS idx_trading_logs_agent ON trading_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_trading_logs_created ON trading_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_trading_logs_type ON trading_logs(type);
CREATE INDEX IF NOT EXISTS idx_trading_logs_job ON trading_logs(job_id);

-- Indexes for trading_trades
CREATE INDEX IF NOT EXISTS idx_trading_trades_agent ON trading_trades(agent_id);
CREATE INDEX IF NOT EXISTS idx_trading_trades_created ON trading_trades(created_at);
CREATE INDEX IF NOT EXISTS idx_trading_trades_status ON trading_trades(status);
CREATE INDEX IF NOT EXISTS idx_trading_trades_tx ON trading_trades(tx_hash);

-- Indexes for trading_balances
CREATE INDEX IF NOT EXISTS idx_trading_balances_agent ON trading_balances(agent_id);
CREATE INDEX IF NOT EXISTS idx_trading_balances_created ON trading_balances(created_at);

-- RLS
ALTER TABLE trading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_balances ENABLE ROW LEVEL SECURITY;

-- Read policies (logs are viewable by everyone for live feed)
CREATE POLICY "Trading logs are viewable by everyone" ON trading_logs FOR SELECT USING (true);
CREATE POLICY "Trading trades are viewable by everyone" ON trading_trades FOR SELECT USING (true);
CREATE POLICY "Trading balances are viewable by everyone" ON trading_balances FOR SELECT USING (true);

-- Insert policies (only service role can insert - agent backend)
CREATE POLICY "Service role can insert logs" ON trading_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert trades" ON trading_trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert balances" ON trading_balances FOR INSERT WITH CHECK (true);

-- Update policies (only service role can update)
CREATE POLICY "Service role can update trades" ON trading_trades FOR UPDATE USING (true);

-- Enable Realtime for live feeds
ALTER PUBLICATION supabase_realtime ADD TABLE trading_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE trading_trades;
ALTER PUBLICATION supabase_realtime ADD TABLE trading_balances;

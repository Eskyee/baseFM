-- Billing and platform fee tracking for streaming, subscriptions, and revenue splits

CREATE TABLE IF NOT EXISTS dj_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  plan_code TEXT NOT NULL DEFAULT 'monthly_pro',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  amount_usdc DECIMAL(10, 2) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL,
  platform_wallet TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dj_subscriptions_wallet ON dj_subscriptions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_dj_subscriptions_status ON dj_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_dj_subscriptions_ends_at ON dj_subscriptions(ends_at);

CREATE TABLE IF NOT EXISTS stream_billing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID UNIQUE REFERENCES streams(id) ON DELETE CASCADE,
  dj_wallet_address TEXT NOT NULL,
  subscription_id UUID REFERENCES dj_subscriptions(id) ON DELETE SET NULL,
  session_fee_usdc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  metered_rate_usdc_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 0,
  metered_fee_usdc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_fee_usdc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  session_fee_status TEXT NOT NULL DEFAULT 'pending' CHECK (session_fee_status IN ('pending', 'paid', 'waived')),
  metered_fee_status TEXT NOT NULL DEFAULT 'pending' CHECK (metered_fee_status IN ('pending', 'paid', 'waived')),
  session_tx_hash TEXT,
  metered_tx_hash TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  platform_wallet TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_billing_sessions_wallet ON stream_billing_sessions(dj_wallet_address);
CREATE INDEX IF NOT EXISTS idx_stream_billing_sessions_fee_status ON stream_billing_sessions(session_fee_status, metered_fee_status);

CREATE TABLE IF NOT EXISTS platform_fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('tip', 'ticket', 'stream_session', 'stream_metered', 'subscription')),
  source_id TEXT NOT NULL,
  payer_wallet TEXT,
  recipient_wallet TEXT,
  platform_wallet TEXT NOT NULL,
  token_symbol TEXT NOT NULL DEFAULT 'USDC',
  token_address TEXT,
  gross_amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
  platform_fee_amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
  net_amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'accrued' CHECK (status IN ('accrued', 'paid', 'waived')),
  tx_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_fee_records_source ON platform_fee_records(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_platform_fee_records_status ON platform_fee_records(status);
CREATE INDEX IF NOT EXISTS idx_platform_fee_records_created_at ON platform_fee_records(created_at);

CREATE OR REPLACE FUNCTION update_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dj_subscriptions_updated_at ON dj_subscriptions;
CREATE TRIGGER dj_subscriptions_updated_at
  BEFORE UPDATE ON dj_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

DROP TRIGGER IF EXISTS stream_billing_sessions_updated_at ON stream_billing_sessions;
CREATE TRIGGER stream_billing_sessions_updated_at
  BEFORE UPDATE ON stream_billing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_updated_at();

ALTER TABLE dj_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_billing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_fee_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access dj subscriptions"
  ON dj_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access stream billing"
  ON stream_billing_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access platform fee records"
  ON platform_fee_records FOR ALL
  USING (true)
  WITH CHECK (true);

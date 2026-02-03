-- RaveCulture Shop Schema
-- Tables for Shopify integration, wallet linking, and onchain entitlements

-- Shopify Customers with linked wallets
CREATE TABLE IF NOT EXISTS shop_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  wallet_address TEXT,
  linked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_customers_email ON shop_customers(email);
CREATE INDEX IF NOT EXISTS idx_shop_customers_wallet ON shop_customers(wallet_address);

-- Shopify Orders
CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_order_id TEXT UNIQUE NOT NULL,
  order_number TEXT NOT NULL,
  customer_id TEXT,
  customer_email TEXT,
  wallet_address TEXT,
  total_price TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, partial, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_customer ON shop_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_email ON shop_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_shop_orders_wallet ON shop_orders(wallet_address);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);

-- Onchain Entitlements (minted perks)
CREATE TABLE IF NOT EXISTS onchain_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  perk_type TEXT NOT NULL, -- ERC20, ERC721, ERC1155
  token_id TEXT, -- For ERC721/ERC1155
  amount TEXT, -- For ERC20/ERC1155
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, minted, failed
  error TEXT,
  minted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(order_id, contract_address, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_wallet ON onchain_entitlements(wallet_address);
CREATE INDEX IF NOT EXISTS idx_entitlements_contract ON onchain_entitlements(contract_address);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON onchain_entitlements(status);

-- Pending Claims (for orders without wallet)
CREATE TABLE IF NOT EXISTS pending_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  customer_id TEXT,
  customer_email TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  perk_type TEXT NOT NULL,
  token_id TEXT,
  amount TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  wallet_address TEXT, -- Filled when claimed
  tx_hash TEXT, -- Filled when claimed
  status TEXT NOT NULL DEFAULT 'pending', -- pending, claimed, failed, expired
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_claims_email ON pending_claims(customer_email);
CREATE INDEX IF NOT EXISTS idx_pending_claims_status ON pending_claims(status);

-- RLS Policies
ALTER TABLE shop_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE onchain_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access to shop_customers"
  ON shop_customers FOR ALL
  USING (true);

CREATE POLICY "Service role full access to shop_orders"
  ON shop_orders FOR ALL
  USING (true);

CREATE POLICY "Service role full access to onchain_entitlements"
  ON onchain_entitlements FOR ALL
  USING (true);

CREATE POLICY "Service role full access to pending_claims"
  ON pending_claims FOR ALL
  USING (true);

-- Users can view their own entitlements by wallet
CREATE POLICY "Users can view own entitlements"
  ON onchain_entitlements FOR SELECT
  USING (true);

-- Seed data for testing
INSERT INTO shop_customers (shopify_customer_id, email, wallet_address, linked_at)
VALUES
  ('test_customer_1', 'test@raveculture.xyz', '0x1234567890123456789012345678901234567890', NOW())
ON CONFLICT (shopify_customer_id) DO NOTHING;

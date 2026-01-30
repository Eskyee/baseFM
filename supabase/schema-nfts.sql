-- Show NFTs table
-- Track NFTs minted from show recordings

CREATE TABLE IF NOT EXISTS show_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Show reference
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,

  -- DJ who created
  dj_wallet TEXT NOT NULL,
  dj_id UUID REFERENCES djs(id) ON DELETE SET NULL,

  -- NFT details
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  animation_url TEXT, -- Mux playback URL

  -- On-chain details
  contract_address TEXT,
  token_id TEXT,
  mint_tx_hash TEXT,

  -- Mint configuration
  max_supply INTEGER DEFAULT 100,
  mint_price_wei TEXT DEFAULT '0',
  is_free BOOLEAN DEFAULT true,

  -- Stats
  total_minted INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'minting', 'live', 'sold_out')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mint records
CREATE TABLE IF NOT EXISTS nft_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID NOT NULL REFERENCES show_nfts(id) ON DELETE CASCADE,
  minter_wallet TEXT NOT NULL,
  token_id TEXT,
  tx_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_show_nfts_stream ON show_nfts(stream_id);
CREATE INDEX IF NOT EXISTS idx_show_nfts_dj ON show_nfts(dj_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_nft ON nft_mints(nft_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_minter ON nft_mints(minter_wallet);

-- RLS
ALTER TABLE show_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_mints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NFTs are viewable by everyone" ON show_nfts FOR SELECT USING (status != 'draft');
CREATE POLICY "DJs can create NFTs" ON show_nfts FOR INSERT WITH CHECK (true);
CREATE POLICY "DJs can update own NFTs" ON show_nfts FOR UPDATE USING (true);

CREATE POLICY "Mints are viewable" ON nft_mints FOR SELECT USING (true);
CREATE POLICY "Anyone can mint" ON nft_mints FOR INSERT WITH CHECK (true);

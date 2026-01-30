-- Tips/Donations table
-- Track all tips sent to DJs

CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sender
  sender_wallet TEXT NOT NULL,
  sender_name TEXT,

  -- Recipient DJ
  recipient_wallet TEXT NOT NULL,
  dj_id UUID REFERENCES djs(id) ON DELETE SET NULL,

  -- Transaction details
  amount_wei TEXT NOT NULL,
  amount_eth NUMERIC NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL,

  -- Optional stream (if tipped during live)
  stream_id UUID REFERENCES streams(id) ON DELETE SET NULL,

  -- Optional message
  message TEXT,

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tips_sender ON tips(sender_wallet);
CREATE INDEX IF NOT EXISTS idx_tips_recipient ON tips(recipient_wallet);
CREATE INDEX IF NOT EXISTS idx_tips_dj ON tips(dj_id);
CREATE INDEX IF NOT EXISTS idx_tips_stream ON tips(stream_id);
CREATE INDEX IF NOT EXISTS idx_tips_tx ON tips(tx_hash);

-- RLS
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tips are viewable by everyone" ON tips FOR SELECT USING (true);
CREATE POLICY "Anyone can create tips" ON tips FOR INSERT WITH CHECK (true);

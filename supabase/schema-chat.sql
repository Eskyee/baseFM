-- Live Chat Messages table
-- Real-time chat for streams using Supabase Realtime

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,

  -- Message content
  message TEXT NOT NULL,

  -- Sender info (denormalized for performance)
  sender_name TEXT,
  sender_avatar TEXT,
  is_dj BOOLEAN DEFAULT false,
  is_mod BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast stream lookups
CREATE INDEX IF NOT EXISTS idx_chat_stream ON chat_messages(stream_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_wallet ON chat_messages(wallet_address);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read chat messages
CREATE POLICY "Chat messages are viewable by everyone"
  ON chat_messages FOR SELECT
  USING (true);

-- Connected wallets can send messages
CREATE POLICY "Wallets can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

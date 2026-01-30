-- Social Features: User Connections, Private Messages, Group Chats
-- Run this after schema-members.sql and schema-djs.sql

-- ============================================
-- USER CONNECTIONS (follows between users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_wallet TEXT NOT NULL,
  following_wallet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_wallet, following_wallet)
);

CREATE INDEX IF NOT EXISTS idx_connections_follower ON user_connections(follower_wallet);
CREATE INDEX IF NOT EXISTS idx_connections_following ON user_connections(following_wallet);

-- ============================================
-- CONVERSATIONS (DMs and Group Chats)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type: 'dm' for 1-on-1, 'group' for group chats
  type TEXT NOT NULL DEFAULT 'dm' CHECK (type IN ('dm', 'group')),

  -- Group info (only for type='group')
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  owner_wallet TEXT,

  -- Privacy: 'private' (invite only), 'public' (anyone can join)
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'public')),

  -- For DMs: store both participants for easy lookup
  participant_one TEXT,
  participant_two TEXT,

  -- Metadata
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_one, participant_two);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- CONVERSATION PARTICIPANTS
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,

  -- Role in group: 'owner', 'admin', 'member'
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),

  -- Notification settings
  is_muted BOOLEAN DEFAULT false,

  -- Read status
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_participants_wallet ON conversation_participants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);

-- ============================================
-- DIRECT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_wallet TEXT NOT NULL,

  -- Message content
  content TEXT NOT NULL,

  -- Optional: reply to another message
  reply_to_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,

  -- Message status
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_conversation ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_wallet);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- User connections: anyone can view, users manage their own
CREATE POLICY "Connections are viewable" ON user_connections FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON user_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unfollow" ON user_connections FOR DELETE USING (true);

-- Conversations: only participants can view
CREATE POLICY "View own conversations" ON conversations FOR SELECT USING (
  privacy = 'public' OR
  id IN (SELECT conversation_id FROM conversation_participants WHERE wallet_address = current_setting('app.current_user', true))
);
CREATE POLICY "Create conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Update own conversations" ON conversations FOR UPDATE USING (true);

-- Participants: can view if in conversation
CREATE POLICY "View participants" ON conversation_participants FOR SELECT USING (true);
CREATE POLICY "Join conversations" ON conversation_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Leave conversations" ON conversation_participants FOR DELETE USING (true);
CREATE POLICY "Update participant settings" ON conversation_participants FOR UPDATE USING (true);

-- Messages: can view if in conversation
CREATE POLICY "View messages" ON direct_messages FOR SELECT USING (true);
CREATE POLICY "Send messages" ON direct_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Edit own messages" ON direct_messages FOR UPDATE USING (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get or create DM conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_dm(wallet_a TEXT, wallet_b TEXT)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
  lower_wallet TEXT;
  higher_wallet TEXT;
BEGIN
  -- Normalize order for consistent lookup
  IF wallet_a < wallet_b THEN
    lower_wallet := wallet_a;
    higher_wallet := wallet_b;
  ELSE
    lower_wallet := wallet_b;
    higher_wallet := wallet_a;
  END IF;

  -- Check if conversation exists
  SELECT id INTO conv_id
  FROM conversations
  WHERE type = 'dm'
    AND participant_one = lower_wallet
    AND participant_two = higher_wallet;

  -- Create if not exists
  IF conv_id IS NULL THEN
    INSERT INTO conversations (type, participant_one, participant_two)
    VALUES ('dm', lower_wallet, higher_wallet)
    RETURNING id INTO conv_id;

    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, wallet_address)
    VALUES (conv_id, wallet_a), (conv_id, wallet_b);
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql;

-- Get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_wallet TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM direct_messages dm
    JOIN conversation_participants cp ON dm.conversation_id = cp.conversation_id
    WHERE cp.wallet_address = user_wallet
      AND dm.sender_wallet != user_wallet
      AND dm.created_at > cp.last_read_at
      AND dm.is_deleted = false
  );
END;
$$ LANGUAGE plpgsql;

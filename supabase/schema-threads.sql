-- Community Threads: Public posts for community engagement
-- Token-gated to RAVE holders (same as community)

-- ============================================
-- THREADS (posts)
-- ============================================
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Author
  author_wallet TEXT NOT NULL,

  -- Content
  content TEXT NOT NULL CHECK (char_length(content) <= 500),

  -- Optional media (up to 4 images)
  media_urls TEXT[] DEFAULT '{}',

  -- Optional: reply to another thread
  parent_id UUID REFERENCES threads(id) ON DELETE CASCADE,

  -- Optional: repost another thread
  repost_id UUID REFERENCES threads(id) ON DELETE SET NULL,

  -- Engagement counts (denormalized for performance)
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  repost_count INTEGER DEFAULT 0,

  -- Status
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_author ON threads(author_wallet);
CREATE INDEX IF NOT EXISTS idx_threads_parent ON threads(parent_id);
CREATE INDEX IF NOT EXISTS idx_threads_created ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_pinned ON threads(is_pinned DESC, created_at DESC);

-- ============================================
-- THREAD LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS thread_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_thread_likes_thread ON thread_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_likes_wallet ON thread_likes(wallet_address);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;

-- Threads: viewable if not deleted
CREATE POLICY "View threads" ON threads FOR SELECT USING (is_deleted = false);
CREATE POLICY "Create threads" ON threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Update own threads" ON threads FOR UPDATE USING (true);

-- Likes: all operations allowed (token gating handled in app)
CREATE POLICY "View likes" ON thread_likes FOR SELECT USING (true);
CREATE POLICY "Create likes" ON thread_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Delete likes" ON thread_likes FOR DELETE USING (true);

-- ============================================
-- TRIGGERS FOR ENGAGEMENT COUNTS
-- ============================================

-- Update like count on threads
CREATE OR REPLACE FUNCTION update_thread_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE threads SET like_count = like_count + 1 WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE threads SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_thread_like_count ON thread_likes;
CREATE TRIGGER trigger_thread_like_count
  AFTER INSERT OR DELETE ON thread_likes
  FOR EACH ROW EXECUTE FUNCTION update_thread_like_count();

-- Update reply count on parent threads
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE threads SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE threads SET reply_count = GREATEST(0, reply_count - 1) WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_thread_reply_count ON threads;
CREATE TRIGGER trigger_thread_reply_count
  AFTER INSERT OR DELETE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Update repost count
CREATE OR REPLACE FUNCTION update_thread_repost_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.repost_id IS NOT NULL THEN
    UPDATE threads SET repost_count = repost_count + 1 WHERE id = NEW.repost_id;
  ELSIF TG_OP = 'DELETE' AND OLD.repost_id IS NOT NULL THEN
    UPDATE threads SET repost_count = GREATEST(0, repost_count - 1) WHERE id = OLD.repost_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_thread_repost_count ON threads;
CREATE TRIGGER trigger_thread_repost_count
  AFTER INSERT OR DELETE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_thread_repost_count();

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE threads;
ALTER PUBLICATION supabase_realtime ADD TABLE thread_likes;

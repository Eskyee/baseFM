-- ============================================================
-- Product Learning / Self-Improvement Schema
--
-- Captures real friction signals from the product so baseFM can
-- prioritize the next fixes using actual usage pain instead of
-- guesswork.
-- ============================================================

CREATE TABLE IF NOT EXISTS product_learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
  surface TEXT NOT NULL,
  route TEXT,
  wallet_address TEXT,
  stream_id UUID REFERENCES streams(id) ON DELETE SET NULL,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_learning_events_created_at
  ON product_learning_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_learning_events_event_type
  ON product_learning_events(event_type);

CREATE INDEX IF NOT EXISTS idx_product_learning_events_surface
  ON product_learning_events(surface);

CREATE INDEX IF NOT EXISTS idx_product_learning_events_severity
  ON product_learning_events(severity);

CREATE INDEX IF NOT EXISTS idx_product_learning_events_stream_id
  ON product_learning_events(stream_id);

ALTER TABLE product_learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access product learning"
  ON product_learning_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

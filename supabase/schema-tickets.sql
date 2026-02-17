-- Event tickets - onchain ticket purchases with direct USDC payments to promoters

-- Ticket types/tiers for events
CREATE TABLE IF NOT EXISTS event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,

  -- Ticket info
  name TEXT NOT NULL DEFAULT 'General Admission',
  description TEXT,
  price_usdc DECIMAL(10, 2) NOT NULL, -- Price in USDC (e.g., 25.00)

  -- Availability
  total_quantity INTEGER, -- NULL = unlimited
  sold_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  sales_start_at TIMESTAMP WITH TIME ZONE,
  sales_end_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket purchases - records of onchain purchases
CREATE TABLE IF NOT EXISTS ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  ticket_id UUID REFERENCES event_tickets(id) ON DELETE RESTRICT,
  event_id UUID REFERENCES events(id) ON DELETE RESTRICT,

  -- Buyer info
  buyer_wallet TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Payment info
  amount_usdc DECIMAL(10, 2) NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  promoter_wallet TEXT NOT NULL, -- Where payment was sent

  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'refunded', 'cancelled')),

  -- Timestamps
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_active ON event_tickets(is_active);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_buyer ON ticket_purchases(buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_event ON ticket_purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_tx ON ticket_purchases(tx_hash);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_status ON ticket_purchases(status);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_event_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_tickets_updated_at
  BEFORE UPDATE ON event_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_event_tickets_updated_at();

-- Function to increment sold count
CREATE OR REPLACE FUNCTION increment_ticket_sold(ticket_uuid UUID, qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE event_tickets
  SET sold_count = sold_count + qty
  WHERE id = ticket_uuid;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_tickets
CREATE POLICY "Active tickets for approved events are viewable"
  ON event_tickets FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_tickets.event_id
      AND events.status = 'approved'
    )
  );

CREATE POLICY "Promoters can manage their event tickets"
  ON event_tickets FOR ALL
  USING (true);

-- RLS Policies for ticket_purchases
CREATE POLICY "Buyers can view their own purchases"
  ON ticket_purchases FOR SELECT
  USING (true); -- For now allow all reads for verification

CREATE POLICY "System can create purchases"
  ON ticket_purchases FOR INSERT
  WITH CHECK (true);

-- View for ticket availability
CREATE OR REPLACE VIEW ticket_availability AS
SELECT
  et.id,
  et.event_id,
  et.name,
  et.description,
  et.price_usdc,
  et.total_quantity,
  et.sold_count,
  CASE
    WHEN et.total_quantity IS NULL THEN true
    WHEN et.sold_count < et.total_quantity THEN true
    ELSE false
  END as is_available,
  CASE
    WHEN et.total_quantity IS NULL THEN NULL
    ELSE et.total_quantity - et.sold_count
  END as remaining,
  et.is_active,
  et.sales_start_at,
  et.sales_end_at,
  e.title as event_title,
  e.date as event_date,
  p.wallet_address as promoter_wallet,
  p.name as promoter_name
FROM event_tickets et
JOIN events e ON e.id = et.event_id
LEFT JOIN promoters p ON p.id = e.promoter_id
WHERE et.is_active = true;

-- Booking Inquiries Schema
-- Stores service booking requests from the /bookings form

CREATE TABLE IF NOT EXISTS booking_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,

  -- Service details
  service TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  budget TEXT,
  attendees TEXT,
  details TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, quoted, confirmed, completed, cancelled
  assigned_to TEXT, -- team member handling the inquiry
  notes TEXT, -- internal notes

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status ON booking_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_email ON booking_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_service ON booking_inquiries(service);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_created ON booking_inquiries(created_at DESC);

-- RLS
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- Only service role can access (internal use only)
CREATE POLICY "Service role full access to booking_inquiries"
  ON booking_inquiries FOR ALL
  USING (true);

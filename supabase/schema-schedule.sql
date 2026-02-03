-- Weekly Schedule Slots table
CREATE TABLE IF NOT EXISTS schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time slot details
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Show details
  show_name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  cover_image_url TEXT,

  -- DJ assignment (nullable for TBD slots)
  dj_id UUID REFERENCES djs(id) ON DELETE SET NULL,
  dj_wallet_address TEXT,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_schedule_day ON schedule_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON schedule_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_dj ON schedule_slots(dj_id);
CREATE INDEX IF NOT EXISTS idx_schedule_active ON schedule_slots(is_active);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_schedule_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_slots_updated_at
  BEFORE UPDATE ON schedule_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_slots_updated_at();

-- Enable RLS
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Schedule slots are viewable by everyone"
  ON schedule_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage schedule slots"
  ON schedule_slots FOR ALL
  USING (true);

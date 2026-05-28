-- Enable Supabase Realtime on the matches table
-- This allows the frontend to subscribe to live score updates
-- without polling or page refreshes

-- Add the matches table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Also add profiles table for live ranking updates
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE matches ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add minute column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'minute'
  ) THEN
    ALTER TABLE matches ADD COLUMN minute integer;
  END IF;
END $$;

-- Add status_detail column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'status_detail'
  ) THEN
    ALTER TABLE matches ADD COLUMN status_detail text;
  END IF;
END $$;

-- ============================================================
-- AUTO-TRIGGER: When a match status changes to 'finished',
-- automatically calculate points for all predictions
-- ============================================================

-- Trigger function
CREATE OR REPLACE FUNCTION on_match_finished()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when status changes TO 'finished' (not on other updates)
  IF NEW.status = 'finished' AND (OLD.status IS NULL OR OLD.status != 'finished') THEN
    -- Ensure we have scores
    IF NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
      PERFORM calculate_match_points(NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trigger_match_finished ON matches;

-- Create trigger on matches table
CREATE TRIGGER trigger_match_finished
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION on_match_finished();

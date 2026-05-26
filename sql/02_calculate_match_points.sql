-- ============================================================
-- CALCULATE MATCH POINTS: Auto-score all predictions when
-- a match finishes. Mirrors the logic in utils/points.ts
-- ============================================================

-- Phase multipliers
-- group: 1.0, round_of_32: 1.25, round_of_16: 1.5
-- quarter: 2.0, semi: 2.5, third_place: 2.0, final: 3.0

CREATE OR REPLACE FUNCTION calculate_match_points(p_match_id UUID)
RETURNS void AS $$
DECLARE
  v_match RECORD;
  v_pred RECORD;
  v_exact INTEGER;
  v_winner INTEGER;
  v_difference INTEGER;
  v_base_points INTEGER;
  v_phase NUMERIC;
  v_total INTEGER;
  v_predicted_result INTEGER;
  v_actual_result INTEGER;
  v_predicted_diff INTEGER;
  v_actual_diff INTEGER;
BEGIN
  -- Get match data
  SELECT id, home_score, away_score, stage, status
  INTO v_match
  FROM matches
  WHERE id = p_match_id;

  -- Only calculate if match is finished and has scores
  IF v_match.status != 'finished' OR v_match.home_score IS NULL OR v_match.away_score IS NULL THEN
    RAISE NOTICE 'Match % is not finished or has no scores. Skipping.', p_match_id;
    RETURN;
  END IF;

  -- Get phase multiplier
  v_phase := CASE v_match.stage
    WHEN 'group' THEN 1.0
    WHEN 'round_of_32' THEN 1.25
    WHEN 'round_of_16' THEN 1.5
    WHEN 'quarter' THEN 2.0
    WHEN 'semi' THEN 2.5
    WHEN 'third_place' THEN 2.0
    WHEN 'final' THEN 3.0
    ELSE 1.0
  END;

  -- Calculate actual result sign (-1, 0, 1)
  v_actual_result := SIGN(v_match.home_score - v_match.away_score);
  v_actual_diff := v_match.home_score - v_match.away_score;

  -- Loop through all predictions for this match
  FOR v_pred IN
    SELECT id, user_id, home_score, away_score
    FROM predictions
    WHERE match_id = p_match_id
  LOOP
    v_exact := 0;
    v_winner := 0;
    v_difference := 0;

    IF v_pred.home_score = v_match.home_score AND v_pred.away_score = v_match.away_score THEN
      -- Exact score match: 10 pts (no winner or difference added)
      v_exact := 10;
      v_base_points := v_exact;
    ELSE
      -- Check correct result (1X2)
      v_predicted_result := SIGN(v_pred.home_score - v_pred.away_score);
      IF v_predicted_result = v_actual_result THEN
        v_winner := 4;
      END IF;

      -- Check correct goal difference
      v_predicted_diff := v_pred.home_score - v_pred.away_score;
      IF v_predicted_diff = v_actual_diff THEN
        v_difference := 3;
      END IF;

      v_base_points := v_winner + v_difference;
    END IF;

    -- Apply phase multiplier
    v_total := ROUND(v_base_points * v_phase);

    -- Update prediction with earned points
    UPDATE predictions
    SET points_earned = v_total,
        updated_at = NOW()
    WHERE id = v_pred.id;
  END LOOP;

  -- Recalculate total points for all users who had predictions on this match
  UPDATE profiles
  SET total_points = COALESCE((
    SELECT SUM(points_earned)
    FROM predictions
    WHERE predictions.user_id = profiles.id
    AND predictions.points_earned IS NOT NULL
  ), 0)
  WHERE id IN (
    SELECT DISTINCT user_id
    FROM predictions
    WHERE match_id = p_match_id
  );

  RAISE NOTICE 'Points calculated for match %', p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

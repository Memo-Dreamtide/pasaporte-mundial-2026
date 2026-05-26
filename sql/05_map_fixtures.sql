-- ============================================================
-- MAP FIXTURES: Link API-Football fixture IDs to our matches
-- Matches by: home_team + away_team (via api_football_id)
-- This maps the 72 group stage fixtures automatically
-- Knockout fixtures will be mapped as they become available
-- ============================================================

-- Map matches using team api_football_id as the join key
-- This updates matches.api_football_id so our sync knows which row to update
UPDATE matches m
SET api_football_id = sub.fixture_id
FROM (
  VALUES
    -- These will be populated by the sync route automatically
    -- For now, we create a function that maps on-demand
) AS sub(fixture_id, home_api_id, away_api_id)
WHERE 1=0; -- placeholder, real mapping below

-- Better approach: Create a function that maps fixtures automatically
-- by matching home_team and away_team api_football_ids
CREATE OR REPLACE FUNCTION map_api_football_fixtures()
RETURNS TABLE(mapped INTEGER, unmapped INTEGER) AS $$
DECLARE
  v_mapped INTEGER := 0;
  v_unmapped INTEGER := 0;
  v_fixture RECORD;
BEGIN
  -- This function is called from our sync API route
  -- It expects api_football_cache to have the latest fixtures

  FOR v_fixture IN
    SELECT
      afc.fixture_id,
      afc.home_team,
      afc.away_team,
      ht.id as our_home_team_id,
      at2.id as our_away_team_id
    FROM api_football_cache afc
    LEFT JOIN teams ht ON ht.api_football_id = (afc.raw_data->'teams'->'home'->>'id')::INTEGER
    LEFT JOIN teams at2 ON at2.api_football_id = (afc.raw_data->'teams'->'away'->>'id')::INTEGER
    WHERE afc.league_id = 1  -- World Cup only
  LOOP
    IF v_fixture.our_home_team_id IS NOT NULL AND v_fixture.our_away_team_id IS NOT NULL THEN
      UPDATE matches
      SET api_football_id = v_fixture.fixture_id
      WHERE home_team_id = v_fixture.our_home_team_id
      AND away_team_id = v_fixture.our_away_team_id
      AND api_football_id IS NULL;

      IF FOUND THEN
        v_mapped := v_mapped + 1;
      END IF;
    ELSE
      v_unmapped := v_unmapped + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_mapped, v_unmapped;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create the main sync function that updates match scores from cache
CREATE OR REPLACE FUNCTION sync_matches_from_cache()
RETURNS TABLE(updated INTEGER, live INTEGER, finished INTEGER) AS $$
DECLARE
  v_updated INTEGER := 0;
  v_live INTEGER := 0;
  v_finished INTEGER := 0;
  v_cache RECORD;
  v_new_status TEXT;
BEGIN
  FOR v_cache IN
    SELECT * FROM api_football_cache
    WHERE fixture_id IN (SELECT api_football_id FROM matches WHERE api_football_id IS NOT NULL)
  LOOP
    -- Map API-Football status to our status
    v_new_status := CASE v_cache.status
      WHEN 'NS' THEN 'scheduled'
      WHEN '1H' THEN 'live'
      WHEN 'HT' THEN 'live'
      WHEN '2H' THEN 'live'
      WHEN 'ET' THEN 'live'
      WHEN 'BT' THEN 'live'
      WHEN 'P' THEN 'live'
      WHEN 'SUSP' THEN 'live'
      WHEN 'INT' THEN 'live'
      WHEN 'FT' THEN 'finished'
      WHEN 'AET' THEN 'finished'
      WHEN 'PEN' THEN 'finished'
      WHEN 'PST' THEN 'postponed'
      WHEN 'CANC' THEN 'postponed'
      WHEN 'ABD' THEN 'postponed'
      ELSE 'scheduled'
    END;

    UPDATE matches
    SET
      home_score = v_cache.home_score,
      away_score = v_cache.away_score,
      status = v_new_status,
      minute = v_cache.minute,
      status_detail = v_cache.status || COALESCE(' ' || v_cache.minute || '''', '')
    WHERE api_football_id = v_cache.fixture_id
    AND (
      -- Only update if something changed
      home_score IS DISTINCT FROM v_cache.home_score
      OR away_score IS DISTINCT FROM v_cache.away_score
      OR status IS DISTINCT FROM v_new_status
      OR minute IS DISTINCT FROM v_cache.minute
    );

    IF FOUND THEN
      v_updated := v_updated + 1;
      IF v_new_status = 'live' THEN v_live := v_live + 1; END IF;
      IF v_new_status = 'finished' THEN v_finished := v_finished + 1; END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_updated, v_live, v_finished;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

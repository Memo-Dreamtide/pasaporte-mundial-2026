-- ============================================================
-- LOCK PREDICTIONS: Server-side enforcement
-- Prevents insert/update/delete on predictions if match
-- starts in less than 1 minute or has already started
-- ============================================================

-- Step 1: Drop existing policies on predictions (if any) to rebuild clean
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can delete own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can view own predictions" ON predictions;
DROP POLICY IF EXISTS "Anyone can read predictions" ON predictions;

-- Step 2: Ensure RLS is enabled
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Step 3: SELECT — Users can read their own predictions
CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  USING (auth.uid() = user_id);

-- Step 4: INSERT — Only if match hasn't started (1 min buffer)
CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND matches.match_date > (NOW() + INTERVAL '1 minute')
      AND matches.status = 'scheduled'
    )
  );

-- Step 5: UPDATE — Only own predictions AND match hasn't started
CREATE POLICY "Users can update own predictions"
  ON predictions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
      AND matches.match_date > (NOW() + INTERVAL '1 minute')
      AND matches.status = 'scheduled'
    )
  );

-- Step 6: DELETE — Only own predictions AND match hasn't started
CREATE POLICY "Users can delete own predictions"
  ON predictions FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = predictions.match_id
      AND matches.match_date > (NOW() + INTERVAL '1 minute')
      AND matches.status = 'scheduled'
    )
  );

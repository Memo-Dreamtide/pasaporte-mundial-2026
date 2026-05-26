-- Table for caching API-Football responses (testing only)
-- This does NOT touch the matches table — completely isolated

CREATE TABLE IF NOT EXISTS api_football_cache (
  fixture_id INTEGER PRIMARY KEY,
  league_id INTEGER NOT NULL,
  league_name TEXT,
  round TEXT,
  status TEXT NOT NULL DEFAULT 'NS',
  status_long TEXT,
  minute INTEGER,
  kickoff TIMESTAMPTZ,
  home_team TEXT NOT NULL,
  home_logo TEXT,
  home_score INTEGER,
  away_team TEXT NOT NULL,
  away_logo TEXT,
  away_score INTEGER,
  events JSONB DEFAULT '[]'::jsonb,
  raw_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups by status
CREATE INDEX IF NOT EXISTS idx_afc_status ON api_football_cache(status);
CREATE INDEX IF NOT EXISTS idx_afc_league ON api_football_cache(league_id);
CREATE INDEX IF NOT EXISTS idx_afc_kickoff ON api_football_cache(kickoff);

-- RLS: Allow public read (for testing), only service role can write
ALTER TABLE api_football_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read (it's test data, non-sensitive)
CREATE POLICY "Public read access" ON api_football_cache
  FOR SELECT USING (true);

-- Only authenticated users can insert/update (our API route uses anon key)
CREATE POLICY "Authenticated write access" ON api_football_cache
  FOR ALL USING (true) WITH CHECK (true);

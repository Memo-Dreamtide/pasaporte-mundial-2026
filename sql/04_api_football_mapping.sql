-- ============================================================
-- API-FOOTBALL MAPPING: Link our tables to API-Football IDs
-- so the sync cron can update matches automatically
-- ============================================================

-- Add API-Football ID columns
ALTER TABLE teams ADD COLUMN IF NOT EXISTS api_football_id INTEGER UNIQUE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS api_football_id INTEGER UNIQUE;

-- Add live match fields to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS minute INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status_detail TEXT;

-- Index for fast lookup during sync
CREATE INDEX IF NOT EXISTS idx_matches_api_football_id ON matches(api_football_id);
CREATE INDEX IF NOT EXISTS idx_teams_api_football_id ON teams(api_football_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches(match_date);

-- ============================================================
-- MAP 48 TEAMS: API-Football team_id → our teams table
-- Uses team name matching (code is our 3-letter code)
-- ============================================================

UPDATE teams SET api_football_id = 1532 WHERE code = 'ALG' OR name ILIKE '%Algeria%';
UPDATE teams SET api_football_id = 26 WHERE code = 'ARG' OR name ILIKE '%Argentina%';
UPDATE teams SET api_football_id = 20 WHERE code = 'AUS' OR name ILIKE '%Australia%';
UPDATE teams SET api_football_id = 775 WHERE code = 'AUT' OR name ILIKE '%Austria%';
UPDATE teams SET api_football_id = 1 WHERE code = 'BEL' OR name ILIKE '%Belgium%' OR name ILIKE '%Bélgica%';
UPDATE teams SET api_football_id = 1113 WHERE code = 'BIH' OR name ILIKE '%Bosnia%';
UPDATE teams SET api_football_id = 6 WHERE code = 'BRA' OR name ILIKE '%Brazil%' OR name ILIKE '%Brasil%';
UPDATE teams SET api_football_id = 5529 WHERE code = 'CAN' OR name ILIKE '%Canada%' OR name ILIKE '%Canadá%';
UPDATE teams SET api_football_id = 1533 WHERE code = 'CPV' OR name ILIKE '%Cape Verde%' OR name ILIKE '%Cabo Verde%';
UPDATE teams SET api_football_id = 8 WHERE code = 'COL' OR name ILIKE '%Colombia%';
UPDATE teams SET api_football_id = 1508 WHERE code = 'COD' OR name ILIKE '%Congo DR%' OR name ILIKE '%RD Congo%';
UPDATE teams SET api_football_id = 3 WHERE code = 'CRO' OR name ILIKE '%Croatia%' OR name ILIKE '%Croacia%';
UPDATE teams SET api_football_id = 5530 WHERE code = 'CUW' OR name ILIKE '%Curaçao%' OR name ILIKE '%Curazao%';
UPDATE teams SET api_football_id = 770 WHERE code = 'CZE' OR name ILIKE '%Czech%' OR name ILIKE '%Checa%';
UPDATE teams SET api_football_id = 2382 WHERE code = 'ECU' OR name ILIKE '%Ecuador%';
UPDATE teams SET api_football_id = 32 WHERE code = 'EGY' OR name ILIKE '%Egypt%' OR name ILIKE '%Egipto%';
UPDATE teams SET api_football_id = 10 WHERE code = 'ENG' OR name ILIKE '%England%' OR name ILIKE '%Inglaterra%';
UPDATE teams SET api_football_id = 2 WHERE code = 'FRA' OR name ILIKE '%France%' OR name ILIKE '%Francia%';
UPDATE teams SET api_football_id = 25 WHERE code = 'GER' OR name ILIKE '%Germany%' OR name ILIKE '%Alemania%';
UPDATE teams SET api_football_id = 1504 WHERE code = 'GHA' OR name ILIKE '%Ghana%';
UPDATE teams SET api_football_id = 2386 WHERE code = 'HAI' OR name ILIKE '%Haiti%' OR name ILIKE '%Haití%';
UPDATE teams SET api_football_id = 22 WHERE code = 'IRN' OR name ILIKE '%Iran%' OR name ILIKE '%Irán%';
UPDATE teams SET api_football_id = 1567 WHERE code = 'IRQ' OR name ILIKE '%Iraq%';
UPDATE teams SET api_football_id = 1501 WHERE code = 'CIV' OR name ILIKE '%Ivory Coast%' OR name ILIKE '%Côte%' OR name ILIKE '%Marfil%';
UPDATE teams SET api_football_id = 12 WHERE code = 'JPN' OR name ILIKE '%Japan%' OR name ILIKE '%Japón%';
UPDATE teams SET api_football_id = 1548 WHERE code = 'JOR' OR name ILIKE '%Jordan%' OR name ILIKE '%Jordania%';
UPDATE teams SET api_football_id = 16 WHERE code = 'MEX' OR name ILIKE '%Mexico%' OR name ILIKE '%México%';
UPDATE teams SET api_football_id = 31 WHERE code = 'MAR' OR name ILIKE '%Morocco%' OR name ILIKE '%Marruecos%';
UPDATE teams SET api_football_id = 1118 WHERE code = 'NED' OR name ILIKE '%Netherlands%' OR name ILIKE '%Países Bajos%' OR name ILIKE '%Holanda%';
UPDATE teams SET api_football_id = 4673 WHERE code = 'NZL' OR name ILIKE '%New Zealand%' OR name ILIKE '%Nueva Zelanda%';
UPDATE teams SET api_football_id = 1090 WHERE code = 'NOR' OR name ILIKE '%Norway%' OR name ILIKE '%Noruega%';
UPDATE teams SET api_football_id = 11 WHERE code = 'PAN' OR name ILIKE '%Panama%' OR name ILIKE '%Panamá%';
UPDATE teams SET api_football_id = 2380 WHERE code = 'PAR' OR name ILIKE '%Paraguay%';
UPDATE teams SET api_football_id = 27 WHERE code = 'POR' OR name ILIKE '%Portugal%';
UPDATE teams SET api_football_id = 1569 WHERE code = 'QAT' OR name ILIKE '%Qatar%';
UPDATE teams SET api_football_id = 23 WHERE code = 'KSA' OR name ILIKE '%Saudi%' OR name ILIKE '%Arabia%';
UPDATE teams SET api_football_id = 1108 WHERE code = 'SCO' OR name ILIKE '%Scotland%' OR name ILIKE '%Escocia%';
UPDATE teams SET api_football_id = 13 WHERE code = 'SEN' OR name ILIKE '%Senegal%';
UPDATE teams SET api_football_id = 1531 WHERE code = 'RSA' OR name ILIKE '%South Africa%' OR name ILIKE '%Sudáfrica%' OR name ILIKE '%Sudafrica%';
UPDATE teams SET api_football_id = 17 WHERE code = 'KOR' OR name ILIKE '%South Korea%' OR name ILIKE '%Corea%';
UPDATE teams SET api_football_id = 9 WHERE code = 'ESP' OR name ILIKE '%Spain%' OR name ILIKE '%España%';
UPDATE teams SET api_football_id = 5 WHERE code = 'SWE' OR name ILIKE '%Sweden%' OR name ILIKE '%Suecia%';
UPDATE teams SET api_football_id = 15 WHERE code = 'SUI' OR name ILIKE '%Switzerland%' OR name ILIKE '%Suiza%';
UPDATE teams SET api_football_id = 28 WHERE code = 'TUN' OR name ILIKE '%Tunisia%' OR name ILIKE '%Túnez%';
UPDATE teams SET api_football_id = 777 WHERE code = 'TUR' OR name ILIKE '%Türkiye%' OR name ILIKE '%Turkey%' OR name ILIKE '%Turquía%';
UPDATE teams SET api_football_id = 2384 WHERE code = 'USA' OR name ILIKE '%United States%' OR name ILIKE '%Estados Unidos%';
UPDATE teams SET api_football_id = 7 WHERE code = 'URU' OR name ILIKE '%Uruguay%';
UPDATE teams SET api_football_id = 1568 WHERE code = 'UZB' OR name ILIKE '%Uzbekistan%' OR name ILIKE '%Uzbekistán%';

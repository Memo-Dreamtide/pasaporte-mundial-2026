-- ============================================================
-- FIX COMPLETE FIFA WORLD CUP 2026 SCHEDULE
-- Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=SV
-- All times in UTC (El Salvador CST = UTC-6)
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Delete 5 teams NOT in the World Cup 2026
-- ============================================================
DELETE FROM teams WHERE code IN ('DEN', 'ITA', 'UKR', 'BOL', 'JAM');

-- ============================================================
-- STEP 2: Move teams to correct groups
-- ============================================================
UPDATE teams SET group_letter = 'F' WHERE code = 'SWE'; -- Suecia: E -> F
UPDATE teams SET group_letter = 'K' WHERE code = 'COD'; -- RD Congo: F -> K
UPDATE teams SET group_letter = 'I' WHERE code = 'IRQ'; -- Iraq: H -> I

-- ============================================================
-- STEP 3: Update all 72 group stage matches
-- Using team codes to look up IDs dynamically
-- ============================================================

-- Helper: Create a temp function to update matches cleanly
CREATE OR REPLACE FUNCTION update_match_schedule(
  p_match_number INTEGER,
  p_home_code TEXT,
  p_away_code TEXT,
  p_match_date TIMESTAMPTZ,
  p_group_letter TEXT,
  p_stadium TEXT,
  p_city TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE matches SET
    home_team_id = (SELECT id FROM teams WHERE code = p_home_code),
    away_team_id = (SELECT id FROM teams WHERE code = p_away_code),
    match_date = p_match_date,
    group_letter = p_group_letter,
    stadium = p_stadium,
    city = p_city
  WHERE match_number = p_match_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- MATCHDAY 1 (Matches 1-24)
-- ============================================================

-- Jun 11
SELECT update_match_schedule(1, 'MEX', 'RSA', '2026-06-11T19:00:00+00:00', 'A', 'Estadio Ciudad de México', 'Ciudad de México');
SELECT update_match_schedule(2, 'KOR', 'CZE', '2026-06-12T02:00:00+00:00', 'A', 'Estadio Guadalajara', 'Guadalajara');

-- Jun 12
SELECT update_match_schedule(3, 'CAN', 'BIH', '2026-06-12T19:00:00+00:00', 'B', 'Estadio de Toronto', 'Toronto');
SELECT update_match_schedule(4, 'USA', 'PAR', '2026-06-13T01:00:00+00:00', 'D', 'Estadio Los Ángeles', 'Los Ángeles');

-- Jun 13
SELECT update_match_schedule(5, 'QAT', 'SUI', '2026-06-13T19:00:00+00:00', 'B', 'Estadio de la Bahía de San Francisco', 'San Francisco');
SELECT update_match_schedule(6, 'BRA', 'MAR', '2026-06-13T22:00:00+00:00', 'C', 'Estadio Nueva York/Nueva Jersey', 'Nueva York');
SELECT update_match_schedule(7, 'HAI', 'SCO', '2026-06-14T01:00:00+00:00', 'C', 'Estadio Boston', 'Boston');
SELECT update_match_schedule(8, 'AUS', 'TUR', '2026-06-14T04:00:00+00:00', 'D', 'Estadio BC Place Vancouver', 'Vancouver');

-- Jun 14
SELECT update_match_schedule(9, 'GER', 'CUW', '2026-06-14T17:00:00+00:00', 'E', 'Estadio Houston', 'Houston');
SELECT update_match_schedule(10, 'NED', 'JPN', '2026-06-14T20:00:00+00:00', 'F', 'Estadio Dallas', 'Dallas');
SELECT update_match_schedule(11, 'CIV', 'ECU', '2026-06-14T23:00:00+00:00', 'E', 'Estadio Filadelfia', 'Filadelfia');
SELECT update_match_schedule(12, 'SWE', 'TUN', '2026-06-15T02:00:00+00:00', 'F', 'Estadio Monterrey', 'Monterrey');

-- Jun 15
SELECT update_match_schedule(13, 'ESP', 'CPV', '2026-06-15T16:00:00+00:00', 'H', 'Estadio Atlanta', 'Atlanta');
SELECT update_match_schedule(14, 'BEL', 'EGY', '2026-06-15T19:00:00+00:00', 'G', 'Estadio de Seattle', 'Seattle');
SELECT update_match_schedule(15, 'KSA', 'URU', '2026-06-15T22:00:00+00:00', 'H', 'Estadio Miami', 'Miami');
SELECT update_match_schedule(16, 'IRN', 'NZL', '2026-06-16T01:00:00+00:00', 'G', 'Estadio Los Ángeles', 'Los Ángeles');

-- Jun 16
SELECT update_match_schedule(17, 'FRA', 'SEN', '2026-06-16T19:00:00+00:00', 'I', 'Estadio Nueva York/Nueva Jersey', 'Nueva York');
SELECT update_match_schedule(18, 'IRQ', 'NOR', '2026-06-16T22:00:00+00:00', 'I', 'Estadio Boston', 'Boston');
SELECT update_match_schedule(19, 'ARG', 'ALG', '2026-06-17T01:00:00+00:00', 'J', 'Estadio Kansas City', 'Kansas City');
SELECT update_match_schedule(20, 'AUT', 'JOR', '2026-06-17T04:00:00+00:00', 'J', 'Estadio de la Bahía de San Francisco', 'San Francisco');

-- Jun 17
SELECT update_match_schedule(21, 'POR', 'COD', '2026-06-17T17:00:00+00:00', 'K', 'Estadio Houston', 'Houston');
SELECT update_match_schedule(22, 'ENG', 'CRO', '2026-06-17T20:00:00+00:00', 'L', 'Estadio Dallas', 'Dallas');
SELECT update_match_schedule(23, 'GHA', 'PAN', '2026-06-17T23:00:00+00:00', 'L', 'Estadio de Toronto', 'Toronto');
SELECT update_match_schedule(24, 'UZB', 'COL', '2026-06-18T02:00:00+00:00', 'K', 'Estadio Ciudad de México', 'Ciudad de México');

-- ============================================================
-- MATCHDAY 2 (Matches 25-48)
-- ============================================================

-- Jun 18
SELECT update_match_schedule(25, 'CZE', 'RSA', '2026-06-18T16:00:00+00:00', 'A', 'Estadio Atlanta', 'Atlanta');
SELECT update_match_schedule(26, 'SUI', 'BIH', '2026-06-18T19:00:00+00:00', 'B', 'Estadio Los Ángeles', 'Los Ángeles');
SELECT update_match_schedule(27, 'CAN', 'QAT', '2026-06-18T22:00:00+00:00', 'B', 'Estadio BC Place Vancouver', 'Vancouver');
SELECT update_match_schedule(28, 'MEX', 'KOR', '2026-06-19T01:00:00+00:00', 'A', 'Estadio Guadalajara', 'Guadalajara');

-- Jun 19
SELECT update_match_schedule(29, 'USA', 'AUS', '2026-06-19T19:00:00+00:00', 'D', 'Estadio de Seattle', 'Seattle');
SELECT update_match_schedule(30, 'SCO', 'MAR', '2026-06-19T22:00:00+00:00', 'C', 'Estadio Boston', 'Boston');
SELECT update_match_schedule(31, 'BRA', 'HAI', '2026-06-20T00:30:00+00:00', 'C', 'Estadio Filadelfia', 'Filadelfia');
SELECT update_match_schedule(32, 'TUR', 'PAR', '2026-06-20T03:00:00+00:00', 'D', 'Estadio de la Bahía de San Francisco', 'San Francisco');

-- Jun 20
SELECT update_match_schedule(33, 'NED', 'SWE', '2026-06-20T17:00:00+00:00', 'F', 'Estadio Houston', 'Houston');
SELECT update_match_schedule(34, 'GER', 'CIV', '2026-06-20T20:00:00+00:00', 'E', 'Estadio de Toronto', 'Toronto');
SELECT update_match_schedule(35, 'ECU', 'CUW', '2026-06-21T00:00:00+00:00', 'E', 'Estadio Kansas City', 'Kansas City');
SELECT update_match_schedule(36, 'TUN', 'JPN', '2026-06-21T04:00:00+00:00', 'F', 'Estadio Monterrey', 'Monterrey');

-- Jun 21
SELECT update_match_schedule(37, 'ESP', 'KSA', '2026-06-21T16:00:00+00:00', 'H', 'Estadio Atlanta', 'Atlanta');
SELECT update_match_schedule(38, 'BEL', 'IRN', '2026-06-21T19:00:00+00:00', 'G', 'Estadio Los Ángeles', 'Los Ángeles');
SELECT update_match_schedule(39, 'URU', 'CPV', '2026-06-21T22:00:00+00:00', 'H', 'Estadio Miami', 'Miami');
SELECT update_match_schedule(40, 'NZL', 'EGY', '2026-06-22T01:00:00+00:00', 'G', 'Estadio BC Place Vancouver', 'Vancouver');

-- Jun 22
SELECT update_match_schedule(41, 'ARG', 'AUT', '2026-06-22T17:00:00+00:00', 'J', 'Estadio Dallas', 'Dallas');
SELECT update_match_schedule(42, 'FRA', 'IRQ', '2026-06-22T21:00:00+00:00', 'I', 'Estadio Filadelfia', 'Filadelfia');
SELECT update_match_schedule(43, 'NOR', 'SEN', '2026-06-23T00:00:00+00:00', 'I', 'Estadio Nueva York/Nueva Jersey', 'Nueva York');
SELECT update_match_schedule(44, 'JOR', 'ALG', '2026-06-23T03:00:00+00:00', 'J', 'Estadio de la Bahía de San Francisco', 'San Francisco');

-- Jun 23
SELECT update_match_schedule(45, 'POR', 'UZB', '2026-06-23T17:00:00+00:00', 'K', 'Estadio Houston', 'Houston');
SELECT update_match_schedule(46, 'ENG', 'GHA', '2026-06-23T20:00:00+00:00', 'L', 'Estadio Boston', 'Boston');
SELECT update_match_schedule(47, 'PAN', 'CRO', '2026-06-23T23:00:00+00:00', 'L', 'Estadio de Toronto', 'Toronto');
SELECT update_match_schedule(48, 'COL', 'COD', '2026-06-24T02:00:00+00:00', 'K', 'Estadio Guadalajara', 'Guadalajara');

-- ============================================================
-- MATCHDAY 3 (Matches 49-72) — SIMULTANEOUS KICKOFFS per group
-- ============================================================

-- Group B - Jun 24, 19:00 UTC (13:00 CST)
SELECT update_match_schedule(49, 'SUI', 'CAN', '2026-06-24T19:00:00+00:00', 'B', 'Estadio BC Place Vancouver', 'Vancouver');
SELECT update_match_schedule(50, 'BIH', 'QAT', '2026-06-24T19:00:00+00:00', 'B', 'Estadio de Seattle', 'Seattle');

-- Group C - Jun 24, 22:00 UTC (16:00 CST)
SELECT update_match_schedule(51, 'SCO', 'BRA', '2026-06-24T22:00:00+00:00', 'C', 'Estadio Miami', 'Miami');
SELECT update_match_schedule(52, 'MAR', 'HAI', '2026-06-24T22:00:00+00:00', 'C', 'Estadio Atlanta', 'Atlanta');

-- Group A - Jun 25, 01:00 UTC (19:00 CST Jun 24)
SELECT update_match_schedule(53, 'CZE', 'MEX', '2026-06-25T01:00:00+00:00', 'A', 'Estadio Ciudad de México', 'Ciudad de México');
SELECT update_match_schedule(54, 'RSA', 'KOR', '2026-06-25T01:00:00+00:00', 'A', 'Estadio Monterrey', 'Monterrey');

-- Group E - Jun 25, 20:00 UTC (14:00 CST)
SELECT update_match_schedule(55, 'CUW', 'CIV', '2026-06-25T20:00:00+00:00', 'E', 'Estadio Filadelfia', 'Filadelfia');
SELECT update_match_schedule(56, 'ECU', 'GER', '2026-06-25T20:00:00+00:00', 'E', 'Estadio Nueva York/Nueva Jersey', 'Nueva York');

-- Group F - Jun 25, 23:00 UTC (17:00 CST)
SELECT update_match_schedule(57, 'JPN', 'SWE', '2026-06-25T23:00:00+00:00', 'F', 'Estadio Dallas', 'Dallas');
SELECT update_match_schedule(58, 'TUN', 'NED', '2026-06-25T23:00:00+00:00', 'F', 'Estadio Kansas City', 'Kansas City');

-- Group D - Jun 26, 02:00 UTC (20:00 CST Jun 25)
SELECT update_match_schedule(59, 'TUR', 'USA', '2026-06-26T02:00:00+00:00', 'D', 'Estadio Los Ángeles', 'Los Ángeles');
SELECT update_match_schedule(60, 'PAR', 'AUS', '2026-06-26T02:00:00+00:00', 'D', 'Estadio de la Bahía de San Francisco', 'San Francisco');

-- Group I - Jun 26, 19:00 UTC (13:00 CST)
SELECT update_match_schedule(61, 'NOR', 'FRA', '2026-06-26T19:00:00+00:00', 'I', 'Estadio Boston', 'Boston');
SELECT update_match_schedule(62, 'SEN', 'IRQ', '2026-06-26T19:00:00+00:00', 'I', 'Estadio de Toronto', 'Toronto');

-- Group H - Jun 27, 00:00 UTC (18:00 CST Jun 26)
SELECT update_match_schedule(63, 'CPV', 'KSA', '2026-06-27T00:00:00+00:00', 'H', 'Estadio Houston', 'Houston');
SELECT update_match_schedule(64, 'URU', 'ESP', '2026-06-27T00:00:00+00:00', 'H', 'Estadio Guadalajara', 'Guadalajara');

-- Group G - Jun 27, 03:00 UTC (21:00 CST Jun 26)
SELECT update_match_schedule(65, 'EGY', 'IRN', '2026-06-27T03:00:00+00:00', 'G', 'Estadio de Seattle', 'Seattle');
SELECT update_match_schedule(66, 'NZL', 'BEL', '2026-06-27T03:00:00+00:00', 'G', 'Estadio BC Place Vancouver', 'Vancouver');

-- Group L - Jun 27, 21:00 UTC (15:00 CST)
SELECT update_match_schedule(67, 'PAN', 'ENG', '2026-06-27T21:00:00+00:00', 'L', 'Estadio Nueva York/Nueva Jersey', 'Nueva York');
SELECT update_match_schedule(68, 'CRO', 'GHA', '2026-06-27T21:00:00+00:00', 'L', 'Estadio Filadelfia', 'Filadelfia');

-- Group K - Jun 27, 23:30 UTC (17:30 CST)
SELECT update_match_schedule(69, 'COL', 'POR', '2026-06-27T23:30:00+00:00', 'K', 'Estadio Miami', 'Miami');
SELECT update_match_schedule(70, 'COD', 'UZB', '2026-06-27T23:30:00+00:00', 'K', 'Estadio Atlanta', 'Atlanta');

-- Group J - Jun 28, 02:00 UTC (20:00 CST Jun 27)
SELECT update_match_schedule(71, 'ALG', 'AUT', '2026-06-28T02:00:00+00:00', 'J', 'Estadio Kansas City', 'Kansas City');
SELECT update_match_schedule(72, 'JOR', 'ARG', '2026-06-28T02:00:00+00:00', 'J', 'Estadio Dallas', 'Dallas');

-- ============================================================
-- Cleanup: Drop the helper function
-- ============================================================
DROP FUNCTION update_match_schedule;

-- ============================================================
-- VERIFICATION: Check the results
-- ============================================================
SELECT
  m.match_number,
  ht.code as home,
  at2.code as away,
  m.match_date,
  m.group_letter,
  m.stadium,
  m.city
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at2 ON m.away_team_id = at2.id
WHERE m.stage = 'group'
ORDER BY m.match_number;

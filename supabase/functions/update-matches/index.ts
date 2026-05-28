// Supabase Edge Function: update-matches
// Polls API-Football every 15 seconds during match windows
// Invoked by Vercel Cron (every 1 min) or pg_cron
// Loops 4 times internally → effective 15-second refresh rate
//
// Also runs knockout fixture mapping once per invocation:
// As API-Football publishes R32/R16/QF/SF/F matchups (after group stage ends),
// we automatically map them to our placeholder records by matching on match_date.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const API_FOOTBALL_URL = "https://v3.football.api-sports.io"
const API_KEY = Deno.env.get("API_FOOTBALL_KEY") || ""
const WORLD_CUP_LEAGUE = 1
const WORLD_CUP_SEASON = 2026

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

// Status codes from API-Football
const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"]
const FINISHED_STATUSES = ["FT", "AET", "PEN"]

function mapStatus(apiStatus: string): "scheduled" | "live" | "finished" | "postponed" {
  if (LIVE_STATUSES.includes(apiStatus)) return "live"
  if (FINISHED_STATUSES.includes(apiStatus)) return "finished"
  if (["PST", "CANC", "ABD"].includes(apiStatus)) return "postponed"
  return "scheduled"
}

async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${API_FOOTBALL_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url.toString(), {
    headers: { "x-apisports-key": API_KEY },
  })

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`)
  }

  return response.json()
}

// ─── KNOCKOUT MAPPING ──────────────────────────────────────
// Automatically links our R32/R16/QF/SF/F placeholder records
// to API-Football fixtures as they become available.
//
// Strategy: match by match_date (UTC timestamp, within 1h tolerance)
// because stadium names differ between sources but FIFA's official
// calendar is immutable.

async function mapKnockoutFixtures(supabase: ReturnType<typeof createClient>) {
  // 1. Find our knockout placeholders that haven't been mapped yet
  const { data: unmapped } = await supabase
    .from("matches")
    .select("id, match_date, stage")
    .neq("stage", "group")
    .is("api_football_id", null)

  if (!unmapped || unmapped.length === 0) {
    return { skipped: true, reason: "all_knockout_mapped" }
  }

  // 2. Fetch ALL World Cup fixtures from API-Football (no date filter)
  const data = await fetchFromApi("/fixtures", {
    league: String(WORLD_CUP_LEAGUE),
    season: String(WORLD_CUP_SEASON),
  })

  const allFixtures = data.response || []

  // 3. Filter to non-group fixtures only
  const knockoutFixtures = allFixtures.filter(
    (f: { league: { round: string } }) => !f.league.round.includes("Group Stage")
  )

  if (knockoutFixtures.length === 0) {
    return {
      skipped: true,
      reason: "no_knockout_fixtures_published_yet",
      unmapped_in_db: unmapped.length,
    }
  }

  // 4. Build team api_football_id → uuid lookup
  const { data: teams } = await supabase
    .from("teams")
    .select("id, api_football_id")
    .not("api_football_id", "is", null)

  const teamMap = new Map<number, string>()
  teams?.forEach((t) => {
    if (t.api_football_id) teamMap.set(Number(t.api_football_id), String(t.id))
  })

  // 5. Match each knockout fixture to a placeholder
  let mapped = 0
  const matchedDetails: Array<Record<string, unknown>> = []

  for (const f of knockoutFixtures) {
    const homeApiId = f.teams?.home?.id
    const awayApiId = f.teams?.away?.id

    // Skip if teams are still TBD (winners not determined yet)
    if (!homeApiId || !awayApiId) continue

    const homeTeamId = teamMap.get(Number(homeApiId))
    const awayTeamId = teamMap.get(Number(awayApiId))

    // Skip if either team is not in our DB (shouldn't happen, 48 teams mapped)
    if (!homeTeamId || !awayTeamId) continue

    // Find our placeholder by match_date (UTC, within 1h tolerance)
    const theirDate = new Date(f.fixture.date).getTime()
    const placeholder = unmapped.find((m) => {
      const ourDate = new Date(m.match_date as string).getTime()
      return Math.abs(ourDate - theirDate) < 60 * 60 * 1000
    })

    if (!placeholder) continue

    // UPDATE the placeholder with real data
    const { error } = await supabase
      .from("matches")
      .update({
        api_football_id: f.fixture.id,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", placeholder.id)

    if (!error) {
      mapped++
      matchedDetails.push({
        stage: placeholder.stage,
        api_fixture_id: f.fixture.id,
        round: f.league.round,
      })
      // Remove from unmapped so we don't match it twice
      const idx = unmapped.findIndex((m) => m.id === placeholder.id)
      if (idx >= 0) unmapped.splice(idx, 1)
    }
  }

  return {
    skipped: false,
    total_knockout_available: knockoutFixtures.length,
    newly_mapped: mapped,
    still_unmapped: unmapped.length,
    details: matchedDetails,
  }
}

// ─── SCORE POLLING ─────────────────────────────────────────
async function pollOnce(supabase: ReturnType<typeof createClient>) {
  const today = new Date().toISOString().split("T")[0]

  // Check today's matches in our DB
  const { data: todayMatches } = await supabase
    .from("matches")
    .select("id, api_football_id, match_date, status")
    .gte("match_date", `${today}T00:00:00`)
    .lte("match_date", `${today}T23:59:59`)
    .not("api_football_id", "is", null)

  if (!todayMatches || todayMatches.length === 0) {
    return { skipped: true, reason: "no_matches_today" }
  }

  // Check if any are live or about to start (within 30 min)
  const now = new Date()
  const hasLive = todayMatches.some((m) => m.status === "live")
  const hasUpcoming = todayMatches.some((m) => {
    const kickoff = new Date(m.match_date)
    const minutesUntil = (kickoff.getTime() - now.getTime()) / 60000
    return m.status === "scheduled" && minutesUntil <= 30 && minutesUntil > -180
  })
  const allFinished = todayMatches.every(
    (m) => m.status === "finished" || m.status === "postponed"
  )

  if (allFinished) {
    return { skipped: true, reason: "all_finished" }
  }

  if (!hasLive && !hasUpcoming) {
    return { skipped: true, reason: "no_active_window" }
  }

  // Fetch World Cup fixtures from API-Football for today
  const data = await fetchFromApi("/fixtures", {
    league: String(WORLD_CUP_LEAGUE),
    season: String(WORLD_CUP_SEASON),
    date: today,
  })

  const fixtures = data.response || []
  let updated = 0
  let finished = 0
  let live = 0

  // Update each match in Supabase
  for (const f of fixtures) {
    const apiId = f.fixture.id
    const newStatus = mapStatus(f.fixture.status.short)
    const homeScore = f.goals.home
    const awayScore = f.goals.away
    const minute = f.fixture.status.elapsed
    const statusDetail = f.fixture.status.short + (minute ? ` ${minute}'` : "")

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: newStatus,
        minute: minute,
        status_detail: statusDetail,
        updated_at: new Date().toISOString(),
      })
      .eq("api_football_id", apiId)

    if (!error) {
      updated++
      if (newStatus === "live") live++
      if (newStatus === "finished") finished++
    }
  }

  return {
    skipped: false,
    api_fixtures: fixtures.length,
    matches_updated: updated,
    live,
    finished,
    timestamp: new Date().toISOString(),
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

Deno.serve(async (req) => {
  // Auth check — CRON_SECRET via query param or Bearer header
  const url = new URL(req.url)
  const secret = url.searchParams.get("secret")
  const authHeader = req.headers.get("Authorization")
  const cronSecret = Deno.env.get("CRON_SECRET")

  if (cronSecret) {
    const validSecret = secret === cronSecret
    const validBearer = authHeader === `Bearer ${cronSecret}`
    if (!validSecret && !validBearer) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const results: Record<string, unknown>[] = []
  let knockoutMappingResult: unknown = null

  // During live matches: poll 4 times (0s, 15s, 30s, 45s) = every 15 seconds
  // If no active matches: poll once and exit
  const POLLS_PER_INVOCATION = 4
  const POLL_INTERVAL_MS = 15_000

  try {
    // STEP 1: Run knockout mapping ONCE per invocation (before score polling)
    // This is lightweight — only does work if there are unmapped placeholders
    // AND if API-Football has published knockout fixtures
    try {
      knockoutMappingResult = await mapKnockoutFixtures(supabase)
    } catch (e) {
      knockoutMappingResult = {
        error: e instanceof Error ? e.message : "knockout_mapping_failed",
      }
    }

    // STEP 2: Score polling loop (every 15s during active window)
    for (let i = 0; i < POLLS_PER_INVOCATION; i++) {
      const result = await pollOnce(supabase)
      results.push({ poll: i + 1, ...result })

      // If no active matches, stop polling — save API quota
      if (result.skipped) break

      // Wait 15 seconds before next poll (except last iteration)
      if (i < POLLS_PER_INVOCATION - 1) {
        await sleep(POLL_INTERVAL_MS)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        knockout_mapping: knockoutMappingResult,
        polls: results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Match update error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        knockout_mapping: knockoutMappingResult,
        polls: results,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

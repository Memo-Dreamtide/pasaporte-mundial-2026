// Supabase Edge Function: update-matches
// Polls API-Football every 15 seconds during match windows
// Invoked by Vercel Cron (every 1 min) or pg_cron
// Loops 4 times internally → effective 15-second refresh rate

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

  // During live matches: poll 4 times (0s, 15s, 30s, 45s) = every 15 seconds
  // If no active matches: poll once and exit
  const POLLS_PER_INVOCATION = 4
  const POLL_INTERVAL_MS = 15_000

  try {
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
      JSON.stringify({ success: true, polls: results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Match update error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        polls: results,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'
const API_KEY = process.env.API_FOOTBALL_KEY || '840f4d0ea6679a3a19b3bd4390b46fde'
const WORLD_CUP_LEAGUE = 1
const WORLD_CUP_SEASON = 2026

// Status codes that mean "in play"
const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT']
const FINISHED_STATUSES = ['FT', 'AET', 'PEN']

// Use service role for server-side operations (bypasses RLS)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${API_FOOTBALL_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_KEY },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status}`)
  }

  return response.json()
}

// Map API-Football status to our status
function mapStatus(apiStatus: string): 'scheduled' | 'live' | 'finished' | 'postponed' {
  if (LIVE_STATUSES.includes(apiStatus)) return 'live'
  if (FINISHED_STATUSES.includes(apiStatus)) return 'finished'
  if (['PST', 'CANC', 'ABD'].includes(apiStatus)) return 'postponed'
  return 'scheduled'
}

export async function GET(request: Request) {
  // Optional auth check for cron security
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  try {
    // Step 1: Check if there are any World Cup matches today that need tracking
    const today = new Date().toISOString().split('T')[0]
    const { data: todayMatches } = await supabase
      .from('matches')
      .select('id, api_football_id, match_date, status')
      .gte('match_date', `${today}T00:00:00`)
      .lte('match_date', `${today}T23:59:59`)
      .not('api_football_id', 'is', null)

    if (!todayMatches || todayMatches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No World Cup matches today',
        skipped: true,
      })
    }

    // Step 2: Check if any are live or about to start (within 10 min)
    const now = new Date()
    const hasLive = todayMatches.some(m => m.status === 'live')
    const hasUpcoming = todayMatches.some(m => {
      const kickoff = new Date(m.match_date)
      const minutesUntil = (kickoff.getTime() - now.getTime()) / 60000
      return m.status === 'scheduled' && minutesUntil <= 10 && minutesUntil > -180
    })
    const allFinished = todayMatches.every(m =>
      m.status === 'finished' || m.status === 'postponed'
    )

    if (allFinished) {
      return NextResponse.json({
        success: true,
        message: 'All matches today are finished',
        skipped: true,
      })
    }

    if (!hasLive && !hasUpcoming) {
      return NextResponse.json({
        success: true,
        message: 'No live or upcoming matches right now',
        skipped: true,
        next_match: todayMatches
          .filter(m => m.status === 'scheduled')
          .sort((a, b) => a.match_date.localeCompare(b.match_date))[0]?.match_date,
      })
    }

    // Step 3: Fetch World Cup fixtures from API-Football
    const data = await fetchFromApi('/fixtures', {
      league: String(WORLD_CUP_LEAGUE),
      season: String(WORLD_CUP_SEASON),
      date: today,
    })

    const fixtures = data.response || []
    let updated = 0
    let finished = 0
    let live = 0

    // Step 4: Update each match in our database
    for (const f of fixtures) {
      const apiId = f.fixture.id
      const newStatus = mapStatus(f.fixture.status.short)
      const homeScore = f.goals.home
      const awayScore = f.goals.away
      const minute = f.fixture.status.elapsed
      const statusDetail = f.fixture.status.short + (minute ? ` ${minute}'` : '')

      const { data: updateResult, error } = await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: newStatus,
          minute: minute,
          status_detail: statusDetail,
        })
        .eq('api_football_id', apiId)
        .select('id')

      if (!error && updateResult && updateResult.length > 0) {
        updated++
        if (newStatus === 'live') live++
        if (newStatus === 'finished') finished++
      }
    }

    // Note: The trigger_match_finished will auto-calculate points
    // when status changes to 'finished'

    return NextResponse.json({
      success: true,
      api_fixtures: fixtures.length,
      matches_updated: updated,
      live,
      finished,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('World Cup sync error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

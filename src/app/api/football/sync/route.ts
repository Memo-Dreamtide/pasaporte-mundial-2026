import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API_FOOTBALL_URL = 'https://v3.football.api-sports.io'
const API_KEY = process.env.API_FOOTBALL_KEY || '840f4d0ea6679a3a19b3bd4390b46fde'

// Test leagues — will switch to league=1 for World Cup
// 13 = CONMEBOL Libertadores, 11 = CONMEBOL Sudamericana
const TEST_LEAGUES = [13, 11]
const TEST_SEASON = 2026

interface ApiFixture {
  fixture: {
    id: number
    date: string
    status: {
      short: string
      long: string
      elapsed: number | null
    }
    venue: {
      name: string | null
      city: string | null
    }
  }
  league: {
    id: number
    name: string
    round: string
  }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: {
    home: number | null
    away: number | null
  }
  events?: Array<{
    time: { elapsed: number; extra: number | null }
    team: { id: number; name: string }
    player: { id: number; name: string }
    type: string
    detail: string
  }>
}

async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${API_FOOTBALL_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_KEY },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const leagueParam = searchParams.get('league')
  const season = searchParams.get('season') || String(TEST_SEASON)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const live = searchParams.get('live') // "all" to fetch only live

  // Use provided league or fetch all test leagues
  const leagues = leagueParam ? [leagueParam] : TEST_LEAGUES.map(String)

  try {
    // Fetch all leagues in parallel
    const allFixtures: ApiFixture[] = []

    const results = await Promise.all(
      leagues.map((league) => {
        const params: Record<string, string> = {}
        if (live === 'all') {
          params.live = 'all'
          params.league = league
        } else {
          params.league = league
          params.season = season
          params.date = date
        }
        return fetchFromApi('/fixtures', params)
      })
    )

    for (const data of results) {
      const fixtures: ApiFixture[] = data.response || []
      allFixtures.push(...fixtures)
    }

    const fixtures = allFixtures

    // Store in Supabase cache
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* Server Component */ }
          },
        },
      }
    )

    // Upsert each fixture into cache
    const cacheEntries = fixtures.map((f) => ({
      fixture_id: f.fixture.id,
      league_id: f.league.id,
      league_name: f.league.name,
      round: f.league.round,
      status: f.fixture.status.short,
      status_long: f.fixture.status.long,
      minute: f.fixture.status.elapsed,
      kickoff: f.fixture.date,
      home_team: f.teams.home.name,
      home_logo: f.teams.home.logo,
      home_score: f.goals.home,
      away_team: f.teams.away.name,
      away_logo: f.teams.away.logo,
      away_score: f.goals.away,
      events: f.events || [],
      raw_data: f,
      updated_at: new Date().toISOString(),
    }))

    if (cacheEntries.length > 0) {
      const { error } = await supabase
        .from('api_football_cache')
        .upsert(cacheEntries, { onConflict: 'fixture_id' })

      if (error) {
        console.error('Supabase upsert error:', error)
        return NextResponse.json({
          success: false,
          error: error.message,
          fixtures_fetched: fixtures.length,
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      fixtures_fetched: fixtures.length,
      fixtures_cached: cacheEntries.length,
      statuses: fixtures.reduce((acc, f) => {
        const s = f.fixture.status.short
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      api_requests_remaining: data.errors?.rateLimit || 'unknown',
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

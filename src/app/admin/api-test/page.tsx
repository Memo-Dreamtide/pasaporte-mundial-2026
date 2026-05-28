"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState, useEffect, useCallback } from "react"

interface CachedFixture {
  fixture_id: number
  league_id: number
  league_name: string
  round: string
  status: string
  status_long: string
  minute: number | null
  kickoff: string
  home_team: string
  home_logo: string
  home_score: number | null
  away_team: string
  away_logo: string
  away_score: number | null
  events: Array<{
    time: { elapsed: number; extra: number | null }
    team: { name: string }
    player: { name: string }
    type: string
    detail: string
  }>
  updated_at: string
}

const STATUS_COLORS: Record<string, string> = {
  'NS': 'bg-white/10 text-white/50',
  '1H': 'bg-green-500/20 text-green-400',
  'HT': 'bg-yellow-500/20 text-yellow-400',
  '2H': 'bg-green-500/20 text-green-400',
  'ET': 'bg-orange-500/20 text-orange-400',
  'BT': 'bg-yellow-500/20 text-yellow-400',
  'P': 'bg-red-500/20 text-red-400',
  'FT': 'bg-white/10 text-white/30',
  'AET': 'bg-white/10 text-white/30',
  'PEN': 'bg-white/10 text-white/30',
}

const LIVE_STATUSES = ['1H', '2H', 'ET', 'P', 'HT', 'BT']

export default function ApiTestPage() {
  const [fixtures, setFixtures] = useState<CachedFixture[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<string>("")
  const [pollingInterval, setPollingInterval] = useState(15)
  const supabase = createClient()

  const fetchCached = useCallback(async () => {
    setLoading(true)
    // Show all cached fixtures (SYNC LIVE pulls all live games globally)
    const { data, error } = await supabase
      .from('api_football_cache')
      .select('*')
      .order('kickoff', { ascending: true })

    if (!error && data) {
      setFixtures(data as CachedFixture[])
    }
    setLoading(false)
  }, [])

  const triggerSync = useCallback(async (mode: string = 'live') => {
    setSyncing(true)
    try {
      const res = await fetch(`/api/football/sync?mode=${mode}`)
      const data = await res.json()
      setSyncResult(JSON.stringify(data, null, 2))
      setLastSync(new Date().toLocaleTimeString())
      await fetchCached()
    } catch (err) {
      setSyncResult(`Error: ${err}`)
    }
    setSyncing(false)
  }, [fetchCached])

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      triggerSync()
    }, pollingInterval * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, pollingInterval, triggerSync])

  // Initial load from cache
  useEffect(() => {
    fetchCached()
  }, [fetchCached])

  const liveFixtures = fixtures.filter(f => LIVE_STATUSES.includes(f.status))
  const upcomingFixtures = fixtures.filter(f => f.status === 'NS')
  const finishedFixtures = fixtures.filter(f => ['FT', 'AET', 'PEN'].includes(f.status))

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">MUNDIAL 2026 — LIVE FEED</h1>
          <p className="text-white/40 text-sm mt-1">
            Partidos del día desde API-Football — Polling cada 15s en vivo
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => triggerSync('live')}
              disabled={syncing}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {syncing ? "Syncing..." : "SYNC LIVE"}
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm text-white/50">Auto-refresh:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all ${
                  autoRefresh ? 'bg-green-600 text-white' : 'bg-white/10 text-white/50'
                }`}
              >
                {autoRefresh ? `ON (${pollingInterval}s)` : 'OFF'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-white/50">Interval:</label>
              <select
                value={pollingInterval}
                onChange={(e) => setPollingInterval(Number(e.target.value))}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>

            {lastSync && (
              <span className="text-xs text-white/30">Last sync: {lastSync}</span>
            )}
          </div>

          {/* Sync Result */}
          {syncResult && (
            <details className="mt-4">
              <summary className="text-xs text-white/30 cursor-pointer">API Response</summary>
              <pre className="mt-2 text-xs text-green-400/70 bg-black/50 rounded-lg p-3 overflow-x-auto">
                {syncResult}
              </pre>
            </details>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-2xl font-black text-green-400">{liveFixtures.length}</div>
            <div className="text-xs text-white/40 mt-1">EN VIVO</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-2xl font-black text-white/50">{upcomingFixtures.length}</div>
            <div className="text-xs text-white/40 mt-1">POR JUGAR</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-2xl font-black text-white/30">{finishedFixtures.length}</div>
            <div className="text-xs text-white/40 mt-1">FINALIZADOS</div>
          </div>
        </div>

        {/* Live Fixtures */}
        {liveFixtures.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-black text-green-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              EN VIVO
            </h2>
            <div className="space-y-3">
              {liveFixtures.map(f => (
                <FixtureCard key={f.fixture_id} fixture={f} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingFixtures.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-black text-white/50 mb-4">POR JUGAR</h2>
            <div className="space-y-3">
              {upcomingFixtures.map(f => (
                <FixtureCard key={f.fixture_id} fixture={f} />
              ))}
            </div>
          </section>
        )}

        {/* Finished */}
        {finishedFixtures.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-black text-white/30 mb-4">FINALIZADOS</h2>
            <div className="space-y-3">
              {finishedFixtures.map(f => (
                <FixtureCard key={f.fixture_id} fixture={f} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {fixtures.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">No hay datos en cache</p>
            <p className="text-white/20 text-sm mt-2">Presiona SYNC LIVE para traer partidos en vivo del mundo</p>
          </div>
        )}
      </div>
    </main>
  )
}

function FixtureCard({ fixture }: { fixture: CachedFixture }) {
  const isLive = LIVE_STATUSES.includes(fixture.status)
  const kickoffTime = new Date(fixture.kickoff).toLocaleTimeString('es-SV', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const goals = (fixture.events || []).filter(e => e.type === 'Goal')

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isLive ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'
    }`}>
      {/* League + Round + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/40">{fixture.league_name}</span>
          <span className="text-xs text-white/30">{fixture.round}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[fixture.status] || 'bg-white/10 text-white/50'}`}>
          {fixture.status}
          {fixture.minute ? ` ${fixture.minute}'` : ''}
        </span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between">
        {/* Home */}
        <div className="flex items-center gap-3 flex-1">
          {fixture.home_logo && (
            <img src={fixture.home_logo} alt="" className="w-8 h-8 object-contain" />
          )}
          <span className="font-bold text-sm truncate">{fixture.home_team}</span>
        </div>

        {/* Score */}
        <div className="px-4 text-center min-w-[80px]">
          {fixture.status === 'NS' ? (
            <span className="text-white/30 text-sm">{kickoffTime}</span>
          ) : (
            <span className={`text-2xl font-black ${isLive ? 'text-green-400' : 'text-white'}`}>
              {fixture.home_score ?? 0} - {fixture.away_score ?? 0}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-bold text-sm truncate text-right">{fixture.away_team}</span>
          {fixture.away_logo && (
            <img src={fixture.away_logo} alt="" className="w-8 h-8 object-contain" />
          )}
        </div>
      </div>

      {/* Events (Goals) */}
      {goals.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          {goals.map((g, i) => (
            <div key={i} className="text-xs text-white/40 flex items-center gap-2">
              <span className="text-green-400">{g.time.elapsed}{g.time.extra ? `+${g.time.extra}` : ''}'</span>
              <span>{g.player.name}</span>
              <span className="text-white/20">({g.team.name})</span>
              {g.detail !== 'Normal Goal' && <span className="text-white/20">({g.detail})</span>}
            </div>
          ))}
        </div>
      )}

      {/* Last updated */}
      <div className="mt-2 text-right">
        <span className="text-[10px] text-white/20">
          Updated: {new Date(fixture.updated_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

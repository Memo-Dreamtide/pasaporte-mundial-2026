import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: liveMatch } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .eq("status", "live")
    .order("match_date", { ascending: true })
    .limit(1)
    .single()

  let currentMatch = liveMatch

  if (!currentMatch) {
    const { data: nextMatch } = await supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .eq("status", "scheduled")
      .order("match_date", { ascending: true })
      .limit(1)
      .single()
    currentMatch = nextMatch
  }

  const { data: predictions } = await supabase.from("predictions").select("match_id").eq("user_id", user.id)
  const predictedCount = predictions?.length || 0

  // Use profile.exact_scores (updated by SQL trigger) — accurate count by score match, not points threshold
  const exactCount = profile?.exact_scores || 0

  // Compute current streak: consecutive exact predictions TODAY in El Salvador timezone
  // (UTC-6, no DST). Streak resets every midnight SV — racha es por día.
  const SV_OFFSET_MS = 6 * 60 * 60 * 1000
  const svNow = new Date(Date.now() - SV_OFFSET_MS)
  const svDate = svNow.toISOString().split("T")[0]
  const svDayStartUTC = `${svDate}T06:00:00.000Z` // 00:00 SV = 06:00 UTC
  const svDayEndUTC = new Date(new Date(svDayStartUTC).getTime() + 24 * 60 * 60 * 1000).toISOString()

  const { data: userHistory } = await supabase
    .from("predictions")
    .select("home_score, away_score, match:matches!inner(home_score, away_score, status, match_date)")
    .eq("user_id", user.id)
    .eq("match.status", "finished")
    .gte("match.match_date", svDayStartUTC)
    .lt("match.match_date", svDayEndUTC)
    .order("match(match_date)", { ascending: false })

  let currentStreak = 0
  if (userHistory) {
    for (const p of userHistory) {
      const m = Array.isArray(p.match) ? p.match[0] : p.match
      if (!m) break
      const isExact = p.home_score === m.home_score && p.away_score === m.away_score
      if (isExact) currentStreak++
      else break
    }
  }

  const totalMatches = 104

  const matchData = currentMatch ? {
    id: currentMatch.id as string,
    homeCode: currentMatch.home_team?.code || "???",
    awayCode: currentMatch.away_team?.code || "???",
    homeFlag: currentMatch.home_team?.flag_emoji || "",
    awayFlag: currentMatch.away_team?.flag_emoji || "",
    homeScore: currentMatch.home_score ?? 0,
    awayScore: currentMatch.away_score ?? 0,
    matchDate: currentMatch.match_date,
    isLive: currentMatch.status === "live",
    status: currentMatch.status as string,
    minute: currentMatch.minute as number | null,
    status_detail: currentMatch.status_detail as string | null,
  } : null

  const authProvider = user.app_metadata?.provider || "email"

  return (
    <DashboardClient
      userName={profile?.full_name || user.email || "Usuario"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
      rankPosition={profile?.rank_position || 0}
      totalPoints={profile?.total_points || 0}
      predictedCount={predictedCount}
      faltantes={totalMatches - predictedCount}
      exactCount={exactCount}
      currentStreak={currentStreak}
      match={matchData}
      authProvider={authProvider}
    />
  )
}

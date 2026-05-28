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

  // Exact predictions = points_earned multiple of 10 (10, 20, 30, 40 — with streak multiplier)
  const { data: exactPredictions } = await supabase
    .from("predictions")
    .select("id, points_earned, home_score, away_score, match_id")
    .eq("user_id", user.id)
    .not("points_earned", "is", null)
  const exactCount = exactPredictions?.filter(p => p.points_earned && p.points_earned >= 10).length || 0

  // Compute current streak: consecutive exact predictions from most recent finished match backwards
  const { data: userHistory } = await supabase
    .from("predictions")
    .select("home_score, away_score, match:matches!inner(home_score, away_score, status, match_date)")
    .eq("user_id", user.id)
    .eq("match.status", "finished")
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

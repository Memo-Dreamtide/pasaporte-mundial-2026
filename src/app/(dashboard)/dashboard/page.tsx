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
    .eq("status", "in_progress")
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

  const { data: exactMatches } = await supabase
    .from("predictions")
    .select("id")
    .eq("user_id", user.id)
    .eq("points_earned", 10)
  const exactCount = exactMatches?.length || 0

  const totalMatches = 104

  const matchData = currentMatch ? {
    homeCode: currentMatch.home_team?.code || "???",
    awayCode: currentMatch.away_team?.code || "???",
    homeFlag: currentMatch.home_team?.flag_emoji || "",
    awayFlag: currentMatch.away_team?.flag_emoji || "",
    homeScore: currentMatch.home_score ?? 0,
    awayScore: currentMatch.away_score ?? 0,
    matchDate: currentMatch.match_date,
    isLive: currentMatch.status === "in_progress",
    status: currentMatch.status as string,
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
      match={matchData}
      authProvider={authProvider}
    />
  )
}

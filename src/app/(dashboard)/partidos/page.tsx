import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import PartidosClient from "./PartidosClient"

export default async function PartidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .order("match_date", { ascending: true })

  // Get live matches
  const { data: liveMatches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .eq("status", "live")
    .order("match_date", { ascending: true })

  // If no live matches, get next scheduled
  let featuredMatches = liveMatches && liveMatches.length > 0 ? liveMatches : null
  if (!featuredMatches) {
    const { data: nextMatches } = await supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .eq("status", "scheduled")
      .order("match_date", { ascending: true })
      .limit(2)
    featuredMatches = nextMatches
  }

  // Get scorers for live/featured matches
  const featuredIds = featuredMatches?.map(m => m.id) || []
  const { data: scorers } = featuredIds.length > 0
    ? await supabase
        .from("match_scorers")
        .select("*")
        .in("match_id", featuredIds)
        .order("minute", { ascending: true })
    : { data: [] }

  const authProvider = user.app_metadata?.provider || "email"

  return (
    <PartidosClient
      userName={profile?.full_name || user.email || "Usuario"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
      rankPosition={profile?.rank_position || 0}
      totalPoints={profile?.total_points || 0}
      predictionsCount={profile?.predictions_count || 0}
      exactScores={profile?.exact_scores || 0}
      matches={matches || []}
      featuredMatches={featuredMatches || []}
      scorers={scorers || []}
      authProvider={authProvider}
    />
  )
}

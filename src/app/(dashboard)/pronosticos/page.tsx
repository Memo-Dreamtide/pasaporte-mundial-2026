import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import PronosticosClient from "./PronosticosClient"

export default async function PronosticosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, total_points, rank_position, exact_scores, predictions_count")
    .eq("id", user.id)
    .single()

  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .order("match_date", { ascending: true })

  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", user.id)

  const totalMatches = matches?.length || 104
  const authProvider = user.app_metadata?.provider || "email"

  return (
    <PronosticosClient
      userName={profile?.full_name || user.email || "Usuario"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
      rankPosition={profile?.rank_position || 0}
      totalPoints={profile?.total_points || 0}
      predictionsCount={profile?.predictions_count || 0}
      exactScores={profile?.exact_scores || 0}
      matches={matches || []}
      predictions={predictions || []}
      totalMatches={totalMatches}
      authProvider={authProvider}
    />
  )
}

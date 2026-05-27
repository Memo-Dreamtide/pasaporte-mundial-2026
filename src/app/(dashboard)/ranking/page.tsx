import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import RankingClient from "./RankingClient"

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const authProvider = user.app_metadata?.provider || "email"

  return (
    <RankingClient
      userName={profile?.full_name || user.email || "Usuario"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
      rankPosition={profile?.rank_position || 0}
      totalPoints={profile?.total_points || 0}
      predictionsCount={profile?.predictions_count || 0}
      exactScores={profile?.exact_scores || 0}
      currentUserId={user.id}
      authProvider={authProvider}
    />
  )
}

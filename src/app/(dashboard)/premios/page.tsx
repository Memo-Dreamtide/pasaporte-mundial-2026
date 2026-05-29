import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import PremiosClient from "./PremiosClient"

export default async function PremiosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, total_points, rank_position, exact_scores, predictions_count")
    .eq("id", user.id)
    .single()

  const { data: prizes } = await supabase
    .from("prizes")
    .select("*")
    .order("place", { ascending: true })

  const { data: raffles } = await supabase
    .from("weekly_raffles")
    .select("*")
    .order("week_number", { ascending: true })

  const authProvider = user.app_metadata?.provider || "email"

  return (
    <PremiosClient
      userName={profile?.full_name || user.email || "Usuario"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
      rankPosition={profile?.rank_position || 0}
      totalPoints={profile?.total_points || 0}
      predictionsCount={profile?.predictions_count || 0}
      exactScores={profile?.exact_scores || 0}
      prizes={prizes || []}
      raffles={raffles || []}
      authProvider={authProvider}
    />
  )
}

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import RankingTable from "@/components/ranking/RankingTable"

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, total_points, exact_scores, predictions_count, streak, rank_position")
    .gt("predictions_count", 0)
    .order("total_points", { ascending: false })
    .order("exact_scores", { ascending: false })
    .limit(100)

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, full_name, total_points, exact_scores, predictions_count, streak, rank_position")
    .eq("id", user.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ranking</h1>
            <p className="text-gray-400">Los mejores predictores</p>
          </div>
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            Dashboard
          </a>
        </div>
        <RankingTable
          profiles={profiles || []}
          currentUserId={user.id}
          myProfile={myProfile}
        />
      </div>
    </main>
  )
}

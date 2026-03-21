import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Image from "next/image"
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
    <div>
      <header className="px-4 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Image src="/images/logo.png" alt="PM" width={32} height={32} />
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">RANKING</h1>
            <p className="text-white/30 text-xs">Los mejores predictores</p>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <RankingTable
          profiles={profiles || []}
          currentUserId={user.id}
          myProfile={myProfile}
        />
      </div>
    </div>
  )
}

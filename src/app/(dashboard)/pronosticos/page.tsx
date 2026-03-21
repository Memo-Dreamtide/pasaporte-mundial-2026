import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import PronosticosApp from "@/components/pronosticos/PronosticosApp"

export default async function PronosticosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .order("match_date", { ascending: true })

  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", user.id)

  return (
    <div>
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-white tracking-tight">PRONÓSTICOS</h1>
          <p className="text-white/30 text-xs font-medium mt-1">Predice los marcadores y gana puntos</p>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4">
        <PronosticosApp
          matches={matches || []}
          predictions={predictions || []}
        />
      </div>
    </div>
  )
}

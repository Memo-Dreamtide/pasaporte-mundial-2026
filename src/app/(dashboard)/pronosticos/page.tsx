import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import PronosticosList from "@/components/pronosticos/PronosticosList"

export default async function PronosticosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq("status", "scheduled")
    .order("match_date", { ascending: true })

  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", user.id)

  const predictedMatchIds = new Set(predictions?.map(p => p.match_id) || [])
  const predictionsMap = new Map(predictions?.map(p => [p.match_id, p]) || [])

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pronósticos</h1>
            <p className="text-gray-400">Selecciona un partido para pronosticar</p>
          </div>
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            Dashboard
          </a>
        </div>
        <PronosticosList
          matches={matches || []}
          predictedMatchIds={Array.from(predictedMatchIds)}
          predictionsMap={Object.fromEntries(predictionsMap)}
        />
      </div>
    </main>
  )
}

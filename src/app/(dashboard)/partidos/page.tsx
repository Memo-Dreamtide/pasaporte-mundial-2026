import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import PartidosList from "@/components/partidos/PartidosList"

export default async function PartidosPage() {
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
    .order("match_date", { ascending: true })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Partidos</h1>
            <p className="text-gray-400">Pasaporte Mundial 2026</p>
          </div>
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            Dashboard
          </a>
        </div>
        <PartidosList matches={matches || []} />
      </div>
    </main>
  )
}

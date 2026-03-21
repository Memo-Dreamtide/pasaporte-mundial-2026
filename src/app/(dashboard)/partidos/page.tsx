import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Image from "next/image"
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
    <div>
      <header className="px-4 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Image src="/images/logo.png" alt="PM" width={32} height={32} />
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">PARTIDOS</h1>
            <p className="text-white/30 text-xs">Pasaporte Mundial 2026</p>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <PartidosList matches={matches || []} />
      </div>
    </div>
  )
}

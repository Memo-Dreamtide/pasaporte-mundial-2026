import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import NewsFeed from "@/components/ui/NewsFeed"

function formatMatchDate(dateStr: string) {
  const date = new Date(dateStr)
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]
  return `${days[date.getUTCDay()]} ${date.getUTCDate()} ${months[date.getUTCMonth()]}`
}

function formatMatchTime(dateStr: string) {
  const date = new Date(dateStr)
  const hours = date.getUTCHours().toString().padStart(2, "0")
  const minutes = date.getUTCMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: nextMatches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .eq("status", "scheduled")
    .order("match_date", { ascending: true })
    .limit(4)

  const { data: predictions } = await supabase.from("predictions").select("match_id").eq("user_id", user.id)
  const predictedIds = new Set(predictions?.map(p => p.match_id) || [])

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(5)

  return (
    <div>
      {/* Header - sin logo */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white/30 text-xs font-medium">Bienvenido</p>
            <h1 className="text-lg font-black text-white">{profile?.full_name || user.email}</h1>
          </div>
          <Link href="/perfil" className="relative">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black" style={{ background: "linear-gradient(135deg, rgba(255,215,13,0.2), rgba(69,143,255,0.2))", color: "#ffd70d", border: "1px solid rgba(255,215,13,0.15)" }}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        {/* Main Stats Card */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: "linear-gradient(145deg, rgba(255,215,13,0.08) 0%, rgba(5,17,25,0.9) 50%, rgba(69,143,255,0.06) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/30 text-xs font-semibold tracking-wider uppercase">Tus estadísticas</p>
            <p className="text-xs font-bold" style={{ color: "#2ac105" }}>Temporada 2026</p>
          </div>
          <div className="flex items-end gap-2 mb-5">
            <span className="text-5xl font-black" style={{ color: "#ffd70d" }}>{profile?.total_points || 0}</span>
            <span className="text-white/30 text-sm font-semibold mb-2">PTS</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <p className="text-xl font-black" style={{ color: "#458fff" }}>#{profile?.rank_position || "-"}</p>
              <p className="text-white/25 text-[10px] font-semibold mt-1">RANKING</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <p className="text-xl font-black text-white">{profile?.predictions_count || 0}</p>
              <p className="text-white/25 text-[10px] font-semibold mt-1">JUGADOS</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <p className="text-xl font-black" style={{ color: "#2ac105" }}>{profile?.exact_scores || 0}</p>
              <p className="text-white/25 text-[10px] font-semibold mt-1">EXACTOS</p>
            </div>
          </div>
        </div>

        {/* Banner Sponsor Platino */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(69,143,255,0.03)" }}>
          <div className="flex items-center justify-center h-[100px] md:h-[140px]">
            <div className="text-center">
              <p className="text-white/10 text-xs md:text-lg font-black tracking-wider">TU MARCA AQUÍ</p>
              <p className="text-white/5 text-[9px] mt-1">Sponsor Principal — 1200 x 400</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link href="/pronosticos" className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, rgba(42,193,5,0.15), rgba(42,193,5,0.05))", border: "1px solid rgba(42,193,5,0.2)" }}>
            <p className="text-2xl font-black" style={{ color: "#2ac105" }}>JUGAR</p>
            <p className="text-white/30 text-xs font-medium mt-1">Haz tus pronósticos</p>
          </Link>
          <Link href="/ranking" className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, rgba(69,143,255,0.15), rgba(69,143,255,0.05))", border: "1px solid rgba(69,143,255,0.15)" }}>
            <p className="text-2xl font-black" style={{ color: "#458fff" }}>RANKING</p>
            <p className="text-white/30 text-xs font-medium mt-1">Tabla de posiciones</p>
          </Link>
        </div>

        {/* News Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-white tracking-wider uppercase">Noticias</h2>
            <span className="text-[10px] font-bold tracking-wider" style={{ color: "#f10a3c" }}>EN VIVO</span>
          </div>
          <NewsFeed news={news || []} />
        </div>

        {/* Banner Secundario */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(255,215,13,0.02)" }}>
          <div className="flex items-center justify-center h-[70px] md:h-[100px]">
            <div className="text-center">
              <p className="text-white/8 text-xs md:text-sm font-black tracking-wider">ESPACIO PUBLICITARIO</p>
              <p className="text-white/5 text-[8px] mt-1">1200 x 250</p>
            </div>
          </div>
        </div>

        {/* Próximos Partidos con fecha */}
        <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white tracking-wider uppercase">Próximos Partidos</h2>
            <Link href="/partidos" className="text-[10px] font-bold tracking-wider" style={{ color: "#458fff" }}>VER TODOS</Link>
          </div>
          <div className="space-y-2">
            {nextMatches && nextMatches.length > 0 ? nextMatches.map((match) => {
              const isPredicted = predictedIds.has(match.id)
              return (
                <Link key={match.id} href="/pronosticos" className="block rounded-xl p-3 transition-colors hover:bg-white/[0.03]" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/15 text-[9px] font-semibold">{formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)} UTC</span>
                    {isPredicted ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(42,193,5,0.15)", color: "#2ac105" }}>LISTO</span>
                    ) : (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,215,13,0.1)", color: "#ffd70d" }}>PENDIENTE</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="text-2xl">{match.home_team.flag_emoji}</span>
                      <span className="text-white text-xs font-black">{match.home_team.code}</span>
                    </div>
                    <span className="text-white/10 text-xs font-black px-3">VS</span>
                    <div className="flex items-center gap-2.5 flex-1 justify-end">
                      <span className="text-white text-xs font-black">{match.away_team.code}</span>
                      <span className="text-2xl">{match.away_team.flag_emoji}</span>
                    </div>
                  </div>
                </Link>
              )
            }) : (
              <p className="text-white/15 text-center py-4 text-xs">No hay partidos programados</p>
            )}
          </div>
        </div>

        {/* Bottom Grid - solo 2 botones, sin perfil */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link href="/grupos" className="rounded-xl p-4 text-center transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-white font-black text-sm">GRUPOS</p>
            <p className="text-white/20 text-[10px] mt-1">12 grupos</p>
          </Link>
          <Link href="/premios" className="rounded-xl p-4 text-center transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="font-black text-sm" style={{ color: "#ffd70d" }}>PREMIOS</p>
            <p className="text-white/20 text-[10px] mt-1">Top 5 + sorteos</p>
          </Link>
        </div>

        {/* Banner Footer */}
        <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid rgba(255,255,255,0.03)", backgroundColor: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center justify-center h-[50px] md:h-[70px]">
            <p className="text-white/5 text-[9px] font-black tracking-wider">ESPACIO PUBLICITARIO</p>
          </div>
        </div>
      </div>
    </div>
  )
}

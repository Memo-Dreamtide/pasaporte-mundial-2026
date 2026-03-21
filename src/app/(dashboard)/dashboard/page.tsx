import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: nextMatches } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq("status", "scheduled")
    .order("match_date", { ascending: true })
    .limit(4)

  const { data: predictions } = await supabase
    .from("predictions")
    .select("match_id")
    .eq("user_id", user.id)

  const predictedIds = new Set(predictions?.map(p => p.match_id) || [])

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pasaporte Mundial</h1>
            <p className="text-gray-400">Bienvenido, {profile?.full_name || user.email}</p>
          </div>
          <Link href="/perfil" className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-lg font-bold text-yellow-400">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Puntos</p>
            <p className="text-2xl font-bold text-yellow-400">{profile?.total_points || 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Ranking</p>
            <p className="text-2xl font-bold">#{profile?.rank_position || "-"}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Pronósticos</p>
            <p className="text-2xl font-bold">{profile?.predictions_count || 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Exactos</p>
            <p className="text-2xl font-bold text-green-400">{profile?.exact_scores || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link href="/pronosticos" className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 hover:bg-yellow-500/20 transition-colors text-center">
            <p className="text-yellow-400 font-bold text-lg mb-1">Pronosticar</p>
            <p className="text-gray-400 text-xs">Haz tus predicciones</p>
          </Link>
          <Link href="/partidos" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <p className="text-white font-bold text-lg mb-1">Partidos</p>
            <p className="text-gray-400 text-xs">Ver calendario</p>
          </Link>
          <Link href="/ranking" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <p className="text-white font-bold text-lg mb-1">Ranking</p>
            <p className="text-gray-400 text-xs">Tabla de posiciones</p>
          </Link>
          <Link href="/grupos" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <p className="text-white font-bold text-lg mb-1">Grupos</p>
            <p className="text-gray-400 text-xs">12 grupos</p>
          </Link>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Próximos Partidos</h2>
            <Link href="/partidos" className="text-yellow-400 text-sm hover:text-yellow-300">
              Ver todos
            </Link>
          </div>
          {nextMatches && nextMatches.length > 0 ? (
            <div className="space-y-3">
              {nextMatches.map((match) => {
                const isPredicted = predictedIds.has(match.id)
                return (
                  <Link
                    key={match.id}
                    href="/pronosticos"
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{match.home_team.flag_emoji}</span>
                      <span className="text-white text-sm font-medium">{match.home_team.code}</span>
                    </div>
                    <div className="text-center px-3">
                      {isPredicted ? (
                        <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">Listo</span>
                      ) : (
                        <span className="text-gray-600 text-sm">vs</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-white text-sm font-medium">{match.away_team.code}</span>
                      <span className="text-xl">{match.away_team.flag_emoji}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay partidos programados</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/premios" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
            <p className="text-white font-bold mb-1">Premios</p>
            <p className="text-gray-400 text-xs">Top 5 y sorteos semanales</p>
          </Link>
          <Link href="/perfil" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
            <p className="text-white font-bold mb-1">Mi Perfil</p>
            <p className="text-gray-400 text-xs">Stats y configuración</p>
          </Link>
        </div>

      </div>
    </main>
  )
}

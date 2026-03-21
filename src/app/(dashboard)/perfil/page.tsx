import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function PerfilPage() {
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

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-SV", { year: "numeric", month: "short" })
    : "-"

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Perfil</h1>
            <p className="text-gray-400">Tu información</p>
          </div>
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            Dashboard
          </a>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-yellow-400">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.full_name || "Sin nombre"}</h2>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
              {profile?.department && (
                <p className="text-gray-500 text-xs mt-1">{profile.department}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs">Puntos totales</p>
              <p className="text-xl font-bold text-yellow-400">{profile?.total_points || 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs">Ranking</p>
              <p className="text-xl font-bold">#{profile?.rank_position || "-"}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs">Pronósticos</p>
              <p className="text-xl font-bold">{profile?.predictions_count || 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs">Exactos</p>
              <p className="text-xl font-bold text-green-400">{profile?.exact_scores || 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs">Racha actual</p>
              <p className="text-xl font-bold">{profile?.streak || 0}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs">Miembro desde</p>
              <p className="text-sm font-medium text-white">{memberSince}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <a href="/pronosticos" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <p className="font-medium text-white">Mis Pronósticos</p>
            <p className="text-gray-500 text-sm">Ver y editar tus pronósticos</p>
          </a>
          <a href="/ranking" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <p className="font-medium text-white">Ranking</p>
            <p className="text-gray-500 text-sm">Ver tu posición nacional</p>
          </a>
          <a href="/premios" className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <p className="font-medium text-white">Premios</p>
            <p className="text-gray-500 text-sm">Ver premios disponibles</p>
          </a>
        </div>

        <div className="mt-6">
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="w-full bg-red-500/10 text-red-400 py-3 rounded-xl hover:bg-red-500/20 transition-colors font-medium border border-red-500/20">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function PremiosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: prizes } = await supabase
    .from("prizes")
    .select("*")
    .order("place", { ascending: true })

  const { data: raffles } = await supabase
    .from("weekly_raffles")
    .select("*")
    .order("week_number", { ascending: true })

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Premios</h1>
            <p className="text-gray-400">Lo que puedes ganar</p>
          </div>
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            Dashboard
          </a>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Top 5 — Premios Finales</h2>
          <p className="text-gray-400 text-sm mb-6">
            Los 5 mejores predictores al finalizar el torneo ganan estos premios.
          </p>
          <div className="space-y-3">
            {prizes?.map((prize) => {
              const positionColors: Record<number, string> = {
                1: "border-yellow-500/40 bg-yellow-500/5",
                2: "border-gray-400/40 bg-gray-400/5",
                3: "border-amber-600/40 bg-amber-600/5",
                4: "border-white/10 bg-white/5",
                5: "border-white/10 bg-white/5",
              }
              const positionText: Record<number, string> = {
                1: "text-yellow-400",
                2: "text-gray-300",
                3: "text-amber-500",
                4: "text-white",
                5: "text-white",
              }

              return (
                <div
                  key={prize.id}
                  className={`rounded-xl p-5 border ${positionColors[prize.place] || "border-white/10 bg-white/5"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-bold ${positionText[prize.place] || "text-white"}`}>
                        {prize.place}°
                      </span>
                      <div>
                        <p className="font-bold text-white">{prize.prize_name}</p>
                        <p className="text-gray-400 text-sm">{prize.prize_description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">{prize.sponsor_name}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold text-green-400 mb-4">Sorteos Semanales</h2>
          <p className="text-gray-400 text-sm mb-6">
            Cada semana, todos los que pronosticaron al menos 1 partido entran automáticamente al sorteo. Los ganadores se anuncian en vivo por redes sociales.
          </p>
          <div className="space-y-3">
            {raffles?.map((raffle) => (
              <div
                key={raffle.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-white">{raffle.prize_name}</p>
                  <p className="text-gray-500 text-sm">{raffle.sponsor_name}</p>
                </div>
                <div className="text-right">
                  {raffle.winner_id ? (
                    <span className="text-green-400 text-sm font-medium">Sorteado</span>
                  ) : (
                    <span className="text-yellow-400 text-sm font-medium">Próximo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="font-bold text-white mb-3">Como funciona</h3>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>1. Pronostica los partidos antes del inicio de cada encuentro</p>
            <p>2. Acumula puntos según la precisión de tus pronósticos</p>
            <p>3. Sube en el ranking nacional y compite por los premios del Top 5</p>
            <p>4. Con solo 1 pronóstico por semana ya participas en el sorteo semanal</p>
          </div>
        </div>
      </div>
    </main>
  )
}

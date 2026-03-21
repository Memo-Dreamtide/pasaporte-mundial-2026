import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Image from "next/image"

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

  const positionColors: Record<number, { bg: string; border: string; text: string }> = {
    1: { bg: "rgba(255,215,13,0.06)", border: "rgba(255,215,13,0.2)", text: "#ffd70d" },
    2: { bg: "rgba(69,143,255,0.06)", border: "rgba(69,143,255,0.2)", text: "#458fff" },
    3: { bg: "rgba(241,10,60,0.06)", border: "rgba(241,10,60,0.2)", text: "#f10a3c" },
    4: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.05)", text: "#ffffff" },
    5: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.05)", text: "#ffffff" },
  }

  return (
    <div>
      <header className="px-4 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Image src="/images/logo.png" alt="PM" width={32} height={32} />
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">PREMIOS</h1>
            <p className="text-white/30 text-xs">Lo que puedes ganar</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Top 5 */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-white mb-1">TOP 5 — <span style={{ color: "#ffd70d" }}>PREMIOS FINALES</span></h2>
          <p className="text-white/30 text-sm mb-6">Los 5 mejores predictores al finalizar el torneo ganan estos premios</p>
          <div className="space-y-3">
            {prizes?.map((prize) => {
              const colors = positionColors[prize.place] || positionColors[5]
              return (
                <div
                  key={prize.id}
                  className="rounded-xl p-5 border"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-black" style={{ color: colors.text }}>
                        {prize.place}°
                      </span>
                      <div>
                        <p className="font-bold text-white">{prize.prize_name}</p>
                        <p className="text-white/30 text-sm">{prize.prize_description}</p>
                      </div>
                    </div>
                    <span className="text-white/20 text-sm">{prize.sponsor_name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sorteos Semanales */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-white mb-1">SORTEOS <span style={{ color: "#2ac105" }}>SEMANALES</span></h2>
          <p className="text-white/30 text-sm mb-6">Pronostica al menos 1 partido por semana y participas automáticamente</p>
          <div className="space-y-3">
            {raffles?.map((raffle) => (
              <div
                key={raffle.id}
                className="rounded-xl p-4 border border-white/5 flex items-center justify-between"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <div>
                  <p className="font-bold text-white text-sm">{raffle.prize_name}</p>
                  <p className="text-white/20 text-xs">{raffle.sponsor_name}</p>
                </div>
                <div>
                  {raffle.winner_id ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(42,193,5,0.15)", color: "#2ac105" }}>Sorteado</span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(255,215,13,0.1)", color: "#ffd70d" }}>Próximo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="rounded-xl p-6 border border-white/5" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
          <h3 className="font-black text-white mb-4">CÓMO FUNCIONA</h3>
          <div className="space-y-3 text-white/40 text-sm">
            <p><span className="font-bold text-white/60">1.</span> Pronostica los partidos antes del inicio de cada encuentro</p>
            <p><span className="font-bold text-white/60">2.</span> Acumula puntos según la precisión de tus pronósticos</p>
            <p><span className="font-bold text-white/60">3.</span> Sube en el ranking nacional y compite por los premios del Top 5</p>
            <p><span className="font-bold text-white/60">4.</span> Con solo 1 pronóstico por semana ya participas en el sorteo semanal</p>
          </div>
        </div>
      </div>
    </div>
  )
}

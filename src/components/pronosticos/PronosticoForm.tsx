"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"

type Team = { id: string; name: string; code: string; flag_emoji: string; group_letter: string }
type Match = { id: string; match_number: number; home_team: Team | null; away_team: Team | null; stage: string; group_letter: string | null; match_date: string; stadium: string; city: string }
type Prediction = { id: string; match_id: string; home_score: number; away_score: number; scorer_name: string | null; points_earned: number | null }

export default function PronosticoForm({ match, existingPrediction, onClose, onSaved, onDeleted }: {
  match: Match
  existingPrediction: Prediction | null
  onClose: () => void
  onSaved: (matchId: string, prediction: Prediction) => void
  onDeleted: (matchId: string) => void
}) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(existingPrediction?.away_score ?? 0)
  const [scorer, setScorer] = useState(existingPrediction?.scorer_name ?? "")
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Debes iniciar sesión"); setLoading(false); return }

    const predictionData = { user_id: user.id, match_id: match.id, home_score: homeScore, away_score: awayScore, scorer_name: scorer.trim() || null, updated_at: new Date().toISOString() }
    let result
    if (existingPrediction) {
      result = await supabase.from("predictions").update(predictionData).eq("id", existingPrediction.id).select().single()
    } else {
      result = await supabase.from("predictions").insert(predictionData).select().single()
    }
    if (result.error) { setError(result.error.message); setLoading(false); return }
    onSaved(match.id, result.data as Prediction)
  }

  const handleDelete = async () => {
    if (!existingPrediction) return
    setDeleting(true)
    setError("")
    const { error } = await supabase.from("predictions").delete().eq("id", existingPrediction.id)
    if (error) { setError(error.message); setDeleting(false); return }
    onDeleted(match.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ backgroundColor: "rgba(5,17,25,0.92)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-md rounded-t-2xl md:rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(10,25,40,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-lg font-black text-white">TU PRONÓSTICO</h2>
            <p className="text-white/20 text-[10px] font-semibold">
              Grupo {match.group_letter} · {match.stadium}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 transition-colors text-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>&times;</button>
        </div>

        <div className="px-5 pb-6">
          {/* Score Input */}
          <div className="flex items-center justify-center gap-4 mb-6 mt-2">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-4xl">{match.home_team?.flag_emoji}</span>
              <p className="text-white font-black text-xs">{match.home_team?.code}</p>
              <div className="flex flex-col items-center gap-1 mt-1">
                <button onClick={() => setHomeScore(Math.min(homeScore + 1, 20))} className="w-9 h-7 rounded-lg text-white/30 hover:text-white/60 transition-colors text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>+</button>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,215,13,0.1), rgba(69,143,255,0.1))", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span className="text-3xl font-black text-white">{homeScore}</span>
                </div>
                <button onClick={() => setHomeScore(Math.max(homeScore - 1, 0))} className="w-9 h-7 rounded-lg text-white/30 hover:text-white/60 transition-colors text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>-</button>
              </div>
            </div>

            <span className="text-white/15 text-2xl font-black mt-8">:</span>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-4xl">{match.away_team?.flag_emoji}</span>
              <p className="text-white font-black text-xs">{match.away_team?.code}</p>
              <div className="flex flex-col items-center gap-1 mt-1">
                <button onClick={() => setAwayScore(Math.min(awayScore + 1, 20))} className="w-9 h-7 rounded-lg text-white/30 hover:text-white/60 transition-colors text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>+</button>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(255,215,13,0.1), rgba(69,143,255,0.1))", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span className="text-3xl font-black text-white">{awayScore}</span>
                </div>
                <button onClick={() => setAwayScore(Math.max(awayScore - 1, 0))} className="w-9 h-7 rounded-lg text-white/30 hover:text-white/60 transition-colors text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>-</button>
              </div>
            </div>
          </div>

          {/* Scorer Input */}
          <div className="mb-5">
            <label className="text-white/30 text-[10px] font-semibold tracking-wider uppercase block mb-2">Goleador del partido (+5 pts)</label>
            <input
              type="text"
              placeholder="Nombre del jugador"
              value={scorer}
              onChange={(e) => setScorer(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 focus:outline-none transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", caretColor: "#ffd70d" }}
            />
          </div>

          {error && (
            <p className="text-sm text-center py-2 rounded-lg mb-4" style={{ color: "#f10a3c", backgroundColor: "rgba(241,10,60,0.1)" }}>{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-black text-xs tracking-wider text-white/30 transition-colors hover:text-white/50" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              CANCELAR
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3.5 rounded-xl font-black text-xs tracking-wider transition-all duration-300 hover:scale-[1.02] disabled:opacity-50" style={{ backgroundColor: "#2ac105", color: "#051119" }}>
              {loading ? "GUARDANDO..." : existingPrediction ? "ACTUALIZAR" : "GUARDAR"}
            </button>
          </div>

          {/* Delete Button */}
          {existingPrediction && (
            <div className="mt-3">
              {confirmDelete ? (
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-wider text-white/30" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    NO, MANTENER
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-wider disabled:opacity-50" style={{ backgroundColor: "rgba(241,10,60,0.15)", color: "#f10a3c", border: "1px solid rgba(241,10,60,0.2)" }}>
                    {deleting ? "BORRANDO..." : "SÍ, BORRAR"}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-xl text-[10px] font-black tracking-wider transition-colors" style={{ color: "rgba(241,10,60,0.5)" }}>
                  BORRAR PRONÓSTICO
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"

type Team = {
  id: string
  name: string
  code: string
  flag_emoji: string
  group_letter: string
}

type Match = {
  id: string
  match_number: number
  home_team: Team
  away_team: Team
  stage: string
  group_letter: string | null
  match_date: string
  stadium: string
  city: string
}

type Prediction = {
  id: string
  match_id: string
  home_score: number
  away_score: number
  scorer_name: string | null
}

export default function PronosticoForm({
  match,
  existingPrediction,
  onClose,
  onSaved,
}: {
  match: Match
  existingPrediction: Prediction | null
  onClose: () => void
  onSaved: (matchId: string, prediction: Prediction) => void
}) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(existingPrediction?.away_score ?? 0)
  const [scorer, setScorer] = useState(existingPrediction?.scorer_name ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Debes iniciar sesión")
      setLoading(false)
      return
    }

    const predictionData = {
      user_id: user.id,
      match_id: match.id,
      home_score: homeScore,
      away_score: awayScore,
      scorer_name: scorer.trim() || null,
      updated_at: new Date().toISOString(),
    }

    let result

    if (existingPrediction) {
      result = await supabase
        .from("predictions")
        .update(predictionData)
        .eq("id", existingPrediction.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from("predictions")
        .insert(predictionData)
        .select()
        .single()
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    onSaved(match.id, result.data as Prediction)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Tu Pronóstico</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <div className="text-center mb-2">
          <span className="text-gray-500 text-xs">#{match.match_number} - Grupo {match.group_letter}</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <span className="text-4xl block mb-1">{match.home_team.flag_emoji}</span>
            <p className="font-bold text-white text-sm">{match.home_team.name}</p>
          </div>

          <div className="flex items-center gap-3 px-4">
            <div className="flex flex-col items-center">
              <button
                onClick={() => setHomeScore(Math.min(homeScore + 1, 20))}
                className="text-gray-400 hover:text-white text-lg"
              >
                +
              </button>
              <input
                type="number"
                min="0"
                max="20"
                value={homeScore}
                onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 h-14 bg-white/10 border border-white/20 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={() => setHomeScore(Math.max(homeScore - 1, 0))}
                className="text-gray-400 hover:text-white text-lg"
              >
                -
              </button>
            </div>

            <span className="text-gray-500 text-xl font-bold">-</span>

            <div className="flex flex-col items-center">
              <button
                onClick={() => setAwayScore(Math.min(awayScore + 1, 20))}
                className="text-gray-400 hover:text-white text-lg"
              >
                +
              </button>
              <input
                type="number"
                min="0"
                max="20"
                value={awayScore}
                onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 h-14 bg-white/10 border border-white/20 rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-yellow-500"
              />
              <button
                onClick={() => setAwayScore(Math.max(awayScore - 1, 0))}
                className="text-gray-400 hover:text-white text-lg"
              >
                -
              </button>
            </div>
          </div>

          <div className="text-center flex-1">
            <span className="text-4xl block mb-1">{match.away_team.flag_emoji}</span>
            <p className="font-bold text-white text-sm">{match.away_team.name}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-400 text-sm block mb-2">
            Goleador del partido (bonus +5 pts)
          </label>
          <input
            type="text"
            placeholder="Nombre del jugador"
            value={scorer}
            onChange={(e) => setScorer(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500 transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 text-gray-300 py-3 rounded-xl hover:bg-white/20 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-yellow-500 text-black py-3 rounded-xl hover:bg-yellow-400 transition-colors font-bold disabled:opacity-50"
          >
            {loading ? "Guardando..." : existingPrediction ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}

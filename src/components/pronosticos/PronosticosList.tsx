"use client"

import { useState } from "react"
import PronosticoForm from "./PronosticoForm"

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
  home_score: number | null
  away_score: number | null
  stage: string
  group_letter: string | null
  match_date: string
  stadium: string
  city: string
  status: string
}

type Prediction = {
  id: string
  match_id: string
  home_score: number
  away_score: number
  scorer_name: string | null
}

export default function PronosticosList({
  matches,
  predictedMatchIds,
  predictionsMap,
}: {
  matches: Match[]
  predictedMatchIds: string[]
  predictionsMap: Record<string, Prediction>
}) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [predicted, setPredicted] = useState<Set<string>>(new Set(predictedMatchIds))
  const [localPredictions, setLocalPredictions] = useState<Record<string, Prediction>>(predictionsMap)

  const handleSaved = (matchId: string, prediction: Prediction) => {
    setPredicted((prev) => new Set([...prev, matchId]))
    setLocalPredictions((prev) => ({ ...prev, [matchId]: prediction }))
    setSelectedMatch(null)
  }

  return (
    <div>
      {selectedMatch && (
        <PronosticoForm
          match={selectedMatch}
          existingPrediction={localPredictions[selectedMatch.id] || null}
          onClose={() => setSelectedMatch(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No hay partidos disponibles para pronosticar</p>
          </div>
        ) : (
          matches.map((match) => {
            const isPredicted = predicted.has(match.id)
            const prediction = localPredictions[match.id]

            return (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`w-full bg-white/5 rounded-xl p-4 border transition-colors text-left hover:bg-white/10 ${
                  isPredicted ? "border-green-500/30" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-xs">#{match.match_number} - Grupo {match.group_letter}</span>
                  {isPredicted ? (
                    <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
                      Pronosticado
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-xs font-medium bg-yellow-500/10 px-2 py-0.5 rounded-full">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{match.home_team.flag_emoji}</span>
                    <span className="font-bold text-white text-sm">{match.home_team.code}</span>
                  </div>

                  <div className="text-center px-4">
                    {isPredicted && prediction ? (
                      <span className="text-lg font-bold text-green-400">
                        {prediction.home_score} - {prediction.away_score}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">vs</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-bold text-white text-sm">{match.away_team.code}</span>
                    <span className="text-2xl">{match.away_team.flag_emoji}</span>
                  </div>
                </div>

                {isPredicted && prediction?.scorer_name && (
                  <p className="text-gray-500 text-xs mt-2 text-center">
                    Goleador: {prediction.scorer_name}
                  </p>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import PronosticoForm from "./PronosticoForm"

type Team = { id: string; name: string; code: string; flag_emoji: string; group_letter: string }
type Match = { id: string; match_number: number; home_team: Team | null; away_team: Team | null; home_score: number | null; away_score: number | null; stage: string; group_letter: string | null; match_date: string; stadium: string; city: string; status: string }
type Prediction = { id: string; match_id: string; home_score: number; away_score: number; scorer_name: string | null; points_earned: number | null }

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"]
const JORNADAS = ["1","2","3"]

const STAGE_LABELS: Record<string, string> = {
  round_of_32: "Dieciseisavos",
  round_of_16: "Octavos de Final",
  quarter: "Cuartos de Final",
  semi: "Semifinales",
  third_place: "Tercer Lugar",
  final: "Final",
}

const ELIM_STAGES = ["round_of_32", "round_of_16", "quarter", "semi", "third_place", "final"]

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]
  return `${days[date.getUTCDay()]} ${date.getUTCDate()} ${months[date.getUTCMonth()]}`
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getUTCHours().toString().padStart(2,"0")}:${date.getUTCMinutes().toString().padStart(2,"0")}`
}

function isLocked(matchDate: string) {
  const kickoff = new Date(matchDate)
  const now = new Date()
  return now >= new Date(kickoff.getTime() - 60000)
}

function getJornada(matchNumber: number): string {
  if (matchNumber <= 24) return "1"
  if (matchNumber <= 48) return "2"
  return "3"
}

export default function PronosticosApp({ matches, predictions }: { matches: Match[]; predictions: Prediction[] }) {
  const [tab, setTab] = useState<"groups" | "knockout">("groups")
  const [groupFilter, setGroupFilter] = useState<string>("todos")
  const [jornadaFilter, setJornadaFilter] = useState<string>("todos")
  const [elimStage, setElimStage] = useState<string>("round_of_32")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showHowTo, setShowHowTo] = useState(false)
  const [showPoints, setShowPoints] = useState(false)
  const [predictedMap, setPredictedMap] = useState<Record<string, Prediction>>(
    Object.fromEntries(predictions.map(p => [p.match_id, p]))
  )

  const groupMatches = matches.filter(m => m.stage === "group")
  const knockoutMatches = matches.filter(m => m.stage !== "group")
  const totalPredicted = Object.keys(predictedMap).length
  const totalGroupMatches = groupMatches.length

  const filteredGroups = groupMatches.filter(m => {
    if (groupFilter !== "todos" && m.group_letter !== groupFilter) return false
    if (jornadaFilter !== "todos" && getJornada(m.match_number) !== jornadaFilter) return false
    return true
  })

  const filteredKnockout = knockoutMatches.filter(m => m.stage === elimStage)

  const handleSaved = (matchId: string, prediction: Prediction) => {
    setPredictedMap(prev => ({ ...prev, [matchId]: prediction }))
    setSelectedMatch(null)
  }

  const handleDeleted = (matchId: string) => {
    setPredictedMap(prev => {
      const copy = { ...prev }
      delete copy[matchId]
      return copy
    })
    setSelectedMatch(null)
  }

  return (
    <div className="pb-6">
      {/* Progress Bar */}
      <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-[10px] font-semibold tracking-wider uppercase">Progreso</span>
          <span className="text-xs font-black" style={{ color: "#ffd70d" }}>{totalPredicted}/{totalGroupMatches}</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${totalGroupMatches > 0 ? (totalPredicted / totalGroupMatches) * 100 : 0}%`, backgroundColor: "#2ac105" }} />
        </div>
      </div>

      {/* How to Play & Points */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button onClick={() => setShowHowTo(!showHowTo)} className="rounded-xl p-3 text-left transition-colors" style={{ backgroundColor: showHowTo ? "rgba(69,143,255,0.1)" : "rgba(255,255,255,0.03)", border: showHowTo ? "1px solid rgba(69,143,255,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-black" style={{ color: "#458fff" }}>CÓMO JUGAR</p>
          <p className="text-white/20 text-[9px] mt-0.5">Aprende las reglas</p>
        </button>
        <button onClick={() => setShowPoints(!showPoints)} className="rounded-xl p-3 text-left transition-colors" style={{ backgroundColor: showPoints ? "rgba(255,215,13,0.1)" : "rgba(255,255,255,0.03)", border: showPoints ? "1px solid rgba(255,215,13,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-black" style={{ color: "#ffd70d" }}>TABLA DE PUNTOS</p>
          <p className="text-white/20 text-[9px] mt-0.5">Cómo ganar más</p>
        </button>
      </div>

      {/* How to Play Panel */}
      {showHowTo && (
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: "rgba(69,143,255,0.06)", border: "1px solid rgba(69,143,255,0.15)" }}>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: "rgba(69,143,255,0.2)", color: "#458fff" }}>1</span>
              <p className="text-white/60 text-xs">Selecciona un partido y predice el marcador final antes de que inicie</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: "rgba(69,143,255,0.2)", color: "#458fff" }}>2</span>
              <p className="text-white/60 text-xs">Opcionalmente selecciona un goleador del partido para ganar puntos bonus</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: "rgba(69,143,255,0.2)", color: "#458fff" }}>3</span>
              <p className="text-white/60 text-xs">Los pronósticos se bloquean 1 minuto antes del inicio del partido</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: "rgba(69,143,255,0.2)", color: "#458fff" }}>4</span>
              <p className="text-white/60 text-xs">Puedes editar o borrar tu pronóstico en cualquier momento antes del bloqueo</p>
            </div>
          </div>
        </div>
      )}

      {/* Points Table Panel */}
      {showPoints && (
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: "rgba(255,215,13,0.06)", border: "1px solid rgba(255,215,13,0.15)" }}>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-white/60 text-xs">Marcador exacto</span>
              <span className="text-xs font-black" style={{ color: "#2ac105" }}>+10 pts</span>
            </div>
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-white/60 text-xs">Resultado correcto (1X2)</span>
              <span className="text-xs font-black text-white">+4 pts</span>
            </div>
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-white/60 text-xs">Diferencia de goles correcta</span>
              <span className="text-xs font-black text-white">+3 pts</span>
            </div>
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-white/60 text-xs">Goleador del partido</span>
              <span className="text-xs font-black" style={{ color: "#ffd70d" }}>+5 pts bonus</span>
            </div>
            <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-white/60 text-xs">Racha de 3+ aciertos</span>
              <span className="text-xs font-black" style={{ color: "#458fff" }}>+3 pts bonus</span>
            </div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-white/30 text-[10px] font-semibold tracking-wider uppercase mb-2">Multiplicadores por fase</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Grupos", mult: "x1.0", color: "#ffffff" },
                { label: "32avos", mult: "x1.25", color: "#458fff" },
                { label: "8vos", mult: "x1.5", color: "#458fff" },
                { label: "4tos", mult: "x2.0", color: "#ffd70d" },
                { label: "Semis", mult: "x2.5", color: "#ffd70d" },
                { label: "Final", mult: "x3.0", color: "#f10a3c" },
              ].map(m => (
                <div key={m.label} className="rounded-lg px-2 py-1 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <p className="text-[9px] text-white/30">{m.label}</p>
                  <p className="text-[10px] font-black" style={{ color: m.color }}>{m.mult}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("groups")} className="flex-1 py-3 rounded-xl text-xs font-black tracking-wider transition-all" style={{ backgroundColor: tab === "groups" ? "rgba(42,193,5,0.15)" : "rgba(255,255,255,0.03)", color: tab === "groups" ? "#2ac105" : "rgba(255,255,255,0.3)", border: tab === "groups" ? "1px solid rgba(42,193,5,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
          FASE DE GRUPOS
        </button>
        <button onClick={() => setTab("knockout")} className="flex-1 py-3 rounded-xl text-xs font-black tracking-wider transition-all" style={{ backgroundColor: tab === "knockout" ? "rgba(241,10,60,0.15)" : "rgba(255,255,255,0.03)", color: tab === "knockout" ? "#f10a3c" : "rgba(255,255,255,0.3)", border: tab === "knockout" ? "1px solid rgba(241,10,60,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
          ELIMINATORIAS
        </button>
      </div>

      {/* Groups Tab */}
      {tab === "groups" && (
        <>
          {/* Group Filter */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setGroupFilter("todos")} className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider whitespace-nowrap" style={{ backgroundColor: groupFilter === "todos" ? "rgba(42,193,5,0.15)" : "rgba(255,255,255,0.03)", color: groupFilter === "todos" ? "#2ac105" : "rgba(255,255,255,0.2)", border: groupFilter === "todos" ? "1px solid rgba(42,193,5,0.2)" : "1px solid rgba(255,255,255,0.04)" }}>TODOS</button>
            {GROUPS.map(g => (
              <button key={g} onClick={() => setGroupFilter(g)} className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider whitespace-nowrap" style={{ backgroundColor: groupFilter === g ? "rgba(42,193,5,0.15)" : "rgba(255,255,255,0.03)", color: groupFilter === g ? "#2ac105" : "rgba(255,255,255,0.2)", border: groupFilter === g ? "1px solid rgba(42,193,5,0.2)" : "1px solid rgba(255,255,255,0.04)" }}>{g}</button>
            ))}
          </div>

          {/* Jornada Filter */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setJornadaFilter("todos")} className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider" style={{ backgroundColor: jornadaFilter === "todos" ? "rgba(69,143,255,0.15)" : "rgba(255,255,255,0.03)", color: jornadaFilter === "todos" ? "#458fff" : "rgba(255,255,255,0.2)", border: jornadaFilter === "todos" ? "1px solid rgba(69,143,255,0.2)" : "1px solid rgba(255,255,255,0.04)" }}>TODAS</button>
            {JORNADAS.map(j => (
              <button key={j} onClick={() => setJornadaFilter(j)} className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider" style={{ backgroundColor: jornadaFilter === j ? "rgba(69,143,255,0.15)" : "rgba(255,255,255,0.03)", color: jornadaFilter === j ? "#458fff" : "rgba(255,255,255,0.2)", border: jornadaFilter === j ? "1px solid rgba(69,143,255,0.2)" : "1px solid rgba(255,255,255,0.04)" }}>JORNADA {j}</button>
            ))}
          </div>

          {/* Group Matches */}
          {filteredGroups.length === 0 ? (
            <p className="text-center text-white/15 py-12 text-sm">No hay partidos con este filtro</p>
          ) : (
            (() => {
              const byGroup: Record<string, Match[]> = {}
              filteredGroups.forEach(m => {
                const key = m.group_letter || "?"
                if (!byGroup[key]) byGroup[key] = []
                byGroup[key].push(m)
              })
              return Object.entries(byGroup).map(([group, gMatches]) => (
                <div key={group} className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#2ac105" }} />
                    <span className="text-[10px] font-black tracking-wider" style={{ color: "#2ac105" }}>GRUPO {group}</span>
                  </div>
                  <div className="space-y-2">
                    {gMatches.map(match => (
                      <MatchCard key={match.id} match={match} prediction={predictedMap[match.id]} onSelect={() => setSelectedMatch(match)} />
                    ))}
                  </div>
                </div>
              ))
            })()
          )}
        </>
      )}

      {/* Knockout Tab */}
      {tab === "knockout" && (
        <>
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {ELIM_STAGES.map(s => (
              <button key={s} onClick={() => setElimStage(s)} className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider whitespace-nowrap" style={{ backgroundColor: elimStage === s ? "rgba(241,10,60,0.15)" : "rgba(255,255,255,0.03)", color: elimStage === s ? "#f10a3c" : "rgba(255,255,255,0.2)", border: elimStage === s ? "1px solid rgba(241,10,60,0.2)" : "1px solid rgba(255,255,255,0.04)" }}>{(STAGE_LABELS[s] || s).toUpperCase()}</button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredKnockout.length === 0 ? (
              <p className="text-center text-white/15 py-12 text-sm">No hay partidos en esta fase</p>
            ) : filteredKnockout.map(match => (
              <MatchCard key={match.id} match={match} prediction={predictedMap[match.id]} onSelect={() => !isLocked(match.match_date) && match.home_team && match.away_team && setSelectedMatch(match)} />
            ))}
          </div>
        </>
      )}

      {/* Pronostico Modal */}
      {selectedMatch && (
        <PronosticoForm
          match={selectedMatch}
          existingPrediction={predictedMap[selectedMatch.id] || null}
          onClose={() => setSelectedMatch(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

function MatchCard({ match, prediction, onSelect }: { match: Match; prediction?: Prediction; onSelect: () => void }) {
  const locked = isLocked(match.match_date)
  const hasPrediction = !!prediction
  const hasTeams = match.home_team && match.away_team

  return (
    <button
      onClick={onSelect}
      disabled={locked || !hasTeams}
      className="w-full text-left rounded-xl p-3 transition-all duration-200"
      style={{
        backgroundColor: hasPrediction ? "rgba(42,193,5,0.04)" : "rgba(255,255,255,0.02)",
        border: hasPrediction ? "1px solid rgba(42,193,5,0.15)" : locked ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(255,255,255,0.05)",
        opacity: locked && !hasPrediction ? 0.4 : 1,
      }}
    >
      {/* Date + Status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/15 text-[9px] font-semibold">{formatDate(match.match_date)} · {formatTime(match.match_date)} UTC</span>
        {locked ? (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>BLOQUEADO</span>
        ) : hasPrediction ? (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(42,193,5,0.15)", color: "#2ac105" }}>LISTO</span>
        ) : (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,215,13,0.1)", color: "#ffd70d" }}>PENDIENTE</span>
        )}
      </div>

      {/* Teams */}
      {hasTeams ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{match.home_team!.flag_emoji}</span>
            <span className="text-white text-xs font-black">{match.home_team!.code}</span>
          </div>
          <div className="px-3 text-center">
            {hasPrediction ? (
              <span className="text-sm font-black" style={{ color: "#2ac105" }}>{prediction!.home_score} - {prediction!.away_score}</span>
            ) : (
              <span className="text-white/10 text-xs font-black">VS</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-white text-xs font-black">{match.away_team!.code}</span>
            <span className="text-2xl">{match.away_team!.flag_emoji}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <span className="text-white/10 text-xs font-black">POR DEFINIR</span>
        </div>
      )}

      {/* Scorer + Stadium */}
      <div className="flex items-center justify-between mt-2">
        {hasPrediction && prediction!.scorer_name && (
          <span className="text-white/20 text-[9px]">Goleador: {prediction!.scorer_name}</span>
        )}
        <span className="text-white/10 text-[8px] ml-auto">{match.stadium}</span>
      </div>
    </button>
  )
}

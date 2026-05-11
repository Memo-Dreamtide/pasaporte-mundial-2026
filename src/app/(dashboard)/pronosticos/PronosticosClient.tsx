"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"

type Team = { id: string; name: string; code: string; flag_emoji: string; group_letter: string }
type Match = {
  id: string; match_number: number; home_team: Team | null; away_team: Team | null
  home_score: number | null; away_score: number | null; stage: string
  group_letter: string | null; match_date: string; stadium: string; city: string; status: string
}
type Prediction = {
  id: string; match_id: string; home_score: number; away_score: number
  scorer_name: string | null; player_name?: string | null; points_earned: number | null
}

interface PronosticosClientProps {
  userName: string
  userEmail: string
  userInitial: string
  rankPosition: number
  totalPoints: number
  predictionsCount: number
  exactScores: number
  matches: Match[]
  predictions: Prediction[]
  totalMatches: number
  authProvider: string
}

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"]
const JORNADAS = ["1","2","3"]

const STAGE_LABELS: Record<string, string> = {
  round_of_32: "32avos",
  round_of_16: "Octavos",
  quarter: "Cuartos",
  semi: "Semis",
  third_place: "3er Lugar",
  final: "Final",
}

const ELIM_STAGES = ["round_of_32", "round_of_16", "quarter", "semi", "third_place", "final"]

const RULES = [
  { title: "Predice el marcador", desc: "Selecciona un partido y predice el marcador final antes de que inicie." },
  { title: "Goleador del partido", desc: "Selecciona quien crees que sera el goleador del partido para ganar +5 puntos bonus." },
  { title: "Jugador del partido", desc: "Elige quien crees que sera el mejor jugador del partido para ganar +3 puntos bonus." },
  { title: "Bloqueo automatico", desc: "Los pronósticos se bloquean 1 minuto antes del inicio del partido." },
  { title: "Edita cuando quieras", desc: "Puedes editar o borrar tu pronóstico en cualquier momento antes del bloqueo." },
  { title: "Marcador exacto", desc: "+10 puntos si aciertas el marcador exacto." },
  { title: "Resultado correcto", desc: "+4 puntos si aciertas el resultado (1X2)." },
  { title: "Diferencia de goles", desc: "+3 puntos si aciertas la diferencia de goles." },
  { title: "Multiplicadores", desc: "Grupos x1.0, 32avos x1.25, 8vos x1.5, 4tos x2.0, Semis x2.5, Final x3.0." },
]

function formatToSV(dateStr: string) {
  const date = new Date(dateStr)
  const svDate = new Date(date.getTime() - 6 * 60 * 60 * 1000)
  const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const day = days[svDate.getUTCDay()]
  const num = svDate.getUTCDate()
  const month = months[svDate.getUTCMonth()]
  let hours = svDate.getUTCHours()
  const minutes = svDate.getUTCMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "p.m." : "a.m."
  hours = hours % 12 || 12
  return `${day} ${num} ${month} - ${hours}:${minutes} ${ampm}`
}

function isLocked(matchDate: string) {
  const kickoff = new Date(matchDate)
  return new Date() >= new Date(kickoff.getTime() - 60000)
}

function getJornada(matchNumber: number): string {
  if (matchNumber <= 24) return "1"
  if (matchNumber <= 48) return "2"
  return "3"
}

export default function PronosticosClient({
  userName, userEmail, userInitial, rankPosition, totalPoints,
  predictionsCount, exactScores, matches, predictions, totalMatches, authProvider,
}: PronosticosClientProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState("")
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [tab, setTab] = useState<"groups" | "knockout">("groups")
  const [groupFilter, setGroupFilter] = useState("A")
  const [jornadaFilter, setJornadaFilter] = useState("1")
  const [elimStage, setElimStage] = useState("round_of_32")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [predictedMap, setPredictedMap] = useState<Record<string, Prediction>>(
    Object.fromEntries(predictions.map(p => [p.match_id, p]))
  )

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
    setPasswordMsg(error ? "Error al enviar el correo" : "Revisa tu correo para cambiar tu contrasena")
    setTimeout(() => setPasswordMsg(""), 5000)
  }

  const totalPredicted = Object.keys(predictedMap).length
  const progressPercent = totalMatches > 0 ? Math.round((totalPredicted / totalMatches) * 100) : 0

  const groupMatches = matches.filter(m => m.stage === "group")
  const knockoutMatches = matches.filter(m => m.stage !== "group")

  const filteredGroups = groupMatches.filter(m => {
    if (m.group_letter !== groupFilter) return false
    if (getJornada(m.match_number) !== jornadaFilter) return false
    return true
  })

  const filteredKnockout = knockoutMatches.filter(m => m.stage === elimStage)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

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

  const navItems = [
    { label: "INICIO", href: "/dashboard" },
    { label: "PRONÓSTICOS", href: "/pronosticos" },
    { label: "PARTIDOS", href: "/partidos" },
    { label: "RANKING", href: "/ranking" },
    { label: "PREMIOS", href: "/premios" },
  ]

  // SVG circle progress
  const circleRadius = 44
  const circumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="min-h-screen bg-bg-base px-4 lg:px-8 pt-6 pb-24 max-w-md lg:max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 lg:items-center lg:mb-10">
        <h1 className="text-4xl lg:text-5xl font-light text-white leading-tight">
          {userName.split(" ").map((word, i) => (
            <span key={i} className="lg:inline">{word}<br className="lg:hidden" />{" "}</span>
          ))}
        </h1>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center rounded-full border border-border-medium bg-bg-surface p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isHovered = hoveredNav === item.href
            const showHighlight = isActive || isHovered
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.href)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`text-center py-2.5 px-6 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 whitespace-nowrap ${
                  showHighlight ? "bg-red-atlantida text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => setShowProfile(true)}
          className="w-14 h-14 rounded-full bg-bg-elevated border border-border-medium flex items-center justify-center cursor-pointer hover:border-red-atlantida/30 transition-colors shrink-0 ml-4"
        >
          <div className="grid grid-cols-2 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-atlantida" />
            <div className="w-2 h-2 rounded-full bg-red-atlantida" />
            <div className="w-2 h-2 rounded-full bg-red-atlantida" />
            <div className="w-2 h-2 rounded-full bg-red-atlantida" />
          </div>
        </button>
      </div>

      {/* Mobile Nav */}
      <div className="flex items-center rounded-full border border-border-medium bg-bg-surface p-1 mb-6 lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isHovered = hoveredNav === item.href
          const showHighlight = isActive || isHovered
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredNav(item.href)}
              onMouseLeave={() => setHoveredNav(null)}
              className={`flex-1 text-center py-2 px-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 whitespace-nowrap ${
                showHighlight ? "bg-red-atlantida text-white" : "text-white/40"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Progress + How to Play — desktop: side by side with tabs */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:mb-8">
        {/* Progress + How to Play cards */}
        <div className="flex gap-2 mb-4 lg:col-span-2 lg:mb-0">
          {/* Progress Circle Card */}
          <div className="flex-1 bg-red-atlantida rounded-2xl p-5 flex items-center gap-4">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={circleRadius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r={circleRadius} fill="none"
                  stroke="white" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-white">{progressPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-black tracking-wider uppercase">Progreso</p>
              <p className="text-white/60 text-xs mt-0.5">{totalPredicted} / {totalMatches}</p>
            </div>
          </div>

          {/* How to Play Card */}
          <button
            onClick={() => setShowRules(true)}
            className="flex-1 bg-bg-elevated border border-border-medium rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-red-atlantida/30 transition-colors"
          >
            <p className="text-white text-sm font-black">¿Cómo jugar?</p>
            <p className="text-white/40 text-xs mt-1">Conoce las reglas.</p>
          </button>
        </div>

        {/* Grupos / Eliminatorias Tabs */}
        <div className="flex gap-2 mb-4 lg:col-span-1 lg:mb-0 lg:flex-col">
          <button
            onClick={() => setTab("groups")}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all cursor-pointer ${
              tab === "groups"
                ? "bg-red-atlantida text-white"
                : "bg-bg-elevated border border-border-medium text-white/40 hover:text-white/60 hover:border-red-atlantida/20"
            }`}
          >
            Grupos
          </button>
          <button
            onClick={() => setTab("knockout")}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all cursor-pointer ${
              tab === "knockout"
                ? "bg-red-atlantida text-white"
                : "bg-bg-elevated border border-border-medium text-white/40 hover:text-white/60 hover:border-red-atlantida/20"
            }`}
          >
            Eliminatorias
          </button>
        </div>
      </div>

      {/* Groups Tab Content */}
      {tab === "groups" && (
        <>
          {/* Group Letter Filter */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`w-9 h-9 rounded-full text-xs font-bold tracking-wider transition-all shrink-0 cursor-pointer ${
                  groupFilter === g
                    ? "bg-red-atlantida text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Fecha Filter */}
          <div className="flex items-center gap-3 mb-5 bg-bg-elevated rounded-full px-5 py-3 border border-border-subtle">
            <span className="text-white/50 text-[11px] font-black tracking-[0.2em] uppercase">Fecha</span>
            {JORNADAS.map(j => (
              <button
                key={j}
                onClick={() => setJornadaFilter(j)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  jornadaFilter === j
                    ? "bg-red-atlantida text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {j}
              </button>
            ))}
          </div>

          {/* Match Cards */}
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {filteredGroups.length === 0 ? (
              <p className="text-center text-white/30 py-12 text-sm lg:col-span-2">No hay partidos con este filtro</p>
            ) : (
              filteredGroups.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictedMap[match.id]}
                  onSelect={() => {
                    if (!isLocked(match.match_date) && match.home_team && match.away_team) {
                      setSelectedMatch(match)
                    }
                  }}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Knockout Tab Content */}
      {tab === "knockout" && (
        <>
          {/* Stage Filter */}
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {ELIM_STAGES.map(s => (
              <button
                key={s}
                onClick={() => setElimStage(s)}
                className={`px-4 py-2.5 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  elimStage === s
                    ? "bg-red-atlantida text-white"
                    : "bg-bg-elevated border border-border-medium text-white/30 hover:text-white/60"
                }`}
              >
                {(STAGE_LABELS[s] || s).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Knockout Match Cards */}
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {filteredKnockout.length === 0 ? (
              <p className="text-center text-white/30 py-12 text-sm lg:col-span-2">No hay partidos en esta fase</p>
            ) : (
              filteredKnockout.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictedMap[match.id]}
                  onSelect={() => {
                    if (!isLocked(match.match_date) && match.home_team && match.away_team) {
                      setSelectedMatch(match)
                    }
                  }}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Prediction Modal */}
      {selectedMatch && (
        <PredictionModal
          match={selectedMatch}
          existingPrediction={predictedMap[selectedMatch.id] || null}
          onClose={() => setSelectedMatch(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowRules(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-bg-elevated border border-border-subtle rounded-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-black text-white mb-6">¿Cómo jugar?</h2>

            <div className="space-y-4">
              {RULES.map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-red-atlantida/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-red-atlantida">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{rule.title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Points Summary */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/30 text-[10px] font-bold tracking-wider uppercase mb-3">Multiplicadores por fase</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Grupos", mult: "x1.0" },
                  { label: "32avos", mult: "x1.25" },
                  { label: "8vos", mult: "x1.5" },
                  { label: "4tos", mult: "x2.0" },
                  { label: "Semis", mult: "x2.5" },
                  { label: "Final", mult: "x3.0" },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 rounded-lg px-3 py-2 text-center">
                    <p className="text-white/30 text-[9px]">{m.label}</p>
                    <p className="text-red-atlantida text-xs font-black">{m.mult}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="relative z-10 w-full max-w-md bg-bg-elevated border border-border-subtle rounded-t-3xl md:rounded-3xl p-8 animate-slide-up">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="w-20 h-20 rounded-full bg-red-atlantida/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-black text-red-atlantida">{userInitial}</span>
            </div>
            <h2 className="text-xl font-black text-white text-center">{userName}</h2>
            <p className="text-white/40 text-sm text-center mt-1 mb-6">{userEmail}</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-red-atlantida">{totalPoints}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">PUNTOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">#{rankPosition || "-"}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">RANKING</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">{predictionsCount}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">JUGADOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">{exactScores}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">EXACTOS</p>
              </div>
            </div>
            {totalMatches - totalPredicted > 0 && (
              <p className="text-white/20 text-xs text-center mb-5">Te faltan {totalMatches - totalPredicted} pronosticos por hacer</p>
            )}
            {authProvider === "google" ? (
              <div className="flex items-center gap-2 bg-bg-surface rounded-xl px-4 py-3 mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/30 shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="text-white/30 text-xs">Tu cuenta esta vinculada con Google. La contrasena se administra desde tu cuenta de Google.</p>
              </div>
            ) : (
              <button onClick={handleResetPassword} className="w-full py-3 rounded-xl font-bold text-xs tracking-wider bg-bg-surface text-white/50 hover:text-white/70 transition-all duration-300 cursor-pointer mb-3">
                CAMBIAR CONTRASENA
              </button>
            )}
            {passwordMsg && <p className="text-red-atlantida text-xs text-center mb-3">{passwordMsg}</p>}
            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider bg-red-atlantida/10 text-red-atlantida border border-red-atlantida/20 hover:bg-red-atlantida/20 transition-all duration-300 cursor-pointer"
            >
              CERRAR SESION
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Match Card ─── */
function MatchCard({ match, prediction, onSelect }: {
  match: Match; prediction?: Prediction; onSelect: () => void
}) {
  const locked = isLocked(match.match_date)
  const hasPrediction = !!prediction
  const hasTeams = match.home_team && match.away_team

  return (
    <button
      onClick={onSelect}
      disabled={locked || !hasTeams}
      className={`w-full rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
        hasPrediction
          ? "bg-red-atlantida/15 border-red-atlantida/30 opacity-100"
          : locked
            ? "bg-bg-elevated border-border-subtle opacity-40"
            : "bg-bg-elevated border-border-medium opacity-50 hover:opacity-80 hover:border-red-atlantida/20"
      }`}
    >
      {/* Date */}
      <p className="text-center text-white/40 text-[11px] font-medium mb-3">
        {formatToSV(match.match_date)}
      </p>

      {/* Teams & Score */}
      {hasTeams ? (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-4xl lg:text-5xl font-black text-white tracking-wider">{match.home_team!.code}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-2xl">{match.home_team!.flag_emoji}</span>
              <span className="text-2xl font-black text-white">
                {hasPrediction ? String(prediction!.home_score).padStart(2, "0") : "--"}
              </span>
            </div>
          </div>

          <span className="text-white/20 text-sm font-bold px-3">vs</span>

          <div className="flex-1 text-center">
            <p className="text-4xl lg:text-5xl font-black text-white tracking-wider">{match.away_team!.code}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-2xl">{match.away_team!.flag_emoji}</span>
              <span className="text-2xl font-black text-white">
                {hasPrediction ? String(prediction!.away_score).padStart(2, "0") : "--"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <span className="text-white/20 text-sm font-black">POR DEFINIR</span>
        </div>
      )}

      {/* Prediction status indicator */}
      {hasPrediction && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-atlantida" />
          <span className="text-red-atlantida text-[9px] font-bold tracking-wider uppercase">Pronosticado</span>
        </div>
      )}
    </button>
  )
}

/* ─── Prediction Modal ─── */
function PredictionModal({ match, existingPrediction, onClose, onSaved, onDeleted }: {
  match: Match
  existingPrediction: Prediction | null
  onClose: () => void
  onSaved: (matchId: string, prediction: Prediction) => void
  onDeleted: (matchId: string) => void
}) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(existingPrediction?.away_score ?? 0)
  const [scorer, setScorer] = useState(existingPrediction?.scorer_name ?? "")
  const [player, setPlayer] = useState(existingPrediction?.player_name ?? "")
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

    const predictionData = {
      user_id: user.id,
      match_id: match.id,
      home_score: homeScore,
      away_score: awayScore,
      scorer_name: scorer.trim() || null,
      player_name: player.trim() || null,
      updated_at: new Date().toISOString(),
    }

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-bg-elevated rounded-[2.5rem] p-6 pt-8 animate-slide-up">
        {/* Title */}
        <h2 className="text-xl font-black text-white text-center mb-8">Pronóstico</h2>

        {/* Teams & Score Selectors */}
        <div className="flex items-start justify-center gap-8 mb-8">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-4xl">{match.home_team?.flag_emoji}</span>
            </div>
            <p className="text-white font-black text-lg tracking-wider">{match.home_team?.code}</p>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => setHomeScore(Math.max(homeScore - 1, 0))}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                -
              </button>
              <span className="text-4xl font-black text-white w-14 text-center">
                {String(homeScore).padStart(2, "0")}
              </span>
              <button
                onClick={() => setHomeScore(Math.min(homeScore + 1, 20))}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-4xl">{match.away_team?.flag_emoji}</span>
            </div>
            <p className="text-white font-black text-lg tracking-wider">{match.away_team?.code}</p>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => setAwayScore(Math.max(awayScore - 1, 0))}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                -
              </button>
              <span className="text-4xl font-black text-white w-14 text-center">
                {String(awayScore).padStart(2, "0")}
              </span>
              <button
                onClick={() => setAwayScore(Math.min(awayScore + 1, 20))}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Player of the Match Input */}
        <input
          type="text"
          placeholder="Jugador del partido (+3 pts)"
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          className="w-full rounded-xl px-5 py-4 text-white text-sm placeholder-white/30 focus:outline-none transition-colors mb-3 bg-white/5 border border-white/10 focus:border-red-atlantida/40"
        />

        {/* Scorer Input */}
        <input
          type="text"
          placeholder="Goleador del partido (+5 pts)"
          value={scorer}
          onChange={(e) => setScorer(e.target.value)}
          className="w-full rounded-xl px-5 py-4 text-white text-sm placeholder-white/30 focus:outline-none transition-colors mb-6 bg-white/5 border border-white/10 focus:border-red-atlantida/40"
        />

        {error && (
          <p className="text-sm text-center py-2 rounded-lg mb-4 text-red-atlantida bg-red-atlantida/10">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full font-black text-sm tracking-wider text-white/50 bg-white/10 transition-colors hover:bg-white/15 cursor-pointer"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3.5 rounded-full font-black text-sm tracking-wider bg-red-atlantida text-white transition-all duration-300 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "GUARDANDO..." : "GUARDAR"}
          </button>
        </div>

        {/* Delete */}
        {existingPrediction && (
          <div className="mt-2">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-full text-[11px] font-bold text-white/30 bg-white/5 cursor-pointer">
                  NO, MANTENER
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-full text-[11px] font-bold text-red-atlantida bg-red-atlantida/10 disabled:opacity-50 cursor-pointer">
                  {deleting ? "BORRANDO..." : "SI, BORRAR"}
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="w-full py-3 text-center text-red-atlantida/60 text-xs font-bold tracking-wider underline underline-offset-2 cursor-pointer">
                Borrar pronóstico
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

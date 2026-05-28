"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import FadeIn from "@/components/ui/FadeIn"
import TutorialOverlay, { TutorialCelebration } from "@/components/ui/TutorialOverlay"
import InstallAppModal from "@/components/ui/InstallAppModal"
import { motion, useInView } from "motion/react"
import { calculatePoints, STAGE_MULTIPLIERS } from "@/utils/points"
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"

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
  { title: "Bloqueo automático", desc: "Los pronósticos se bloquean 1 minuto antes del inicio del partido." },
  { title: "Edita cuando quieras", desc: "Puedes editar o borrar tu pronóstico en cualquier momento antes del bloqueo." },
  { title: "Marcador exacto", desc: "+10 puntos si aciertas el marcador exacto del partido." },
  { title: "Ganador correcto", desc: "+4 puntos si aciertas quién gana o si es empate, sin importar el marcador." },
  { title: "Diferencia de goles", desc: "+3 puntos si aciertas la diferencia de goles entre ambos equipos." },
  { title: "Racha de exactos", desc: "Acierta marcadores exactos consecutivos y multiplica tus puntos: x2, x3, hasta x4." },
  { title: "Multiplicadores por fase", desc: "Grupos x1.0, 32avos x1.25, 8vos x1.5, 4tos x2.0, Semis x2.5, Final x3.0." },
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
  predictionsCount, exactScores, matches: initialMatches, predictions, totalMatches, authProvider,
}: PronosticosClientProps) {
  const [matches, setMatches] = useState(initialMatches)
  const [showProfile, setShowProfile] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
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

  const [tutorialStep, setTutorialStep] = useState<number | null>(null)

  const cardsRef = useRef(null)
  const cardsInView = useInView(cardsRef, { once: true, margin: "-50px" })
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Realtime: update match scores in predictions view
  useRealtimeMatches((updatedMatch) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === updatedMatch.id
          ? { ...m, home_score: updatedMatch.home_score, away_score: updatedMatch.away_score, status: updatedMatch.status }
          : m
      )
    )
  })

  // Auto-start tutorial (flag cleared inside setTimeout to survive React Strict Mode double-run)
  useEffect(() => {
    const completed = localStorage.getItem("tutorial_completed")
    const pending = localStorage.getItem("tutorial_active")
    if (pending === "pronosticos" || (!completed && predictions.length === 0)) {
      const timer = setTimeout(() => {
        localStorage.removeItem("tutorial_active")
        setTutorialStep(1)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [predictions.length])

  const handleTutorialNext = () => {
    setTutorialStep(prev => (prev !== null ? prev + 1 : null))
  }

  const handleTutorialSkip = () => {
    setTutorialStep(null)
    localStorage.setItem("tutorial_completed", "true")
    localStorage.removeItem("tutorial_active")
  }

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
    setPasswordMsg(error ? "Error al enviar el correo" : "Revisa tu correo para cambiar tu contraseña")
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
    // If tutorial is active, show celebration
    if (tutorialStep === 3) {
      setTimeout(() => setTutorialStep(4), 300)
    }
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
    <div
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-pronosticos.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-bg-base/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-base/50 to-bg-base" />
      <div className="relative z-10 px-4 lg:px-8 pt-6 pb-24 max-w-md lg:max-w-6xl mx-auto">
      {/* Header */}
      <FadeIn delay={0.1}>
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
                  showHighlight ? "bg-red-atlantida text-white" : "text-white/60 hover:text-white/80"
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
      </FadeIn>

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
                showHighlight ? "bg-red-atlantida text-white" : "text-white/60"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Progress + How to Play — desktop: side by side with tabs */}
      <div ref={cardsRef} className="lg:grid lg:grid-cols-3 lg:gap-6 lg:mb-8">
        {/* Progress + How to Play cards */}
        <div className="flex gap-2 mb-4 lg:col-span-2 lg:mb-0">
          {/* Progress Circle Card — slides in first from left */}
          <motion.div
            className="flex-1 bg-red-atlantida rounded-2xl p-5 flex items-center gap-4"
            initial={{ x: -60, opacity: 0, filter: "blur(4px)" }}
            animate={cardsInView ? { x: 0, opacity: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          >
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
          </motion.div>

          {/* How to Play Card — slides in second */}
          <motion.button
            onClick={() => setShowRules(true)}
            className="flex-1 bg-bg-elevated border border-border-medium rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-red-atlantida/30 transition-colors"
            initial={{ x: -60, opacity: 0, filter: "blur(4px)" }}
            animate={cardsInView ? { x: 0, opacity: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="text-white text-sm font-black">¿Cómo jugar?</p>
            <p className="text-white/60 text-xs mt-1">Conoce las reglas.</p>
          </motion.button>
        </div>

        {/* Grupos / Eliminatorias Tabs */}
        <div className="flex gap-2 mb-4 lg:col-span-1 lg:mb-0 lg:flex-col">
          {/* Grupos — slides in third */}
          <motion.button
            onClick={() => setTab("groups")}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all cursor-pointer ${
              tab === "groups"
                ? "bg-red-atlantida text-white"
                : "bg-bg-elevated border border-border-medium text-white/60 hover:text-white/80 hover:border-red-atlantida/20"
            }`}
            initial={{ x: -60, opacity: 0, filter: "blur(4px)" }}
            animate={cardsInView ? { x: 0, opacity: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          >
            Grupos
          </motion.button>
          {/* Eliminatorias — slides in fourth */}
          <motion.button
            onClick={() => setTab("knockout")}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-black tracking-wider transition-all cursor-pointer ${
              tab === "knockout"
                ? "bg-red-atlantida text-white"
                : "bg-bg-elevated border border-border-medium text-white/60 hover:text-white/80 hover:border-red-atlantida/20"
            }`}
            initial={{ x: -60, opacity: 0, filter: "blur(4px)" }}
            animate={cardsInView ? { x: 0, opacity: 1, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.25, 0.4, 0.25, 1] }}
          >
            Eliminatorias
          </motion.button>
        </div>
      </div>

      {/* Groups Tab Content */}
      <FadeIn delay={0.3}>
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
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Fecha Filter */}
          <div className="flex items-center gap-3 mb-5 bg-bg-elevated rounded-full px-5 py-3 border border-border-subtle">
            <span className="text-white/70 text-[11px] font-black tracking-[0.2em] uppercase">Fecha</span>
            {JORNADAS.map(j => (
              <button
                key={j}
                onClick={() => setJornadaFilter(j)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  jornadaFilter === j
                    ? "bg-red-atlantida text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {j}
              </button>
            ))}
          </div>

          {/* Match Cards */}
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {filteredGroups.length === 0 ? (
              <p className="text-center text-white/50 py-12 text-sm lg:col-span-2">No hay partidos con este filtro</p>
            ) : (
              filteredGroups.map((match, idx) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictedMap[match.id]}
                  isFirstAvailable={idx === 0 && tutorialStep === 1}
                  onSelect={() => {
                    if (!isLocked(match.match_date) && match.home_team && match.away_team) {
                      setSelectedMatch(match)
                      if (tutorialStep === 1) {
                        setTimeout(() => setTutorialStep(2), 400)
                      }
                    }
                  }}
                />
              ))
            )}
          </div>
        </>
      )}

      </FadeIn>

      {/* Knockout Tab Content */}
      <FadeIn delay={0.3}>
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
                    : "bg-bg-elevated border border-border-medium text-white/50 hover:text-white/80"
                }`}
              >
                {(STAGE_LABELS[s] || s).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Knockout Match Cards */}
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {filteredKnockout.length === 0 ? (
              <p className="text-center text-white/50 py-12 text-sm lg:col-span-2">No hay partidos en esta fase</p>
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

      </FadeIn>

      {/* Tutorial Step 1: Spotlight first match card */}
      {tutorialStep === 1 && (
        <TutorialOverlay
          targetSelector="[data-tutorial='match-card']"
          title="Selecciona un partido"
          description="Toca cualquier partido disponible para ingresar tu pronóstico."
          position="bottom"
          onSkip={handleTutorialSkip}
          currentStep={0}
          totalSteps={3}
        />
      )}

      {/* Tutorial Step 2: Spotlight score selectors */}
      {tutorialStep === 2 && selectedMatch && (
        <TutorialOverlay
          targetSelector="[data-tutorial='score-area']"
          title="Ingresa tu pronóstico"
          description="Usa los botones + y - para elegir el marcador que pronosticas para cada equipo."
          position="bottom"
          actionText="SIGUIENTE"
          onAction={() => setTutorialStep(3)}
          onSkip={handleTutorialSkip}
          currentStep={1}
          totalSteps={3}
        />
      )}

      {/* Tutorial Step 3: Spotlight GUARDAR button */}
      {tutorialStep === 3 && selectedMatch && (
        <TutorialOverlay
          targetSelector="[data-tutorial='guardar-btn']"
          title="Guarda tu pronóstico"
          description="Presiona GUARDAR para registrar tu pronóstico."
          position="top"
          onSkip={handleTutorialSkip}
          currentStep={2}
          totalSteps={3}
        />
      )}

      {/* Tutorial Step 4: Celebration */}
      {tutorialStep === 4 && (
        <TutorialCelebration onClose={handleTutorialSkip} />
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
              className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
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
                    <p className="text-white/60 text-xs mt-0.5">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Points Summary */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/60 text-[10px] font-bold tracking-wider uppercase mb-3">Puntos por partido</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: "Exacto", pts: "+10" },
                  { label: "Ganador", pts: "+4" },
                  { label: "Diferencia", pts: "+3" },
                  { label: "Falla", pts: "0" },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 rounded-lg px-3 py-2 text-center">
                    <p className="text-white/60 text-[9px]">{m.label}</p>
                    <p className="text-red-atlantida text-xs font-black">{m.pts}</p>
                  </div>
                ))}
              </div>

              <p className="text-white/60 text-[10px] font-bold tracking-wider uppercase mb-3">Racha de exactos</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: "1 exacto", mult: "x1" },
                  { label: "2 seguidos", mult: "x2" },
                  { label: "3 seguidos", mult: "x3" },
                  { label: "4+ seguidos", mult: "x4" },
                ].map(m => (
                  <div key={m.label} className="bg-white/5 rounded-lg px-3 py-2 text-center">
                    <p className="text-white/60 text-[9px]">{m.label}</p>
                    <p className="text-red-atlantida text-xs font-black">{m.mult}</p>
                  </div>
                ))}
              </div>

              <p className="text-white/60 text-[10px] font-bold tracking-wider uppercase mb-3">Multiplicadores por fase</p>
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
                    <p className="text-white/60 text-[9px]">{m.label}</p>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="relative z-10 w-full max-w-md bg-bg-elevated border border-border-subtle rounded-3xl p-8 animate-slide-up">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="w-20 h-20 rounded-full bg-red-atlantida/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-black text-red-atlantida">{userInitial}</span>
            </div>
            <h2 className="text-xl font-black text-white text-center">{userName}</h2>
            <p className="text-white/60 text-sm text-center mt-1 mb-6">{userEmail}</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-red-atlantida">{totalPoints}</p>
                <p className="text-white/60 text-[10px] font-bold mt-1">PUNTOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">#{rankPosition || "-"}</p>
                <p className="text-white/60 text-[10px] font-bold mt-1">RANKING</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">{predictionsCount}</p>
                <p className="text-white/60 text-[10px] font-bold mt-1">JUGADOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">{exactScores}</p>
                <p className="text-white/60 text-[10px] font-bold mt-1">EXACTOS</p>
              </div>
            </div>
            {totalMatches - totalPredicted > 0 && (
              <p className="text-white/50 text-xs text-center mb-5">Te faltan {totalMatches - totalPredicted} pronósticos por hacer</p>
            )}
            {authProvider === "google" ? (
              <div className="flex items-center gap-2 bg-bg-surface rounded-xl px-4 py-3 mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/50 shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="text-white/50 text-xs">Tu cuenta esta vinculada con Google. La contraseña se administra desde tu cuenta de Google.</p>
              </div>
            ) : (
              <button onClick={handleResetPassword} className="w-full py-3 rounded-xl font-bold text-xs tracking-wider bg-bg-surface text-white/60 hover:text-white/80 transition-all duration-300 cursor-pointer mb-3">
                CAMBIAR CONTRASEÑA
              </button>
            )}
            {passwordMsg && <p className="text-red-atlantida text-xs text-center mb-3">{passwordMsg}</p>}
            <button
              onClick={() => { setShowProfile(false); setShowInstall(true) }}
              className="w-full py-3 rounded-xl font-bold text-xs tracking-wider bg-bg-surface text-white/50 hover:text-white/70 transition-all duration-300 cursor-pointer mb-3 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                <path d="M12 18v-6M12 12l-3 3m3-3l3 3" />
                <rect x="4" y="2" width="16" height="20" rx="3" />
              </svg>
              INSTALAR EN TU CELULAR
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider bg-red-atlantida/10 text-red-atlantida border border-red-atlantida/20 hover:bg-red-atlantida/20 transition-all duration-300 cursor-pointer"
            >
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      )}

      {showInstall && <InstallAppModal onClose={() => setShowInstall(false)} />}
      </div>
    </div>
  )
}

/* ─── Match Card ─── */
function MatchCard({ match, prediction, onSelect, streakCount = 0, isFirstAvailable = false }: {
  match: Match; prediction?: Prediction; onSelect: () => void; streakCount?: number; isFirstAvailable?: boolean
}) {
  const locked = isLocked(match.match_date)
  const hasPrediction = !!prediction
  const hasTeams = match.home_team && match.away_team
  const isFinished = match.status === "finished"
  const hasRealScore = isFinished && match.home_score !== null && match.away_score !== null

  // Calculate point breakdown if match is finished and user predicted
  const points = hasPrediction && hasRealScore
    ? calculatePoints(
        prediction!.home_score, prediction!.away_score,
        match.home_score!, match.away_score!,
        match.stage, streakCount
      )
    : null

  return (
    <div
      onClick={() => {
        if (!locked && hasTeams && !isFinished) onSelect()
      }}
      {...(isFirstAvailable ? { "data-tutorial": "match-card" } : {})}
      className={`w-full rounded-2xl p-4 transition-all duration-200 border ${
        isFinished && hasPrediction
          ? "bg-bg-elevated border-border-subtle opacity-100"
          : hasPrediction
            ? "bg-red-atlantida/15 border-red-atlantida/30 opacity-100 cursor-pointer"
            : locked || isFinished
              ? "bg-bg-elevated border-border-subtle opacity-40"
              : "bg-bg-elevated border-border-medium opacity-50 hover:opacity-80 hover:border-red-atlantida/20 cursor-pointer"
      }`}
    >
      {/* Date */}
      <p className="text-center text-white/60 text-sm font-medium mb-3">
        {formatToSV(match.match_date)}
      </p>

      {/* Teams & Prediction Score */}
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

          <span className="text-white/40 text-sm font-bold px-3">vs</span>

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
          <span className="text-white/40 text-sm font-black">POR DEFINIR</span>
        </div>
      )}

      {/* Result + Points breakdown when match is finished */}
      {hasRealScore && hasPrediction ? (
        <div className="mt-3 pt-3 border-t border-white/10">
          {/* Real score */}
          <p className="text-center text-white/60 text-[10px] font-bold tracking-wider uppercase mb-2">Resultado Real</p>
          <p className="text-center text-white text-sm font-black mb-3">
            {match.home_team!.code} {match.home_score} - {match.away_score} {match.away_team!.code}
          </p>

          {/* Points breakdown */}
          {points && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Marcador Exacto</span>
                <span className={points.exact > 0 ? "text-[#4ade4f] font-bold" : "text-white/70"}>{points.exact} pts</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Ganador Correcto</span>
                <span className={points.winner > 0 ? "text-[#4ade4f] font-bold" : "text-white/70"}>{points.winner} pts</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Diferencia de goles</span>
                <span className={points.difference > 0 ? "text-[#4ade4f] font-bold" : "text-white/70"}>{points.difference} pts</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Racha</span>
                <span className="text-white/70">x{points.streak}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/70">Fase</span>
                <span className="text-white/70">x{points.phase}</span>
              </div>
              <div className="flex justify-between text-[18px] pt-2 mt-2 border-t border-white/10">
                <span className="text-white font-extrabold uppercase">Total</span>
                <span className="text-white font-extrabold uppercase">{points.total} PTS</span>
              </div>
            </div>
          )}
        </div>
      ) : hasPrediction ? (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-atlantida" />
          <span className="text-red-atlantida text-[9px] font-bold tracking-wider uppercase">Pronosticado</span>
        </div>
      ) : null}
    </div>
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
      scorer_name: null,
      player_name: null,
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
        <div data-tutorial="score-area" className="flex items-start justify-center gap-8 mb-8">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-4xl">{match.home_team?.flag_emoji}</span>
            </div>
            <p className="text-white font-black text-lg tracking-wider">{match.home_team?.code}</p>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => setHomeScore(Math.max(homeScore - 1, 0))}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                -
              </button>
              <span className="text-4xl font-black text-white w-14 text-center">
                {String(homeScore).padStart(2, "0")}
              </span>
              <button
                onClick={() => setHomeScore(Math.min(homeScore + 1, 20))}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
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
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                -
              </button>
              <span className="text-4xl font-black text-white w-14 text-center">
                {String(awayScore).padStart(2, "0")}
              </span>
              <button
                onClick={() => setAwayScore(Math.min(awayScore + 1, 20))}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-center py-2 rounded-lg mb-4 text-red-atlantida bg-red-atlantida/10">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full font-black text-sm tracking-wider text-white/70 bg-white/10 transition-colors hover:bg-white/15 cursor-pointer"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            data-tutorial="guardar-btn"
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
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-full text-[11px] font-bold text-white/50 bg-white/5 cursor-pointer">
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

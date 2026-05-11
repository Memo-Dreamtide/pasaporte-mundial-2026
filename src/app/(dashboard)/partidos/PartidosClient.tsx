"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"

type Team = { id: string; name: string; code: string; flag_emoji: string; group_letter: string }
type Match = {
  id: string; match_number: number; home_team: Team | null; away_team: Team | null
  home_score: number | null; away_score: number | null; stage: string
  group_letter: string | null; match_date: string; stadium: string; city: string
  status: string; current_minute?: number | null
}
type Scorer = {
  id: string; match_id: string; player_name: string; team_id: string; minute: number
}

interface PartidosClientProps {
  userName: string
  userEmail: string
  userInitial: string
  rankPosition: number
  totalPoints: number
  predictionsCount: number
  exactScores: number
  matches: Match[]
  featuredMatches: Match[]
  scorers: Scorer[]
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

const brands = [
  { name: "Banco Atlantida", subtitle: "Banca personal y empresarial" },
  { name: "Seguros Atlantida", subtitle: "Proteccion y respaldo" },
  { name: "Atlantida Capital", subtitle: "Inversiones y finanzas" },
  { name: "Atlantida Vida", subtitle: "Seguros de vida" },
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

function formatToSVLong(dateStr: string) {
  const date = new Date(dateStr)
  const svDate = new Date(date.getTime() - 6 * 60 * 60 * 1000)
  const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const day = days[svDate.getUTCDay()]
  const num = svDate.getUTCDate()
  const month = months[svDate.getUTCMonth()]
  let hours = svDate.getUTCHours()
  const minutes = svDate.getUTCMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "p.m." : "a.m."
  hours = hours % 12 || 12
  return `${day} ${num} ${month} - ${hours}:${minutes} ${ampm}`
}

function getJornada(matchNumber: number): string {
  if (matchNumber <= 24) return "1"
  if (matchNumber <= 48) return "2"
  return "3"
}

export default function PartidosClient({
  userName, userEmail, userInitial, rankPosition, totalPoints,
  predictionsCount, exactScores, matches, featuredMatches, scorers, authProvider,
}: PartidosClientProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [brandIndex, setBrandIndex] = useState(0)
  const [tab, setTab] = useState<"groups" | "knockout">("groups")
  const [groupFilter, setGroupFilter] = useState("A")
  const [jornadaFilter, setJornadaFilter] = useState("1")
  const [elimStage, setElimStage] = useState("round_of_32")
  const [passwordMsg, setPasswordMsg] = useState("")

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
    setPasswordMsg(error ? "Error al enviar el correo" : "Revisa tu correo para cambiar tu contrasena")
    setTimeout(() => setPasswordMsg(""), 5000)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setBrandIndex((prev) => (prev + 1) % brands.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const groupMatches = matches.filter(m => m.stage === "group")
  const knockoutMatches = matches.filter(m => m.stage !== "group")

  const filteredGroups = groupMatches.filter(m => {
    if (m.group_letter !== groupFilter) return false
    if (getJornada(m.match_number) !== jornadaFilter) return false
    return true
  })

  const filteredKnockout = knockoutMatches.filter(m => m.stage === elimStage)

  // Group scorers by match
  const scorersByMatch: Record<string, Scorer[]> = {}
  scorers.forEach(s => {
    if (!scorersByMatch[s.match_id]) scorersByMatch[s.match_id] = []
    scorersByMatch[s.match_id].push(s)
  })

  const navItems = [
    { label: "INICIO", href: "/dashboard" },
    { label: "PRONÓSTICOS", href: "/pronosticos" },
    { label: "PARTIDOS", href: "/partidos" },
    { label: "RANKING", href: "/ranking" },
    { label: "PREMIOS", href: "/premios" },
  ]

  const isLive = featuredMatches.some(m => m.status === "in_progress")

  return (
    <div className="min-h-screen bg-bg-base relative">
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15" style={{ backgroundImage: "url('https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-partidos.jpg')" }} />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-bg-base/50 to-bg-base" />
      <div className="relative z-10 px-4 lg:px-8 pt-6 pb-24 max-w-md lg:max-w-6xl mx-auto">
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

      {/* Video Banner with Brand Carousel */}
      <div className="relative overflow-hidden rounded-2xl mb-6 h-[180px] lg:h-[240px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex items-center justify-center h-full px-6 gap-4">
          <Image
            src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/logo-atlantida-icon.png"
            alt="Atlantida"
            width={44}
            height={44}
          />
          <div className="overflow-hidden">
            <div key={brandIndex} className="animate-fade-in">
              <p className="text-white text-xl font-black">{brands[brandIndex].name}</p>
              <p className="text-white/50 text-xs mt-1">{brands[brandIndex].subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Matches (Live or Next) */}
      {featuredMatches.length > 0 && (
        <div className="space-y-4 mb-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {featuredMatches.map(match => (
            <FeaturedMatchCard
              key={match.id}
              match={match}
              scorers={scorersByMatch[match.id] || []}
              isLive={match.status === "in_progress"}
            />
          ))}
        </div>
      )}

      {/* Grupos / Eliminatorias Tabs */}
      <div className="flex gap-2 mb-4">
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

      {/* Groups Tab */}
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
                <MatchResultCard key={match.id} match={match} />
              ))
            )}
          </div>
        </>
      )}

      {/* Knockout Tab */}
      {tab === "knockout" && (
        <>
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

          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {filteredKnockout.length === 0 ? (
              <p className="text-center text-white/30 py-12 text-sm lg:col-span-2">No hay partidos en esta fase</p>
            ) : (
              filteredKnockout.map(match => (
                <MatchResultCard key={match.id} match={match} />
              ))
            )}
          </div>
        </>
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
    </div>
  )
}

/* ─── Featured Match Card (Live or Next) ─── */
function FeaturedMatchCard({ match, scorers, isLive }: {
  match: Match; scorers: Scorer[]; isLive: boolean
}) {
  const hasTeams = match.home_team && match.away_team
  if (!hasTeams) return null

  const homeScorers = scorers.filter(s => s.team_id === match.home_team!.id)
  const awayScorers = scorers.filter(s => s.team_id === match.away_team!.id)

  return (
    <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-5 lg:p-6">
      {/* Status Header */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-white text-xs font-black tracking-wider uppercase">Partido</span>
        {isLive ? (
          <span className="text-red-atlantida text-xs font-black tracking-wider uppercase animate-pulse">EN VIVO</span>
        ) : (
          <span className="text-white/30 text-xs font-black tracking-wider uppercase">
            {match.status === "finished" ? "Finalizado" : "Próximo"}
          </span>
        )}
      </div>

      {/* Date */}
      <p className="text-center text-red-atlantida/60 text-[11px] font-medium mb-4">
        {formatToSVLong(match.match_date)}
      </p>

      {/* Teams & Score */}
      <div className="flex items-start justify-between">
        {/* Home */}
        <div className="flex-1 text-center">
          <p className="text-4xl font-black text-white tracking-wider">{match.home_team!.code}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-2xl">{match.home_team!.flag_emoji}</span>
            <span className="text-2xl font-black text-white">
              {isLive || match.status === "finished"
                ? String(match.home_score ?? 0).padStart(2, "0")
                : "--"}
            </span>
          </div>
          {/* Home Scorers */}
          {homeScorers.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {homeScorers.map(s => (
                <p key={s.id} className="text-red-atlantida text-[10px] font-medium">
                  {s.minute}&apos; {s.player_name}
                </p>
              ))}
            </div>
          )}
        </div>

        <span className="text-white/20 text-sm font-bold px-4 mt-4">vs</span>

        {/* Away */}
        <div className="flex-1 text-center">
          <p className="text-4xl font-black text-white tracking-wider">{match.away_team!.code}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-2xl">{match.away_team!.flag_emoji}</span>
            <span className="text-2xl font-black text-white">
              {isLive || match.status === "finished"
                ? String(match.away_score ?? 0).padStart(2, "0")
                : "--"}
            </span>
          </div>
          {/* Away Scorers */}
          {awayScorers.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {awayScorers.map(s => (
                <p key={s.id} className="text-red-atlantida text-[10px] font-medium">
                  {s.minute}&apos; {s.player_name}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Minute Badge */}
      {isLive && match.current_minute && (
        <div className="flex justify-center mt-4">
          <span className="bg-red-atlantida/15 border border-red-atlantida/30 text-red-atlantida text-xs font-bold px-4 py-1.5 rounded-full">
            Minuto {match.current_minute}
          </span>
        </div>
      )}

      {/* Stadium */}
      {!isLive && match.status !== "finished" && (
        <p className="text-center text-white/20 text-[10px] mt-3">{match.stadium}, {match.city}</p>
      )}
    </div>
  )
}

/* ─── Match Result Card ─── */
function MatchResultCard({ match }: { match: Match }) {
  const hasTeams = match.home_team && match.away_team
  const isFinished = match.status === "finished"
  const isLive = match.status === "in_progress"

  return (
    <div className={`rounded-2xl p-4 border transition-all ${
      isLive
        ? "bg-red-atlantida/10 border-red-atlantida/30"
        : isFinished
          ? "bg-bg-elevated border-border-subtle"
          : "bg-bg-elevated border-border-medium opacity-60"
    }`}>
      {/* Date */}
      <p className="text-center text-white/40 text-[11px] font-medium mb-3">
        {formatToSV(match.match_date)}
      </p>

      {/* Teams & Score */}
      {hasTeams ? (
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-3xl lg:text-4xl font-black text-white tracking-wider">{match.home_team!.code}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xl">{match.home_team!.flag_emoji}</span>
              <span className="text-xl font-black text-white">
                {isFinished || isLive ? String(match.home_score ?? 0).padStart(2, "0") : "--"}
              </span>
            </div>
          </div>

          <span className="text-white/20 text-sm font-bold px-3">vs</span>

          <div className="flex-1 text-center">
            <p className="text-3xl lg:text-4xl font-black text-white tracking-wider">{match.away_team!.code}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xl">{match.away_team!.flag_emoji}</span>
              <span className="text-xl font-black text-white">
                {isFinished || isLive ? String(match.away_score ?? 0).padStart(2, "0") : "--"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <span className="text-white/20 text-sm font-black">POR DEFINIR</span>
        </div>
      )}

      {/* Stadium info */}
      <p className="text-center text-white/15 text-[9px] mt-3">{match.stadium}, {match.city}</p>
    </div>
  )
}

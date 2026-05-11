"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"

type RankProfile = {
  id: string
  full_name: string | null
  total_points: number
  exact_scores: number
  predictions_count: number
  rank_position: number | null
}

interface RankingClientProps {
  userName: string
  userEmail: string
  userInitial: string
  rankPosition: number
  totalPoints: number
  currentUserId: string
  profiles: RankProfile[]
}

export default function RankingClient({
  userName, userEmail, userInitial, rankPosition, totalPoints,
  currentUserId, profiles,
}: RankingClientProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    { label: "INICIO", href: "/dashboard" },
    { label: "PRONÓSTICOS", href: "/pronosticos" },
    { label: "PARTIDOS", href: "/partidos" },
    { label: "RANKING", href: "/ranking" },
    { label: "PREMIOS", href: "/premios" },
  ]

  // Top 3 for podium
  const top3 = profiles.slice(0, 3)
  const rest = profiles.slice(3)

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3

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

      {/* Title */}
      <h2 className="text-2xl lg:text-3xl font-black text-white text-center tracking-wider uppercase mb-8">
        Ranking Actual
      </h2>

      {/* Podium — Desktop: wider layout */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-10 lg:gap-4 lg:mb-12">
          {/* 2nd Place — top-right corner only */}
          <div className="flex-1 max-w-[140px] lg:max-w-[200px]">
            <div className="bg-white p-4 lg:p-5 text-center min-h-[140px] lg:min-h-[170px] flex flex-col justify-end" style={{ borderRadius: "0 2rem 0 0" }}>
              <p className="text-6xl lg:text-7xl font-black text-gray-900 leading-none">2</p>
              {top3[1].full_name && (
                <p className="text-gray-600 text-[10px] lg:text-xs font-bold mt-2 truncate">{top3[1].full_name}</p>
              )}
              <p className="text-gray-900 text-xs lg:text-sm font-black mt-1">{top3[1].total_points} Pts.</p>
            </div>
          </div>

          {/* 1st Place — top-left corner only */}
          <div className="flex-1 max-w-[160px] lg:max-w-[220px]">
            <div className="bg-red-atlantida p-4 lg:p-5 text-center min-h-[180px] lg:min-h-[220px] flex flex-col justify-end" style={{ borderRadius: "2rem 0 0 0" }}>
              <p className="text-7xl lg:text-8xl font-black text-white/90 leading-none">1</p>
              <p className="text-white text-[10px] lg:text-xs font-bold mt-2 truncate">{top3[0].full_name || "---"}</p>
              <p className="text-white text-sm lg:text-base font-black mt-1">{top3[0].total_points} Pts.</p>
            </div>
          </div>

          {/* 3rd Place — top-left corner only, gray bg */}
          <div className="flex-1 max-w-[140px] lg:max-w-[200px]">
            <div className="bg-[#C8C8C8] p-4 lg:p-5 text-center min-h-[120px] lg:min-h-[150px] flex flex-col justify-end" style={{ borderRadius: "2rem 0 0 0" }}>
              <p className="text-5xl lg:text-6xl font-black text-gray-900 leading-none">3</p>
              {top3[2].full_name && (
                <p className="text-gray-600 text-[10px] lg:text-xs font-bold mt-2 truncate">{top3[2].full_name}</p>
              )}
              <p className="text-gray-900 text-xs lg:text-sm font-black mt-1">{top3[2].total_points} Pts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="flex items-center rounded-xl overflow-hidden mb-1">
        <div className="w-16 lg:w-20 bg-red-atlantida py-2.5 text-center">
          <span className="text-white text-[11px] lg:text-xs font-black tracking-wider">Pos.</span>
        </div>
        <div className="flex-1 bg-red-atlantida py-2.5 px-4">
          <span className="text-white text-[11px] lg:text-xs font-black tracking-wider">Jugador</span>
        </div>
        <div className="w-24 lg:w-28 bg-red-atlantida py-2.5 text-center">
          <span className="text-white text-[11px] lg:text-xs font-black tracking-wider">Puntaje</span>
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-0.5">
        {rest.length === 0 && top3.length === 0 ? (
          <p className="text-center text-white/30 py-12 text-sm">No hay jugadores en el ranking aun</p>
        ) : (
          rest.map((p, i) => {
            const position = i + 4
            const isCurrentUser = p.id === currentUserId
            return (
              <div
                key={p.id}
                className={`flex items-center rounded-lg transition-colors ${
                  isCurrentUser
                    ? "bg-red-atlantida/10 border border-red-atlantida/20"
                    : position % 2 === 0
                      ? "bg-bg-elevated"
                      : "bg-bg-surface"
                }`}
              >
                <div className="w-16 lg:w-20 py-3 text-center">
                  <span className={`text-sm font-black ${isCurrentUser ? "text-red-atlantida" : "text-white/60"}`}>
                    {position}
                  </span>
                </div>
                <div className="flex-1 py-3 px-4">
                  <span className={`text-sm font-medium ${isCurrentUser ? "text-red-atlantida font-bold" : "text-white/80"}`}>
                    {p.full_name || "Usuario"}
                  </span>
                </div>
                <div className="w-24 lg:w-28 py-3 text-center">
                  <span className={`text-sm font-black ${isCurrentUser ? "text-red-atlantida" : "text-white/60"}`}>
                    {p.total_points} Pts.
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

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
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-red-atlantida">{totalPoints}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">PUNTOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">#{rankPosition || "-"}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">RANKING</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">0</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">JUGADOS</p>
              </div>
            </div>
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

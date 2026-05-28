"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import FadeIn from "@/components/ui/FadeIn"
import InstallAppModal from "@/components/ui/InstallAppModal"
import { motion, useInView } from "motion/react"

const PER_PAGE = 20

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
  predictionsCount: number
  exactScores: number
  currentUserId: string
  authProvider: string
}

export default function RankingClient({
  userName, userEmail, userInitial, rankPosition, totalPoints,
  predictionsCount, exactScores, currentUserId, authProvider,
}: RankingClientProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<RankProfile | null>(null)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState("")
  const podiumRef = useRef(null)
  const podiumInView = useInView(podiumRef, { once: true, margin: "100px" })
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Ranking data state
  const [top3, setTop3] = useState<RankProfile[]>([])
  const [pageProfiles, setPageProfiles] = useState<RankProfile[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [myPosition, setMyPosition] = useState<{ position: number; points: number; onPage: boolean } | null>(null)

  const totalPages = Math.max(1, Math.ceil((totalCount - 3) / PER_PAGE))

  // Fetch ranking data
  const fetchRanking = useCallback(async (page: number) => {
    setLoading(true)

    // Get top 3
    const { data: topData } = await supabase
      .from("profiles")
      .select("id, full_name, total_points, exact_scores, predictions_count, rank_position")
      .gt("predictions_count", 0)
      .order("total_points", { ascending: false })
      .order("exact_scores", { ascending: false })
      .limit(3)

    setTop3(topData || [])

    // Get total count
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("predictions_count", 0)

    setTotalCount(count || 0)

    // Get paginated data (from position 4 onwards)
    const from = (page - 1) * PER_PAGE + 3
    const to = from + PER_PAGE - 1

    const { data: pageData } = await supabase
      .from("profiles")
      .select("id, full_name, total_points, exact_scores, predictions_count, rank_position")
      .gt("predictions_count", 0)
      .order("total_points", { ascending: false })
      .order("exact_scores", { ascending: false })
      .range(from, to)

    setPageProfiles(pageData || [])

    // Check if current user is in top 3 or current page
    const isInTop3 = (topData || []).some(p => p.id === currentUserId)
    const isInPage = (pageData || []).some(p => p.id === currentUserId)

    if (!isInTop3 && !isInPage) {
      // Find user's position
      const { data: userRank } = await supabase
        .from("profiles")
        .select("total_points, rank_position")
        .eq("id", currentUserId)
        .single()

      if (userRank && userRank.rank_position) {
        setMyPosition({
          position: userRank.rank_position,
          points: userRank.total_points || 0,
          onPage: false,
        })
      } else {
        setMyPosition(null)
      }
    } else {
      setMyPosition(null)
    }

    setLoading(false)
  }, [currentUserId, supabase])

  // Initial fetch
  useEffect(() => {
    fetchRanking(currentPage)
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("ranking-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          // Re-fetch when any profile updates
          fetchRanking(currentPage)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const goToMyPage = () => {
    if (myPosition) {
      const myPage = Math.ceil((myPosition.position - 3) / PER_PAGE)
      setCurrentPage(Math.max(1, myPage))
    }
  }

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
    setPasswordMsg(error ? "Error al enviar el correo" : "Revisa tu correo para cambiar tu contraseña")
    setTimeout(() => setPasswordMsg(""), 5000)
  }

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

  // Pagination range
  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-ranking.jpg')",
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
      </FadeIn>

      {/* Title */}
      <FadeIn delay={0.15}>
      <div className="flex justify-center mb-4">
        <Image
          src="/images/logo-grupo-atlantida.png"
          alt="Grupo Financiero Atlántida"
          width={180}
          height={50}
          className="h-10 w-auto"
        />
      </div>
      <h2 className="text-2xl lg:text-3xl font-black text-white text-center tracking-wider uppercase mb-2">
        Ranking Actual
      </h2>
      <p className="text-white/30 text-sm text-center mb-8 lg:mb-10">
        Actualizado en tiempo real
      </p>
      </FadeIn>

      {/* Podium — Top 3 always visible */}
      {top3.length >= 3 && (
        <div ref={podiumRef} className="flex items-end justify-center gap-2 mb-10 lg:gap-4 lg:mb-12">
          {/* 2nd Place */}
          <motion.div
            className="flex-1 max-w-[140px] lg:max-w-[200px] origin-bottom"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div onClick={() => setSelectedPlayer(top3[1])} className="bg-white p-4 lg:p-5 text-center min-h-[140px] lg:min-h-[170px] flex flex-col justify-end cursor-pointer hover:opacity-90 transition-opacity" style={{ borderRadius: "0 2rem 0 0" }}>
              <p className="text-6xl lg:text-7xl font-black text-gray-900 leading-none">2</p>
              {top3[1].full_name && (
                <p className="text-gray-600 text-[10px] lg:text-xs font-bold mt-2 truncate">{top3[1].full_name}</p>
              )}
              <p className="text-gray-900 text-xs lg:text-sm font-black mt-1">{top3[1].total_points} Pts.</p>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            className="flex-1 max-w-[160px] lg:max-w-[220px] origin-bottom"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div onClick={() => setSelectedPlayer(top3[0])} className="bg-red-atlantida p-4 lg:p-5 text-center min-h-[180px] lg:min-h-[220px] flex flex-col justify-end cursor-pointer hover:opacity-90 transition-opacity" style={{ borderRadius: "2rem 0 0 0" }}>
              <p className="text-7xl lg:text-8xl font-black text-white/90 leading-none">1</p>
              <p className="text-white text-[10px] lg:text-xs font-bold mt-2 truncate">{top3[0].full_name || "---"}</p>
              <p className="text-white text-sm lg:text-base font-black mt-1">{top3[0].total_points} Pts.</p>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            className="flex-1 max-w-[140px] lg:max-w-[200px] origin-bottom"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div onClick={() => setSelectedPlayer(top3[2])} className="bg-[#C8C8C8] p-4 lg:p-5 text-center min-h-[120px] lg:min-h-[150px] flex flex-col justify-end cursor-pointer hover:opacity-90 transition-opacity" style={{ borderRadius: "2rem 0 0 0" }}>
              <p className="text-5xl lg:text-6xl font-black text-gray-900 leading-none">3</p>
              {top3[2].full_name && (
                <p className="text-gray-600 text-[10px] lg:text-xs font-bold mt-2 truncate">{top3[2].full_name}</p>
              )}
              <p className="text-gray-900 text-xs lg:text-sm font-black mt-1">{top3[2].total_points} Pts.</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Total participants */}
      <FadeIn delay={0.3}>
      <p className="text-white/20 text-xs text-center mb-4 tracking-wider">
        {totalCount} participantes
      </p>
      </FadeIn>

      {/* Table Header */}
      <FadeIn delay={0.35}>
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
      <div className="space-y-0.5 mb-6">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-red-atlantida/30 border-t-red-atlantida rounded-full animate-spin mx-auto" />
          </div>
        ) : pageProfiles.length === 0 && top3.length === 0 ? (
          <p className="text-center text-white/30 py-12 text-sm">No hay jugadores en el ranking aún</p>
        ) : (
          pageProfiles.map((p, i) => {
            const position = (currentPage - 1) * PER_PAGE + i + 4
            const isCurrentUser = p.id === currentUserId
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlayer(p)}
                className={`flex items-center rounded-lg transition-colors cursor-pointer hover:border-red-atlantida/20 ${
                  isCurrentUser
                    ? "bg-red-atlantida/10 border border-red-atlantida/20"
                    : position % 2 === 0
                      ? "bg-bg-elevated hover:bg-bg-elevated/80"
                      : "bg-bg-surface hover:bg-bg-surface/80"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mb-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-white/20 text-sm">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? "bg-red-atlantida text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      )}
      </FadeIn>

      {/* Floating "Your Position" banner */}
      {myPosition && !myPosition.onPage && (
        <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={goToMyPage}
            className="w-full flex items-center justify-between bg-red-atlantida rounded-2xl px-5 py-4 shadow-lg shadow-red-atlantida/20 cursor-pointer hover:shadow-red-atlantida/40 transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-sm font-black">{userInitial}</span>
              </div>
              <div className="text-left">
                <p className="text-white text-xs font-bold">Tu posición</p>
                <p className="text-white/70 text-[10px]">{myPosition.points} Pts.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-2xl font-black">#{myPosition.position}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </button>
        </div>
      )}

      {/* Player Stats Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedPlayer(null)} />
          <div className="relative z-10 w-full max-w-sm bg-bg-elevated border border-border-subtle rounded-3xl p-8 animate-slide-up">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="w-20 h-20 rounded-full bg-red-atlantida/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-black text-red-atlantida">
                {selectedPlayer.full_name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>

            <h2 className="text-xl font-black text-white text-center">{selectedPlayer.full_name || "Usuario"}</h2>
            <p className="text-red-atlantida text-sm text-center font-bold mt-1 mb-6">
              Posición #{selectedPlayer.rank_position || "-"}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-bg-surface rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-red-atlantida">{selectedPlayer.total_points}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">PUNTOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white">{selectedPlayer.predictions_count}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">JUGADOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white">{selectedPlayer.exact_scores}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">EXACTOS</p>
              </div>
            </div>

            {selectedPlayer.predictions_count > 0 && (
              <div className="bg-bg-surface rounded-xl p-4 text-center mt-2">
                <p className="text-white/30 text-[10px] font-bold mb-1">PROMEDIO POR PARTIDO</p>
                <p className="text-lg font-black text-white">
                  {(selectedPlayer.total_points / selectedPlayer.predictions_count).toFixed(1)} <span className="text-white/40 text-xs">pts/partido</span>
                </p>
              </div>
            )}
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
                <p className="text-white/30 text-xs">Tu cuenta está vinculada con Google. La contraseña se administra desde tu cuenta de Google.</p>
              </div>
            ) : (
              <button onClick={handleResetPassword} className="w-full py-3 rounded-xl font-bold text-xs tracking-wider bg-bg-surface text-white/50 hover:text-white/70 transition-all duration-300 cursor-pointer mb-3">
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

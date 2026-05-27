"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import FadeIn from "@/components/ui/FadeIn"
import { motion, useInView, AnimatePresence } from "motion/react"

const PREMIOS_GRUPOS = [
  { lugar: 1, premio: "Gift Card Supermercado", monto: "$500" },
  { lugar: 2, premio: "Gift Card Supermercado", monto: "$300" },
  { lugar: 3, premio: "Gift Card Supermercado", monto: "$250" },
  { lugar: 4, premio: "Gift Card Supermercado", monto: "$200" },
  { lugar: 5, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 6, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 7, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 8, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 9, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 10, premio: "Gift Card Supermercado", monto: "$100" },
]

const PREMIOS_ELIMINATORIA = [
  { lugar: 1, premio: "+ Gift Card de Supermercado $100", monto: "TV 60\"" },
  { lugar: 2, premio: "+ Gift Card de Supermercado $100", monto: "TV 50\"" },
  { lugar: 3, premio: "+ Gift Card de Supermercado $100", monto: "TV 45\"" },
  { lugar: 4, premio: "Gift Card Supermercado", monto: "$250" },
  { lugar: 5, premio: "Gift Card Supermercado", monto: "$250" },
  { lugar: 6, premio: "Gift Card Supermercado", monto: "$150" },
  { lugar: 7, premio: "Gift Card Supermercado", monto: "$150" },
  { lugar: 8, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 9, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 10, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 11, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 12, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 13, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 14, premio: "Gift Card Supermercado", monto: "$100" },
  { lugar: 15, premio: "Gift Card Supermercado", monto: "$100" },
]

interface PremiosClientProps {
  userName: string
  userEmail: string
  userInitial: string
  rankPosition: number
  totalPoints: number
  predictionsCount: number
  exactScores: number
  prizes: unknown[]
  raffles: unknown[]
  authProvider: string
}

export default function PremiosClient({
  userName, userEmail, userInitial, rankPosition, totalPoints,
  predictionsCount, exactScores, authProvider,
}: PremiosClientProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState("")
  const [fase, setFase] = useState<"grupos" | "eliminatoria">("grupos")
  const prizesRef = useRef(null)
  const prizesInView = useInView(prizesRef, { once: true, margin: "-50px" })
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const premios = fase === "grupos" ? PREMIOS_GRUPOS : PREMIOS_ELIMINATORIA
  const top3 = premios.slice(0, 3)
  const resto = premios.slice(3)

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

  // Podium heights — 1st is tallest
  const podiumHeights: Record<number, string> = {
    1: "min-h-[260px] lg:min-h-[320px]",
    2: "min-h-[210px] lg:min-h-[260px]",
    3: "min-h-[170px] lg:min-h-[210px]",
  }

  const podiumStyles: Record<number, { bg: string; isFirst: boolean }> = {
    1: { bg: "bg-red-atlantida", isFirst: true },
    2: { bg: "bg-white", isFirst: false },
    3: { bg: "bg-[#C8C8C8]", isFirst: false },
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-premios.jpg')",
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
      <h2 className="text-2xl lg:text-3xl font-black text-white text-center tracking-wider uppercase mb-2">
        Premios
      </h2>
      <p className="text-white/30 text-sm text-center mb-6 lg:mb-8">
        Los mejores del ranking ganan al final de cada fase
      </p>
      </FadeIn>

      {/* Toggle Grupos / Eliminatorias */}
      <FadeIn delay={0.2}>
      <div className="flex items-center justify-center mb-8 lg:mb-10">
        <div className="inline-flex items-center rounded-full border border-border-medium bg-bg-surface p-1">
          <button
            onClick={() => setFase("grupos")}
            className={`py-2.5 px-6 rounded-full text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
              fase === "grupos" ? "bg-red-atlantida text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            GRUPOS
          </button>
          <button
            onClick={() => setFase("eliminatoria")}
            className={`py-2.5 px-6 rounded-full text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
              fase === "eliminatoria" ? "bg-red-atlantida text-white" : "text-white/40 hover:text-white/60"
            }`}
          >
            ELIMINATORIAS
          </button>
        </div>
      </div>
      </FadeIn>

      {/* Fase subtitle */}
      <FadeIn delay={0.25}>
      <p className="text-white/20 text-xs text-center mb-6 tracking-wider uppercase">
        {fase === "grupos" ? "11 de junio — 27 de junio 2026" : "28 de junio — 19 de julio 2026"}
      </p>
      </FadeIn>

      {/* Top 3 Podium */}
      <div ref={prizesRef} className="grid grid-cols-3 gap-2 mb-6 lg:gap-4 lg:mb-8 items-end">
        <AnimatePresence mode="wait">
          {top3.map((prize) => {
            const style = podiumStyles[prize.lugar]
            const height = podiumHeights[prize.lugar]
            const delayMap: Record<number, number> = { 1: 0.1, 2: 0.3, 3: 0.5 }
            return (
              <motion.div
                key={`${fase}-${prize.lugar}`}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={prizesInView ? { scaleY: 1, opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: delayMap[prize.lugar] || 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                className="origin-bottom"
              >
                <div
                  className={`${style.bg} ${height} p-4 lg:p-6 flex flex-col`}
                  style={{ borderRadius: "2rem 2rem 0 0" }}
                >
                  <p className={`text-5xl lg:text-7xl font-black leading-none ${style.isFirst ? "text-white/20" : "text-black/10"}`}>
                    {prize.lugar}
                  </p>
                  <div className="mt-auto">
                    <p className={`text-2xl lg:text-3xl font-black ${style.isFirst ? "text-white" : "text-gray-900"}`}>
                      {prize.monto}
                    </p>
                    <p className={`text-[11px] lg:text-xs font-bold mt-1.5 ${style.isFirst ? "text-white/70" : "text-gray-600"}`}>
                      {prize.premio}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Remaining prizes */}
      <FadeIn delay={0.35}>
      <div className="space-y-2 mb-8 lg:mb-10">
        {resto.map((prize) => (
          <div
            key={`${fase}-${prize.lugar}`}
            className="flex items-center bg-bg-elevated border border-border-subtle rounded-xl p-4 lg:p-5"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 mr-4">
              <span className="text-white/40 text-sm lg:text-base font-black">{prize.lugar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{prize.premio}</p>
            </div>
            <div className="shrink-0 ml-3">
              <span className="text-white font-black text-sm">{prize.monto}</span>
            </div>
          </div>
        ))}
      </div>
      </FadeIn>

      {/* Info + Link bases */}
      <FadeIn delay={0.4}>
      <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-6 lg:p-8 mb-6">
        <p className="text-white/40 text-xs leading-relaxed mb-4">
          Los premios no son transferibles, no son negociables ni canjeables por dinero en efectivo. Los ganadores serán notificados a través de la plataforma y/o por los medios de contacto proporcionados al momento del registro.
        </p>
        <Link
          href="/bases-del-concurso"
          target="_blank"
          className="inline-flex items-center gap-2 text-red-atlantida text-sm font-bold hover:opacity-80 transition-opacity"
        >
          Ver bases del concurso completas
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      </FadeIn>

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
              onClick={handleLogout}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider bg-red-atlantida/10 text-red-atlantida border border-red-atlantida/20 hover:bg-red-atlantida/20 transition-all duration-300 cursor-pointer"
            >
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

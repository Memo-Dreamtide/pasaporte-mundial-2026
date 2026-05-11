"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import FadeIn from "@/components/ui/FadeIn"
import { motion, useInView } from "motion/react"

type Prize = {
  id: string
  place: number
  prize_name: string
  prize_description: string
  sponsor_name: string
  sponsor_logo: string | null
  winner_id: string | null
}

type Raffle = {
  id: string
  week_number: number
  prize_name: string
  sponsor_name: string
  draw_date: string
  winner_id: string | null
  participants_count: number
}

interface PremiosClientProps {
  userName: string
  userEmail: string
  userInitial: string
  rankPosition: number
  totalPoints: number
  predictionsCount: number
  exactScores: number
  prizes: Prize[]
  raffles: Raffle[]
  authProvider: string
}

export default function PremiosClient({
  userName, userEmail, userInitial, rankPosition, totalPoints,
  predictionsCount, exactScores, prizes, raffles, authProvider,
}: PremiosClientProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState("")
  const prizesRef = useRef(null)
  const prizesInView = useInView(prizesRef, { once: true, margin: "-50px" })
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
    setPasswordMsg(error ? "Error al enviar el correo" : "Revisa tu correo para cambiar tu contrasena")
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

  // Prize card styles per position — all same height, top corners rounded, bottom square
  const prizeStyles: Record<number, { bg: string; isFirst: boolean }> = {
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
      <p className="text-white/30 text-sm text-center mb-8 lg:mb-10">
        Los mejores predictores ganan al final del torneo
      </p>
      </FadeIn>

      {/* Top 3 Prize Cards — 1st rises first, then 2nd, then 3rd */}
      <div ref={prizesRef} className="grid grid-cols-3 gap-2 mb-12 lg:gap-4 lg:mb-14 items-stretch">
        {prizes.slice(0, 3).map((prize) => {
          const style = prizeStyles[prize.place] || prizeStyles[3]
          const delayMap: Record<number, number> = { 1: 0.1, 2: 0.35, 3: 0.6 }
          return (
            <motion.div
              key={prize.id}
              className="origin-bottom"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={prizesInView ? { scaleY: 1, opacity: 1 } : {}}
              transition={{ duration: 0.65, delay: delayMap[prize.place] || 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <div
                className={`${style.bg} p-4 lg:p-6 flex flex-col h-full`}
                style={{ borderRadius: "2rem 2rem 0 0" }}
              >
                <p className={`text-6xl lg:text-7xl font-black leading-none ${style.isFirst ? "text-white/20" : "text-black/10"}`}>
                  {prize.place}
                </p>
                <div className="mt-auto">
                  <p className={`text-sm lg:text-base font-black ${style.isFirst ? "text-white" : "text-gray-900"}`}>
                    {prize.prize_name}
                  </p>
                  <p className={`text-[10px] lg:text-xs mt-1.5 ${style.isFirst ? "text-white/60" : "text-gray-500"}`}>
                    {prize.prize_description}
                  </p>
                  <p className={`text-[9px] lg:text-[10px] font-bold tracking-wider mt-3 uppercase ${style.isFirst ? "text-white/40" : "text-gray-400"}`}>
                    {prize.sponsor_name}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Sorteos Semanales */}
      <FadeIn delay={0.35}>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-red-atlantida rounded-full" />
          <h3 className="text-lg lg:text-xl font-black text-white tracking-wider uppercase">
            Sorteos Semanales
          </h3>
        </div>
        <p className="text-white/30 text-xs mb-5 ml-5">
          Pronostica al menos 1 partido por semana y participas automaticamente
        </p>

        <div className="space-y-2">
          {raffles.map((raffle) => (
            <div
              key={raffle.id}
              className="flex items-center bg-bg-elevated border border-border-subtle rounded-xl p-4 lg:p-5"
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-red-atlantida/10 flex items-center justify-center shrink-0 mr-4">
                <span className="text-red-atlantida text-sm lg:text-base font-black">S{raffle.week_number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{raffle.prize_name}</p>
                <p className="text-white/30 text-xs">{raffle.sponsor_name}</p>
              </div>
              <div className="shrink-0 ml-3">
                {raffle.winner_id ? (
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-green-500/15 text-green-400">
                    Sorteado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-atlantida/10 text-red-atlantida">
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </FadeIn>

      {/* Como Funciona */}
      <FadeIn delay={0.45}>
      <div className="bg-bg-elevated border border-border-subtle p-6 lg:p-8 mb-6" style={{ borderRadius: "0 0 2.5rem 2.5rem" }}>
        <h3 className="text-sm font-black text-white tracking-wider uppercase mb-5">Como Participar</h3>
        <div className="space-y-4">
          {[
            { num: "01", text: "Pronostica los marcadores antes del inicio de cada partido" },
            { num: "02", text: "Acumula puntos segun la precision de tus pronosticos" },
            { num: "03", text: "Los 3 mejores al final del torneo ganan los premios principales" },
            { num: "04", text: "Con 1 pronostico por semana participas en el sorteo semanal" },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <span className="text-red-atlantida text-sm font-black shrink-0">{step.num}</span>
              <p className="text-white/50 text-sm">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
      </FadeIn>

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

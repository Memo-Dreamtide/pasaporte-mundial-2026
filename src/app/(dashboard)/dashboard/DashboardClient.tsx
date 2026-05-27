"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import FadeIn from "@/components/ui/FadeIn"
import { useRef } from "react"
import { motion, useInView } from "motion/react"

interface MatchData {
  homeCode: string
  awayCode: string
  homeFlag: string
  awayFlag: string
  homeScore: number
  awayScore: number
  matchDate: string
  isLive: boolean
  status: string
}

interface DashboardClientProps {
  userName: string
  userEmail: string
  userInitial: string
  rankPosition: number
  totalPoints: number
  predictedCount: number
  faltantes: number
  exactCount: number
  match: MatchData | null
  authProvider: string
}

const brands = [
  { logo: "/images/logos-atlantida/banco-atlantida.png", name: "Banco Atlántida" },
  { logo: "/images/logos-atlantida/seguros-atlantida.png", name: "Seguros Atlántida" },
  { logo: "/images/logos-atlantida/atlantida-capital.png", name: "Atlántida Capital, S.A." },
  { logo: "/images/logos-atlantida/confia.png", name: "CONFIA" },
  { logo: "/images/logos-atlantida/atlantida-titularizadora.png", name: "Atlántida Titularizadora" },
  { logo: "/images/logos-atlantida/atlantida-securities.png", name: "Atlántida Securities" },
  { logo: "/images/logos-atlantida/fundacion-atlantida.png", name: "Fundación Atlántida" },
  { logo: "/images/logos-atlantida/leasing-atlantida.png", name: "Leasing Atlántida" },
]

function formatToSV(dateStr: string) {
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

export default function DashboardClient({
  userName,
  userEmail,
  userInitial,
  rankPosition,
  totalPoints,
  predictedCount,
  faltantes,
  exactCount,
  match,
  authProvider,
}: DashboardClientProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [brandIndex, setBrandIndex] = useState(0)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState("")
  const cardsRef = useRef(null)
  const cardsInView = useInView(cardsRef, { once: true, margin: "-50px" })
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
    if (error) {
      setPasswordMsg("Error al enviar el correo")
    } else {
      setPasswordMsg("Revisa tu correo para cambiar tu contrasena")
    }
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

  const navItems = [
    { label: "INICIO", href: "/dashboard" },
    { label: "PRONÓSTICOS", href: "/pronosticos" },
    { label: "PARTIDOS", href: "/partidos" },
    { label: "RANKING", href: "/ranking" },
    { label: "PREMIOS", href: "/premios" },
  ]

  return (
    <div
      className="min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-inicio.jpg')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay: dark + gradient for readability */}
      <div className="absolute inset-0 bg-bg-base/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-base/50 to-bg-base" />

      <div className="relative z-10 px-4 lg:px-8 pt-6 pb-24 max-w-md lg:max-w-6xl mx-auto">
      {/* Header — on desktop: name left, nav center, profile right in one row */}
      <FadeIn delay={0.1}>
      <div className="flex items-start justify-between mb-6 lg:items-center lg:mb-10">
        <h1 className="text-4xl lg:text-5xl font-light text-white leading-tight">
          {userName.split(" ").map((word, i) => (
            <span key={i} className="lg:inline">{word}<br className="lg:hidden" />{" "}</span>
          ))}
        </h1>

        {/* Nav — below header on mobile, inline on desktop */}
        <div className="hidden lg:flex items-center rounded-full border border-border-medium bg-bg-surface p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isHovered = hoveredNav === item.href
            const showRed = isActive || isHovered
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.href)}
                onMouseLeave={() => setHoveredNav(null)}
                className={`text-center py-2.5 px-6 rounded-full text-[11px] font-bold tracking-wider transition-all duration-300 whitespace-nowrap ${
                  showRed
                    ? "bg-red-atlantida text-white"
                    : "text-white/40 hover:text-white/60"
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

      {/* Mobile-only Navigation Tabs */}
      <div className="flex items-center rounded-full border border-border-medium bg-bg-surface p-1 mb-6 lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isHovered = hoveredNav === item.href
          const showRed = isActive || isHovered
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredNav(item.href)}
              onMouseLeave={() => setHoveredNav(null)}
              className={`flex-1 text-center py-2 px-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 whitespace-nowrap ${
                showRed
                  ? "bg-red-atlantida text-white"
                  : "text-white/40"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Main Content — stacked on mobile, 3-column grid on desktop */}
      <FadeIn delay={0.2}>
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Stats Card — spans 2 cols on desktop */}
        <div ref={cardsRef} className="flex gap-2 mb-6 lg:col-span-2 lg:mb-0 items-end">
          {/* Position - rises up first like a bar chart */}
          <motion.div
            className="flex-1 bg-red-atlantida p-6 flex flex-col justify-end min-h-[220px] lg:min-h-[320px] origin-bottom"
            style={{ borderRadius: "0 3rem 0 0" }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={cardsInView ? { scaleY: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <p className="text-8xl lg:text-9xl font-black text-black/70 leading-none">{rankPosition || "-"}</p>
            <p className="text-white/90 text-[11px] font-bold tracking-wider mt-3 uppercase">Posicion Actual</p>
          </motion.div>

          {/* Predictions - rises up second with delay */}
          <motion.div
            className="flex-1 bg-[#C8C8C8] p-4 lg:p-6 flex flex-col justify-between min-h-[220px] lg:min-h-[320px] origin-bottom"
            style={{ borderRadius: "3rem 0 0 0" }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={cardsInView ? { scaleY: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="space-y-2 lg:space-y-3">
              <div className="bg-[#B0B0B0] rounded-full px-4 py-2.5 lg:py-3 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-black text-gray-900">{predictedCount}</span>
                <span className="text-gray-700 text-xs lg:text-sm font-medium">Actuales</span>
              </div>
              <div className="bg-[#B0B0B0] rounded-full px-4 py-2.5 lg:py-3 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-black text-gray-900">{faltantes}</span>
                <span className="text-gray-700 text-xs lg:text-sm font-medium">Faltantes</span>
              </div>
              <div className="bg-[#B0B0B0] rounded-full px-4 py-2.5 lg:py-3 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-black text-gray-900">{exactCount}</span>
                <span className="text-gray-700 text-xs lg:text-sm font-medium">Acertados</span>
              </div>
            </div>
            <p className="text-gray-700 text-[11px] font-bold tracking-wider mt-3 uppercase text-center">Pronosticos</p>
          </motion.div>
        </div>

        {/* Right column on desktop: Match + Carousel stacked */}
        <div className="lg:col-span-1 lg:flex lg:flex-col lg:gap-6">
          {/* Live Results */}
          {match && (
            <div className="bg-bg-elevated p-5 lg:p-6 border border-border-subtle lg:flex-1" style={{ borderRadius: "0 0 3rem 3rem" }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-white text-xs font-black tracking-wider uppercase">Resultados</span>
                {match.isLive ? (
                  <span className="text-red-atlantida text-xs font-black tracking-wider uppercase animate-pulse">EN VIVO</span>
                ) : (
                  <span className="text-white/30 text-xs font-black tracking-wider uppercase">Proximo</span>
                )}
              </div>
              <p className="text-center text-red-atlantida/60 text-[11px] font-medium mb-4">
                {formatToSV(match.matchDate)}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <p className="text-4xl font-black text-white tracking-wider">{match.homeCode}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-2xl">{match.homeFlag}</span>
                    <span className="text-2xl font-black text-white">
                      {match.isLive || match.status === "finished" ? String(match.homeScore).padStart(2, "0") : "--"}
                    </span>
                  </div>
                </div>

                <span className="text-white/20 text-sm font-bold px-4">vs</span>

                <div className="flex-1 text-center">
                  <p className="text-4xl font-black text-white tracking-wider">{match.awayCode}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-2xl">{match.awayFlag}</span>
                    <span className="text-2xl font-black text-white">
                      {match.isLive || match.status === "finished" ? String(match.awayScore).padStart(2, "0") : "--"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Brand Carousel */}
          <div className="relative overflow-hidden h-[120px] mt-6 lg:mt-0">
            <Image
              src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-demuestra.jpg"
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 flex items-center justify-center h-full px-8">
              <div
                key={brandIndex}
                className="animate-fade-in flex items-center justify-center"
              >
                <Image
                  src={brands[brandIndex].logo}
                  alt={brands[brandIndex].name}
                  width={400}
                  height={120}
                  className="object-contain max-h-[80px] lg:max-h-[100px] w-auto"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      </FadeIn>

      {/* Promotional Banner */}
      <FadeIn delay={0.3}>
      <div className="relative overflow-hidden mt-6 lg:mt-8 h-[200px] lg:h-[280px]" style={{ borderRadius: "0 0 3rem 3rem" }}>
        <Image
          src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/banner-home.jpg"
          alt="Pasaporte 2026"
          fill
          className="object-cover"
        />
      </div>
      </FadeIn>

      {/* Fixed "+" Button */}
      <Link
        href="/pronosticos"
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-16 h-16 bg-red-atlantida rounded-full flex items-center justify-center shadow-[0_4px_30px_rgba(217,39,46,0.5)] hover:shadow-[0_4px_40px_rgba(217,39,46,0.7)] hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowProfile(false)}
          />
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
                <p className="text-xl font-black text-white">{predictedCount}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">JUGADOS</p>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 text-center">
                <p className="text-xl font-black text-white">{exactCount}</p>
                <p className="text-white/30 text-[10px] font-bold mt-1">EXACTOS</p>
              </div>
            </div>

            {faltantes > 0 && (
              <p className="text-white/20 text-xs text-center mb-5">Te faltan {faltantes} pronosticos por hacer</p>
            )}

            {authProvider === "google" ? (
              <div className="flex items-center gap-2 bg-bg-surface rounded-xl px-4 py-3 mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/30 shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="text-white/30 text-xs">Tu cuenta esta vinculada con Google. La contrasena se administra desde tu cuenta de Google.</p>
              </div>
            ) : (
              <button
                onClick={handleResetPassword}
                className="w-full py-3 rounded-xl font-bold text-xs tracking-wider bg-bg-surface text-white/50 hover:text-white/70 transition-all duration-300 cursor-pointer mb-3"
              >
                CAMBIAR CONTRASENA
              </button>
            )}

            {passwordMsg && (
              <p className="text-red-atlantida text-xs text-center mb-3">{passwordMsg}</p>
            )}

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

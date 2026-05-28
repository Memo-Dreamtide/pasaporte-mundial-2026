"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "motion/react"

function ParallaxBg({ src, overlay, blend, className = "" }: { src?: string; overlay?: string; blend?: string; className?: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {src ? (
        <motion.div
          className={`absolute inset-0 bg-cover bg-center ${className}`}
          style={{
            backgroundImage: `url('${src}')`,
            y,
            top: "-15%",
            bottom: "-15%",
            ...(blend ? { mixBlendMode: blend as React.CSSProperties["mixBlendMode"] } : {}),
          }}
        />
      ) : (
        <motion.div
          className={`absolute inset-0 ${className}`}
          style={{ y, top: "-15%", bottom: "-15%" }}
        />
      )}
      {overlay && <div className={`absolute inset-0 ${overlay}`} />}
    </div>
  )
}

function RevealOnScroll({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const ATLANTIDA_LOGOS = [
  { src: "/images/logos-atlantida-red/fundacion-atlantida.png", alt: "Fundacion Atlantida" },
  { src: "/images/logos-atlantida-red/atlantida-capital.png", alt: "Atlantida Capital" },
  { src: "/images/logos-atlantida-red/seguros-atlantida.png", alt: "Seguros Atlantida" },
  { src: "/images/logos-atlantida-red/atlantida-securities.png", alt: "Atlantida Securities" },
  { src: "/images/logos-atlantida-red/banco-atlantida.png", alt: "Banco Atlantida" },
  { src: "/images/logos-atlantida-red/confia.png", alt: "Confia" },
  { src: "/images/logos-atlantida-red/leasing-atlantida.png", alt: "Leasing Atlantida" },
  { src: "/images/logos-atlantida-red/atlantida-titularizadora.png", alt: "Atlantida Titularizadora" },
]

function StaggerLogos() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <div ref={ref} className="relative z-10 max-w-4xl mx-auto">
      {/* Grupo Financiero Atlántida header — overlapping the white card */}
      <motion.div
        className="flex justify-center relative z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="bg-[#D9272E] rounded-2xl px-8 py-4 md:px-10 md:py-5 translate-y-1/2">
          <Image src="/images/logos-atlantida-red/grupo-financiero.png" alt="Grupo Financiero Atlantida" width={400} height={120} unoptimized className="h-10 md:h-14 w-auto brightness-0 invert" />
        </div>
      </motion.div>
      {/* White card with logo grid */}
      <motion.div
        className="bg-white rounded-3xl px-6 pt-14 pb-8 md:px-12 md:pt-16 md:pb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="grid grid-cols-3 gap-x-4 gap-y-5 md:gap-x-10 md:gap-y-6 items-center justify-items-center">
          {ATLANTIDA_LOGOS.map((logo, i) => (
            <motion.div
              key={logo.alt}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={300}
                height={120}
                unoptimized
                className="h-16 md:h-24 w-auto object-contain max-w-full"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function Home() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.1])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <div className="bg-bg-base">

      {/* ========== HEADER ========== */}
      <StickyHeader />

      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Video background with parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: heroScale, y: heroY }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </motion.div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Logo Vive el Mundial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="mb-8"
          >
            <img
              src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/logo-vive-el-mundial.png"
              alt="Atlantida Vive el Mundial"
              style={{ width: "min(80vw, 480px)", height: "auto", filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.5))" }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-white text-lg md:text-2xl mb-10 font-light tracking-wide"
          >
            Predice, compite y ¡Gana premios!
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/login"
              className="px-10 py-4 text-white font-bold text-sm tracking-[0.15em] uppercase border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              INICIAR SESIÓN
            </Link>
            <Link
              href="/registro"
              className="group relative px-10 py-4 bg-red-atlantida text-white font-bold text-sm tracking-[0.15em] uppercase rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(217,39,46,0.4)] cursor-pointer"
            >
              <span className="relative z-10">COMIENZA AQUÍ</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-atlantida to-red-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ========== MARCADORES EN VIVO ========== */}
      <section className="pt-16 md:pt-24 pb-24 md:pb-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Stats Bar */}
          <RevealOnScroll className="mb-16 md:mb-20">
            <div className="grid grid-cols-3 gap-4 md:gap-8 p-6 md:p-10 rounded-2xl bg-gray-50 border border-gray-200">
              {[
                { value: 104, label: "PARTIDOS" },
                { value: 48, label: "SELECCIONES" },
                { value: 11, label: "CIUDADES SEDE" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-5xl font-black text-red-atlantida">
                    <CountUp target={stat.value} />
                  </p>
                  <p className="text-gray-500 text-[10px] md:text-xs tracking-[0.15em] mt-1 uppercase font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <span className="text-red-atlantida text-xs font-bold tracking-[0.2em] uppercase">En tiempo real</span>
                <h2 className="text-4xl md:text-5xl font-black mt-3 mb-5 text-red-atlantida leading-tight uppercase">
                  Marcadores<br />en vivo
                </h2>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-md">
                  Sigue todos los resultados de la cita mundialista en tiempo real. Marcadores, estadísticas y actualizaciones al instante desde tu celular.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-red-atlantida/5 rounded-3xl blur-2xl" />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
                  {[
                    { home: "México", away: "Sudáfrica", scoreH: 2, scoreA: 1, time: "67'", live: true },
                    { home: "España", away: "Uruguay", scoreH: 1, scoreA: 1, time: "45+2'", live: true },
                    { home: "Argentina", away: "Austria", scoreH: 3, scoreA: 0, time: "FT", live: false },
                  ].map((match, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex-1 text-right">
                        <span className="text-sm font-bold text-gray-900">{match.home}</span>
                      </div>
                      <div className="flex items-center gap-3 mx-4">
                        <span className="text-2xl font-black text-gray-900">{match.scoreH}</span>
                        <div className="flex flex-col items-center">
                          {match.live ? (
                            <span className="text-[10px] font-bold text-red-atlantida tracking-wider animate-pulse">EN VIVO</span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider">FIN</span>
                          )}
                          <span className="text-[10px] text-gray-400">{match.time}</span>
                        </div>
                        <span className="text-2xl font-black text-gray-900">{match.scoreA}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-bold text-gray-900">{match.away}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ========== COMO FUNCIONA ========== */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-red-atlantida">
        <ParallaxBg src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-predice.jpg" blend="multiply" className="opacity-50" />

        <div className="max-w-5xl mx-auto relative z-10">
          <RevealOnScroll>
            <div className="text-center mb-16 md:mb-20">
              <span className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase">Así de fácil</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 text-white uppercase">
                Predice, espera<br />y gana
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                num: "01",
                title: "REGISTRATE",
                desc: "Crea tu cuenta gratis en segundos con tu correo electrónico.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ),
              },
              {
                num: "02",
                title: "PRONOSTICA",
                desc: "Predice los marcadores de los 104 partidos. Fácil, rápido y desde tu celular.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ),
              },
              {
                num: "03",
                title: "GANA PREMIOS",
                desc: "Acumula puntos, sube en el ranking y gana premios al final de la fase de grupos y eliminatorias.",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ),
              },
            ].map((step, i) => (
              <RevealOnScroll key={i} delay={i * 0.15}>
                <div className="group relative p-8 md:p-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm hover:border-white/40 transition-all duration-500 cursor-pointer h-full flex flex-col">
                  <div className="absolute top-6 right-6 text-5xl font-black text-white/[0.05]">{step.num}</div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-6 group-hover:bg-white/30 transition-colors duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 tracking-wide">{step.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed flex-1">{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PREMIOS ========== */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto relative z-10">
          <RevealOnScroll>
            <div className="text-center mb-16 md:mb-20">
              <span className="text-red-atlantida text-xs font-bold tracking-[0.2em] uppercase">Premios por ranking</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 text-red-atlantida uppercase">
                Gana premios<br />increíbles
              </h2>
              <p className="text-gray-600 mt-4 max-w-lg mx-auto">
                Los mejores del ranking ganan al final de cada fase.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              { phase: "Fase de Grupos", prize: "Gift Card $500", desc: "1er lugar del ranking y más premios para el Top 10", img: "/images/premio-gift-card.png" },
              { phase: "Fase Eliminatoria", prize: "TV 60\" + Gift Card $100", desc: "1er lugar del ranking y más premios para el Top 15", img: "/images/premio-tv.png" },
            ].map((item, i) => (
              <RevealOnScroll key={i} delay={i * 0.15}>
                <div className="group relative rounded-2xl bg-gray-50 border border-gray-200 hover:border-red-atlantida/30 transition-all duration-500 text-center cursor-pointer overflow-hidden">
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.prize}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <p className="text-gray-400 text-xs font-bold tracking-[0.15em] uppercase mb-2">{item.phase}</p>
                    <p className="text-gray-900 font-black text-lg">{item.prize}</p>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PATROCINADO POR ========== */}
      <section className="relative py-8 md:py-12 px-4 md:px-6 bg-[#D9272E] overflow-hidden">
        {/* Background image with parallax + multiply blend */}
        <ParallaxBg src="/images/bg-sponsors.png" blend="multiply" className="opacity-70" />

        <StaggerLogos />
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        <ParallaxBg src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-demuestra.jpg" overlay="bg-black/50" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <RevealOnScroll>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight uppercase">
              Demuestra que<br />
              <span className="text-white">eres el mejor</span>
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-10 max-w-md mx-auto">
              Predice los partidos de la fiesta mundialista y gana fabulosos premios.
            </p>
            <Link
              href="/registro"
              className="group relative inline-flex px-12 py-5 bg-red-atlantida text-white font-bold text-base tracking-[0.15em] uppercase rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(217,39,46,0.5)] cursor-pointer"
            >
              <span className="relative z-10">REGISTRARSE GRATIS</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-atlantida to-red-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 px-6 bg-red-atlantida">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Image
                src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/logo-atlantida-icon.png"
                alt="Banco Atlantida"
                width={36}
                height={36}
              />
              <div>
                <p className="text-white font-bold text-sm">Pasaporte 2026</p>
                <p className="text-white/60 text-xs">Presentado por Grupo Financiero Atlántida</p>
              </div>
            </div>

            <Link
              href="/login"
              className="px-8 py-3 bg-white text-red-atlantida font-bold text-sm tracking-[0.15em] uppercase rounded-lg hover:bg-white/90 transition-all duration-300 cursor-pointer"
            >
              INGRESAR
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <Link href="/bases-del-concurso" className="text-white/80 text-xs font-bold hover:text-white transition-colors underline underline-offset-2">
              Bases del Concurso
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20 text-center space-y-2">
            <p className="text-white/60 text-xs">2026 Pasaporte Mundial 2026. Todos los derechos reservados.</p>
            <p className="text-white/40 text-[10px] leading-relaxed max-w-lg mx-auto">Pasaporte Mundial 2026 es una publicación editorial independiente, no afiliada ni patrocinada por la FIFA, ni por la Copa Mundial oficial.</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-white/40 text-[10px]">Desarrollado por</span>
              <a href="https://studio.dreamtide.co" target="_blank" rel="noopener noreferrer" className="text-white/70 text-[10px] font-bold hover:text-white transition-colors">studio.dreamtide.co</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

function StickyHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "bg-red-atlantida/95 backdrop-blur-xl shadow-lg"
            : "bg-red-atlantida"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Left: Logo Grupo Financiero Atlántida */}
          <Link href="/" className="flex items-center cursor-pointer">
            <Image
              src="/images/logo-grupo-atlantida.png"
              alt="Grupo Financiero Atlantida"
              width={300}
              height={60}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Right: Nav */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-white/80 text-sm font-medium hover:text-white transition-colors cursor-pointer hidden sm:block"
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="px-5 py-2 border border-white/40 text-white text-sm font-bold rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              Registro
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

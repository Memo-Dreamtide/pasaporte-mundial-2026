"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div style={{ backgroundColor: "#051119" }}>

      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background with parallax */}
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.4}px)` }}>
          <Image
            src="/images/bg-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(5,17,25,0.3) 0%, rgba(5,17,25,0.6) 50%, rgba(5,17,25,0.95) 100%)"
          }} />
        </div>

        {/* Player Left - parallax slower */}
        <div
          className="absolute top-4 left-0 w-[45%] max-w-[220px] md:top-auto md:bottom-0 md:w-[45%] md:max-w-[550px] z-10 pointer-events-none opacity-60 md:opacity-100"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
        >
          <Image
            src="/images/player-left.png"
            alt=""
            width={800}
            height={1000}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Player Right - parallax faster */}
        <div
          className="absolute bottom-0 right-0 w-[40%] max-w-[480px] z-10 pointer-events-none hidden md:block"
          style={{ transform: `translateY(${scrollY * -0.25}px)` }}
        >
          <Image
            src="/images/player-right.png"
            alt=""
            width={800}
            height={1000}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Copa - parallax upward */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="mb-4" style={{
            animation: "float 3s ease-in-out infinite",
            transform: `translateY(${scrollY * -0.3}px)`
          }}>
            <Image
              src="/images/copa.png"
              alt="Trofeo"
              width={120}
              height={160}
              className="drop-shadow-[0_0_30px_rgba(255,215,13,0.4)]"
              priority
            />
          </div>

          {/* Countries Badge */}
          <div
            className="flex items-center gap-2 mb-6 px-5 py-2 rounded-full border border-white/20 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(5,17,25,0.6)", transform: `translateY(${scrollY * -0.2}px)` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f10a3c" }} />
            <span className="text-white/80 text-xs md:text-sm font-medium tracking-wider">MÉXICO</span>
            <span className="text-white/40">|</span>
            <span className="text-xs md:text-sm font-bold tracking-wider" style={{ color: "#458fff" }}>ESTADOS UNIDOS</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80 text-xs md:text-sm font-medium tracking-wider">CANADÁ</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f10a3c" }} />
          </div>

          {/* Title with parallax */}
          <h1 className="mb-2" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
            <span className="block text-5xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_2px_20px_rgba(69,143,255,0.3)]">PASAPORTE</span>
            <span className="block text-5xl md:text-8xl font-black tracking-tight drop-shadow-[0_2px_20px_rgba(255,215,13,0.3)]" style={{ color: "#ffd70d" }}>MUNDIAL</span>
          </h1>

          <p className="text-3xl md:text-5xl font-light text-white/60 mb-6 tracking-widest" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>2026</p>
          <p className="text-white/70 text-base md:text-xl mb-10 max-w-md" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
            Pronostica, acumula puntos y gana premios
          </p>

          <Link
            href="/login"
            className="px-12 py-4 rounded-full font-bold text-lg tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(42,193,5,0.4)]"
            style={{ backgroundColor: "#2ac105", color: "#051119" }}
          >
            INICIO
          </Link>

          <p className="mt-5 text-white/40 text-sm">
            No tienes sesión,{" "}
            <Link href="/registro" className="underline hover:text-white/70 transition-colors" style={{ color: "#ffd70d" }}>
              regístrate aquí
            </Link>
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animation: "bounce 2s infinite", opacity: Math.max(0, 1 - scrollY / 200) }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/30">
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ========== BANNER SPONSOR PLATINO 1200x400 ========== */}
      <section className="px-4 py-8 md:py-12" style={{ transform: `translateY(${Math.max(0, (scrollY - 400) * -0.05)}px)` }}>
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-white/10" style={{ backgroundColor: "rgba(69,143,255,0.05)" }}>
            <div className="flex items-center justify-center h-[180px] md:h-[300px]">
              <div className="text-center">
                <p className="text-white/20 text-xs tracking-widest uppercase mb-2">Sponsor Principal</p>
                <p className="text-white/10 text-2xl md:text-4xl font-black tracking-wider">TU MARCA AQUÍ</p>
                <p className="text-white/15 text-xs mt-2">1200 x 400 px</p>
              </div>
            </div>
            <div className="absolute top-3 right-3">
              <span className="text-white/10 text-[10px] uppercase tracking-widest">Platino</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CÓMO FUNCIONA ========== */}
      <section className="px-4 py-12 md:py-20 relative overflow-hidden">
        {/* Parallax background accent */}
        <div
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ backgroundColor: "#458fff", transform: `translateY(${Math.max(0, (scrollY - 800) * 0.15)}px)` }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full opacity-[0.03]"
          style={{ backgroundColor: "#ffd70d", transform: `translateY(${Math.max(0, (scrollY - 800) * -0.1)}px)` }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-4">
            CÓMO <span style={{ color: "#ffd70d" }}>FUNCIONA</span>
          </h2>
          <p className="text-white/40 text-center mb-12 max-w-lg mx-auto">
            Tres pasos simples para convertirte en el mejor predictor de El Salvador
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Regístrate", desc: "Crea tu cuenta gratis con Google o email en segundos", color: "#458fff" },
              { num: "2", title: "Pronostica", desc: "Predice los marcadores de los 104 partidos y gana puntos", color: "#ffd70d" },
              { num: "3", title: "Gana Premios", desc: "Los Top 5 ganan premios y cada semana hay sorteos para todos", color: "#2ac105" },
            ].map((step, i) => (
              <div
                key={step.num}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-white/20 transition-all duration-500 hover:translate-y-[-4px]"
                style={{ transform: `translateY(${Math.max(0, (scrollY - 900 - i * 100) * -0.04)}px)` }}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: `${step.color}15`, color: step.color }}
                >
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BANNER SECUNDARIO 1200x250 ========== */}
      <section className="px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="relative overflow-hidden rounded-xl border border-white/10"
            style={{ backgroundColor: "rgba(255,215,13,0.03)", transform: `translateY(${Math.max(0, (scrollY - 1400) * -0.04)}px)` }}
          >
            <div className="flex items-center justify-center h-[120px] md:h-[200px]">
              <div className="text-center">
                <p className="text-white/10 text-xl md:text-2xl font-black tracking-wider">ESPACIO PUBLICITARIO</p>
                <p className="text-white/10 text-xs mt-1">1200 x 250 px</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SPONSORS GRID ========== */}
      <section className="px-4 py-12 md:py-20 relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.02]"
          style={{ backgroundColor: "#ffd70d", transform: `translateY(${Math.max(0, (scrollY - 1600) * 0.1)}px)` }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-center text-white mb-2">
            NUESTROS <span style={{ color: "#458fff" }}>SPONSORS</span>
          </h2>
          <p className="text-white/30 text-center mb-10 text-sm">Marcas que hacen posible Pasaporte Mundial</p>

          {/* Platino */}
          <div className="mb-8">
            <p className="text-center text-xs tracking-widest uppercase mb-4" style={{ color: "#ffd70d" }}>Platino</p>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={`p-${i}`}
                  className="bg-white/5 border border-white/10 rounded-xl h-20 md:h-24 flex items-center justify-center hover:border-white/20 transition-all duration-300 hover:translate-y-[-2px]"
                  style={{ transform: `translateY(${Math.max(0, (scrollY - 1800 - i * 50) * -0.03)}px)` }}
                >
                  <span className="text-white/10 text-xs font-bold">LOGO</span>
                </div>
              ))}
            </div>
          </div>

          {/* Oro */}
          <div className="mb-8">
            <p className="text-center text-xs tracking-widest uppercase mb-4" style={{ color: "#458fff" }}>Oro</p>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`o-${i}`}
                  className="bg-white/5 border border-white/10 rounded-xl h-16 md:h-20 flex items-center justify-center hover:border-white/20 transition-all duration-300 hover:translate-y-[-2px]"
                  style={{ transform: `translateY(${Math.max(0, (scrollY - 1900 - i * 50) * -0.03)}px)` }}
                >
                  <span className="text-white/10 text-xs font-bold">LOGO</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plata */}
          <div>
            <p className="text-center text-xs tracking-widest uppercase mb-4 text-white/30">Plata</p>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={`s-${i}`}
                  className="bg-white/5 border border-white/10 rounded-lg h-14 md:h-16 flex items-center justify-center hover:border-white/20 transition-all duration-300 hover:translate-y-[-2px]"
                  style={{ transform: `translateY(${Math.max(0, (scrollY - 2000 - i * 30) * -0.03)}px)` }}
                >
                  <span className="text-white/10 text-[10px] font-bold">LOGO</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="px-4 py-16 md:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(circle at 50% 50%, #2ac105, transparent 70%)`,
            transform: `scale(${1 + Math.max(0, (scrollY - 2200) * 0.0003)})`
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            DEMUESTRA QUE ERES EL <span style={{ color: "#ffd70d" }}>MEJOR</span>
          </h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Únete a miles de salvadoreños que competirán por ser el predictor número uno del país
          </p>
          <Link
            href="/registro"
            className="inline-block px-12 py-4 rounded-full font-bold text-lg tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(42,193,5,0.4)]"
            style={{ backgroundColor: "#2ac105", color: "#051119" }}
          >
            REGISTRARSE GRATIS
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="px-4 py-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
          <Image src="/images/logo.png" alt="Pasaporte Mundial" width={40} height={40} />
          <span className="text-white/40 text-sm font-medium">Pasaporte Mundial 2026</span>
        </div>
      </footer>

      {/* Global keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-8px); }
          60% { transform: translateX(-50%) translateY(-4px); }
        }
      `}} />
    </div>
  )
}

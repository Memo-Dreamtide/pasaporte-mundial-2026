"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError("Error al enviar el enlace. Verifica tu email e intenta de nuevo.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 bg-bg-base">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/95" />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl p-10 border border-white/10 backdrop-blur-sm bg-black/60">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "rgba(217,39,46,0.15)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="#D9272E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">REVISA TU EMAIL</h2>
            <p className="text-white/50 text-sm mb-2">
              Te enviamos un enlace para restablecer tu contraseña a
            </p>
            <p className="font-bold text-sm mb-6 text-red-atlantida">{email}</p>
            <p className="text-white/30 text-xs">Si no lo encuentras, revisa tu carpeta de spam</p>
            <Link
              href="/login"
              className="inline-block mt-8 text-sm font-bold hover:opacity-80 transition-opacity text-red-atlantida"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 bg-bg-base">
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/95" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <Image
              src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/logo-atlantida-icon.png"
              alt="Banco Atlantida"
              width={48}
              height={48}
            />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">RECUPERAR CONTRASEÑA</h1>
          <p className="text-white/40 text-sm mt-1">Te enviaremos un enlace a tu email</p>
        </div>

        <div className="rounded-2xl p-8 border border-white/10 backdrop-blur-sm bg-black/60">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email registrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-red-atlantida/50 transition-colors text-sm"
                style={{ caretColor: "#D9272E" }}
              />
            </div>

            {error && (
              <p className="text-sm text-center py-2 rounded-lg text-red-atlantida" style={{ backgroundColor: "rgba(217,39,46,0.1)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 bg-red-atlantida text-white cursor-pointer hover:shadow-[0_0_30px_rgba(217,39,46,0.4)]"
            >
              {loading ? "Enviando..." : "ENVIAR ENLACE"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          <Link href="/login" className="font-bold hover:opacity-80 transition-opacity text-red-atlantida">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  )
}

"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase automatically handles the token from the URL hash
    // We just need to verify a session exists
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Listen for auth state change (token exchange happens async)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") {
            setChecking(false)
          }
        })

        // Give it a moment, then check again
        setTimeout(async () => {
          const { data: { session: s } } = await supabase.auth.getSession()
          if (s) {
            setChecking(false)
          } else {
            setChecking(false)
            setError("El enlace ha expirado o no es válido. Solicita uno nuevo.")
          }
          subscription.unsubscribe()
        }, 3000)
      } else {
        setChecking(false)
      }
    }
    checkSession()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError("Error al actualizar la contraseña. Intenta de nuevo.")
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-atlantida border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Verificando enlace...</p>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 bg-bg-base">
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30">
            <source src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/bg-hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/95" />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl p-10 border border-white/10 backdrop-blur-sm bg-black/60">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "rgba(217,39,46,0.15)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="#D9272E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">CONTRASEÑA ACTUALIZADA</h2>
            <p className="text-white/50 text-sm mb-6">
              Tu contraseña ha sido cambiada exitosamente
            </p>
            <Link
              href="/dashboard"
              className="inline-block w-full py-3.5 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 hover:scale-[1.02] bg-red-atlantida text-white hover:shadow-[0_0_30px_rgba(217,39,46,0.4)]"
            >
              IR AL DASHBOARD
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 bg-bg-base">
      <div className="absolute inset-0">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30">
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
          <h1 className="text-2xl font-black text-white tracking-tight">NUEVA CONTRASEÑA</h1>
          <p className="text-white/40 text-sm mt-1">Ingresa tu nueva contraseña</p>
        </div>

        <div className="rounded-2xl p-8 border border-white/10 backdrop-blur-sm bg-black/60">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-red-atlantida/50 transition-colors text-sm"
                style={{ caretColor: "#D9272E" }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Actualizando..." : "CAMBIAR CONTRASEÑA"}
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

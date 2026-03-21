"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function RegistroPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError("Error al conectar con Google")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4" style={{ backgroundColor: "#051119" }}>
        <div className="absolute inset-0">
          <Image src="/images/bg-hero.jpg" alt="" fill className="object-cover opacity-30" priority />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(circle at 50% 30%, rgba(42,193,5,0.08) 0%, transparent 60%), linear-gradient(to bottom, rgba(5,17,25,0.7) 0%, rgba(5,17,25,0.95) 100%)"
          }} />
        </div>
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl p-10 border border-white/10 backdrop-blur-sm" style={{ backgroundColor: "rgba(5,17,25,0.8)" }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: "rgba(42,193,5,0.15)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="#2ac105" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3">REVISA TU EMAIL</h2>
            <p className="text-white/50 text-sm mb-2">
              Te enviamos un enlace de confirmación a
            </p>
            <p className="font-bold text-sm mb-6" style={{ color: "#458fff" }}>{email}</p>
            <p className="text-white/30 text-xs">Haz clic en el enlace para activar tu cuenta</p>
            <Link
              href="/login"
              className="inline-block mt-8 text-sm font-bold hover:opacity-80 transition-opacity"
              style={{ color: "#ffd70d" }}
            >
              Ir al login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4" style={{ backgroundColor: "#051119" }}>
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/bg-hero.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 50% 30%, rgba(255,215,13,0.06) 0%, transparent 60%), linear-gradient(to bottom, rgba(5,17,25,0.7) 0%, rgba(5,17,25,0.95) 100%)"
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src="/images/logo.png" alt="Pasaporte Mundial" width={80} height={80} />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">CREAR CUENTA</h1>
          <p className="text-white/40 text-sm mt-1">Únete a Pasaporte Mundial 2026</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border border-white/10 backdrop-blur-sm" style={{ backgroundColor: "rgba(5,17,25,0.8)" }}>
          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-800 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/30 text-xs tracking-wider uppercase">o con email</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
                style={{ caretColor: "#ffd70d" }}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
                style={{ caretColor: "#ffd70d" }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
                style={{ caretColor: "#ffd70d" }}
              />
            </div>

            {error && (
              <p className="text-sm text-center py-2 rounded-lg" style={{ color: "#f10a3c", backgroundColor: "rgba(241,10,60,0.1)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: "#ffd70d", color: "#051119" }}
            >
              {loading ? "Creando cuenta..." : "CREAR CUENTA GRATIS"}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-white/30 text-sm mt-6">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-bold hover:opacity-80 transition-opacity" style={{ color: "#458fff" }}>
            Inicia sesión
          </Link>
        </p>

        {/* Back home */}
        <p className="text-center mt-4">
          <Link href="/" className="text-white/20 text-xs hover:text-white/40 transition-colors">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  )
}

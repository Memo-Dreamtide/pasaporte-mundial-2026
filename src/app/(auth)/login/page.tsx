"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Email o contraseña incorrectos")
      setLoading(false)
      return
    }

    router.push("/dashboard")
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
          background: "radial-gradient(circle at 50% 30%, rgba(69,143,255,0.08) 0%, transparent 60%), linear-gradient(to bottom, rgba(5,17,25,0.7) 0%, rgba(5,17,25,0.95) 100%)"
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src="/images/logo.png" alt="Pasaporte Mundial" width={80} height={80} />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">INICIAR SESIÓN</h1>
          <p className="text-white/40 text-sm mt-1">Pasaporte Mundial 2026</p>
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
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/30 text-xs tracking-wider uppercase">o con email</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                style={{ caretColor: "#458fff" }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                style={{ caretColor: "#458fff" }}
              />
            </div>

            {error && (
              <p className="text-sm text-center py-2 rounded-lg" style={{ color: "#f10a3c", backgroundColor: "rgba(241,10,60,0.1)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: "#2ac105", color: "#051119" }}
            >
              {loading ? "Ingresando..." : "INICIAR SESIÓN"}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-white/30 text-sm mt-6">
          No tienes cuenta?{" "}
          <Link href="/registro" className="font-bold hover:opacity-80 transition-opacity" style={{ color: "#ffd70d" }}>
            Regístrate gratis
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

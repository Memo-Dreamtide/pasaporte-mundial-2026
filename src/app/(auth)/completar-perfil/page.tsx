"use client"

import { createClient } from "@/lib/supabase-browser"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CompletarPerfilPage() {
  const [dui, setDui] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [userName, setUserName] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // If user already has DUI, redirect to dashboard
      const { data: profile } = await supabase
        .from("profiles")
        .select("dui, full_name")
        .eq("id", user.id)
        .single()

      if (profile?.dui) {
        router.push("/dashboard")
        return
      }

      setUserName(profile?.full_name || user.user_metadata?.full_name || "")
      setChecking(false)
    }
    checkProfile()
  }, [])

  const handleDuiChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9)
    if (digits.length > 8) {
      setDui(`${digits.slice(0, 8)}-${digits.slice(8)}`)
    } else {
      setDui(digits)
    }
  }

  const isOver18 = (dateStr: string): boolean => {
    if (!dateStr) return false
    const birth = new Date(dateStr)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 18
  }

  const isValidDui = (value: string): boolean => {
    return /^\d{8}-\d$/.test(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!isValidDui(dui)) {
      setError("Ingresa un DUI valido (formato: 00000000-0)")
      setLoading(false)
      return
    }

    if (!isOver18(birthDate)) {
      setError("Debes ser mayor de 18 anos para participar")
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    // Check if DUI is already registered
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("dui", dui)
      .neq("id", user.id)
      .single()

    if (existingProfile) {
      setError("Este DUI ya esta registrado en otra cuenta")
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        dui: dui,
        birth_date: birthDate,
      })
      .eq("id", user.id)

    if (updateError) {
      setError("Error al guardar. Intenta de nuevo.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="w-8 h-8 border-2 border-red-atlantida border-t-transparent rounded-full animate-spin" />
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
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/logo-atlantida-icon.png"
              alt="Banco Atlantida"
              width={48}
              height={48}
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">COMPLETA TU PERFIL</h1>
          <p className="text-white/40 text-sm mt-1">
            {userName ? `Hola ${userName.split(" ")[0]}, solo necesitamos unos datos mas` : "Solo necesitamos unos datos mas"}
          </p>
        </div>

        <div className="rounded-2xl p-8 border border-white/10 backdrop-blur-sm bg-black/60">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DUI (00000000-0)"
                value={dui}
                onChange={(e) => handleDuiChange(e.target.value)}
                required
                maxLength={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-red-atlantida/50 transition-colors text-sm"
                style={{ caretColor: "#D9272E" }}
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5 ml-1">Fecha de nacimiento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-red-atlantida/50 transition-colors text-sm [color-scheme:dark]"
                style={{ caretColor: "#D9272E" }}
              />
            </div>

            <p className="text-white/30 text-xs text-center py-1">
              Debes ser mayor de 18 anos y contar con DUI vigente para participar
            </p>

            {error && (
              <p className="text-sm text-center py-2 rounded-lg text-red-atlantida" style={{ backgroundColor: "rgba(217,39,46,0.1)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 bg-red-atlantida text-white cursor-pointer hover:shadow-[0_0_30px_rgba(217,39,46,0.4)]"
            >
              {loading ? "Guardando..." : "CONTINUAR"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

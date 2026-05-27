"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 hover:scale-[1.01] border cursor-pointer disabled:opacity-50"
      style={{ backgroundColor: "rgba(241,10,60,0.08)", borderColor: "rgba(241,10,60,0.2)", color: "#f10a3c" }}
    >
      {loading ? "Cerrando..." : "CERRAR SESIÓN"}
    </button>
  )
}

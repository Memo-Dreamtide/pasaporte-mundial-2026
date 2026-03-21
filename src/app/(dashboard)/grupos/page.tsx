import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Image from "next/image"
import GruposGrid from "@/components/partidos/GruposGrid"

export default async function GruposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("group_letter", { ascending: true })
    .order("name", { ascending: true })

  return (
    <div>
      <header className="px-4 py-4 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Image src="/images/logo.png" alt="PM" width={32} height={32} />
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">GRUPOS</h1>
            <p className="text-white/30 text-xs">48 selecciones en 12 grupos</p>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <GruposGrid teams={teams || []} />
      </div>
    </div>
  )
}

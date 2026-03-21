import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
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
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Grupos</h1>
            <p className="text-gray-400">48 selecciones en 12 grupos</p>
          </div>
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
            Dashboard
          </a>
        </div>
        <GruposGrid teams={teams || []} />
      </div>
    </main>
  )
}

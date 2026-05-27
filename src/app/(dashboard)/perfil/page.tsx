import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import SignOutButton from "./SignOutButton"

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("es-SV", { year: "numeric", month: "short" })
    : "-"

  const stats = [
    { label: "Puntos totales", value: profile?.total_points || 0, color: "#ffd70d" },
    { label: "Ranking", value: `#${profile?.rank_position || "-"}`, color: "#458fff" },
    { label: "Pronósticos", value: profile?.predictions_count || 0, color: "#ffffff" },
    { label: "Exactos", value: profile?.exact_scores || 0, color: "#2ac105" },
    { label: "Racha actual", value: profile?.streak || 0, color: "#f10a3c" },
    { label: "Miembro desde", value: memberSince, color: "#ffffff" },
  ]

  const links = [
    { href: "/pronosticos", title: "Mis Pronósticos", desc: "Ver y editar tus pronósticos" },
    { href: "/ranking", title: "Ranking", desc: "Ver tu posición nacional" },
    { href: "/premios", title: "Premios", desc: "Ver premios disponibles" },
    { href: "/grupos", title: "Grupos", desc: "Ver los 12 grupos" },
  ]

  return (
    <div>
      <header className="px-4 py-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Image src="/images/logo.png" alt="PM" width={32} height={32} />
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">MI PERFIL</h1>
            <p className="text-white/30 text-xs">Tu información</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-xl p-6 border border-white/5 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border border-white/10"
              style={{ backgroundColor: "rgba(255,215,13,0.1)", color: "#ffd70d" }}
            >
              {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{profile?.full_name || "Sin nombre"}</h2>
              <p className="text-white/30 text-sm">{profile?.email}</p>
              {profile?.department && (
                <p className="text-white/20 text-xs mt-1">{profile.department}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg p-3 border border-white/5"
                style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              >
                <p className="text-white/25 text-xs mb-1">{stat.label}</p>
                <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <p className="font-bold text-white text-sm">{link.title}</p>
              <p className="text-white/25 text-xs">{link.desc}</p>
            </Link>
          ))}
        </div>

        <SignOutButton />
      </div>
    </div>
  )
}

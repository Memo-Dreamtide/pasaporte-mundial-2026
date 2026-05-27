import Link from "next/link"
import Image from "next/image"

export default function CreditosPage() {
  const equipo = [
    { rol: "Director", nombre: "Mauricio Galarza" },
    { rol: "Coordinación editorial", nombre: "Diana Espinosa" },
    { rol: "Desarrollo", nombre: "Memo Ortiz" },
    { rol: "Redacción", nombre: "Eduardo Aguilar" },
    { rol: "Diseño", nombre: "Rocío Rivera" },
  ]

  return (
    <main className="min-h-screen bg-[#0A0A0B] flex flex-col relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/bg-creditos.jpg"
          alt=""
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/80 via-[#0A0A0B]/85 to-[#0A0A0B]/90" />
      </div>

      <header className="px-6 py-5 border-b border-white/10 relative z-10 bg-red-atlantida">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-grupo-atlantida.png"
              alt="Grupo Financiero Atlántida"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <Link href="/" className="text-white text-sm font-bold hover:text-white/80 transition-colors">
            Volver
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-lg w-full text-center">
          <p className="text-red-atlantida text-xs font-bold tracking-[0.2em] uppercase mb-3">Pasaporte Mundial 2026</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-3">
            Créditos
          </h1>
          <p className="text-white/30 text-sm mb-12">Edición Premium</p>

          <div className="rounded-2xl border border-white/5 p-8 mb-8" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Publicación especial desarrollada para el Grupo Financiero Atlántida, bajo concepto y dirección estratégica de <span className="text-white font-bold">Diana Espinosa</span>, Consultora Internacional S.A.S., S.A de C.V.
            </p>

            <div className="space-y-0">
              {equipo.map((member, i) => (
                <div
                  key={member.nombre}
                  className={`flex items-center justify-between py-4 ${i !== equipo.length - 1 ? "border-b border-white/5" : ""}`}
                >
                  <span className="text-white/30 text-xs uppercase tracking-wider">{member.rol}</span>
                  <span className="text-white font-bold text-sm">{member.nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-[10px] leading-relaxed max-w-md mx-auto">
            Pasaporte Mundial 2026 es una publicación editorial independiente, no afiliada ni patrocinada por la FIFA, ni por la Copa Mundial oficial.
          </p>
        </div>
      </div>
    </main>
  )
}

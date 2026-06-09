export const metadata = {
  title: "Pasaporte 2026 — En mantenimiento",
  description: "Estamos trabajando en mejoras. Pronto estaremos de regreso.",
  robots: { index: false, follow: false },
}

export default function MantenimientoPage() {
  return (
    <main className="min-h-screen bg-red-atlantida flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle texture / atmospheric darkening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto">
        {/* Logo */}
        <img
          src="https://oyndtkrrwmsgkijbfwcs.supabase.co/storage/v1/object/public/assets/logo-pasion-mundialista.png"
          alt="Atlántida Pasión Mundialista"
          style={{
            width: "min(70vw, 360px)",
            height: "auto",
            filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.4))",
          }}
        />

        {/* Spacer */}
        <div className="h-12 md:h-16" />

        {/* Title */}
        <h1 className="text-white text-2xl md:text-3xl font-bold tracking-wide mb-4">
          Estamos trabajando en mejoras
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-base md:text-lg font-light leading-relaxed">
          Pronto estaremos de regreso.
        </p>

        {/* Small divider */}
        <div className="w-12 h-px bg-white/40 my-10" />

        {/* Brand footer */}
        <p className="text-white/60 text-xs tracking-[0.2em] uppercase font-semibold">
          Pasaporte 2026
        </p>
        <p className="text-white/40 text-[10px] tracking-[0.15em] uppercase mt-1">
          Presentado por Grupo Financiero Atlántida
        </p>
      </div>
    </main>
  )
}

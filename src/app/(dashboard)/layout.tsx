import Link from "next/link"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen pb-20" style={{ backgroundColor: "#051119" }}>
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/bg-internal.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.15]"
          priority
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(5,17,25,0.4) 0%, rgba(5,17,25,0.75) 40%, rgba(5,17,25,0.92) 100%)"
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl" style={{ backgroundColor: "rgba(5,17,25,0.95)", borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-around py-2.5 px-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 px-3 py-1 group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40 group-hover:text-white/80 transition-colors">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-white/30 font-semibold group-hover:text-white/60 transition-colors">Inicio</span>
          </Link>
          <Link href="/pronosticos" className="flex flex-col items-center gap-1 px-3 py-1 group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40 group-hover:text-white/80 transition-colors">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-white/30 font-semibold group-hover:text-white/60 transition-colors">Pronósticos</span>
          </Link>
          <Link href="/partidos" className="flex flex-col items-center gap-1 px-3 py-1 group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40 group-hover:text-white/80 transition-colors">
              <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-white/30 font-semibold group-hover:text-white/60 transition-colors">Partidos</span>
          </Link>
          <Link href="/ranking" className="flex flex-col items-center gap-1 px-3 py-1 group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40 group-hover:text-white/80 transition-colors">
              <path d="M8 21V11M16 21V7M12 21V3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-white/30 font-semibold group-hover:text-white/60 transition-colors">Ranking</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center gap-1 px-3 py-1 group">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40 group-hover:text-white/80 transition-colors">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] text-white/30 font-semibold group-hover:text-white/60 transition-colors">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

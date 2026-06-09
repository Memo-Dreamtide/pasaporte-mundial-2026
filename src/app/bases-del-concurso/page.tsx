import Link from "next/link"
import Image from "next/image"

export default function BasesDelConcursoPage() {
  const premiosGrupos = [
    { lugar: 1, premio: "Gift Card Supermercado", monto: "$500.00" },
    { lugar: 2, premio: "Gift Card Supermercado", monto: "$300.00" },
    { lugar: 3, premio: "Gift Card Supermercado", monto: "$250.00" },
    { lugar: 4, premio: "Gift Card Supermercado", monto: "$200.00" },
    { lugar: 5, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 6, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 7, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 8, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 9, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 10, premio: "Gift Card Supermercado", monto: "$100.00" },
  ]

  const premiosEliminatoria = [
    { lugar: 1, premio: "TV 60\" + Gift Card de $100.00", monto: "$700.00" },
    { lugar: 2, premio: "TV 50\" + Gift Card de $100.00", monto: "$500.00" },
    { lugar: 3, premio: "TV 45\" + Gift Card de $100.00", monto: "$400.00" },
    { lugar: 4, premio: "Gift Card Supermercado", monto: "$250.00" },
    { lugar: 5, premio: "Gift Card Supermercado", monto: "$250.00" },
    { lugar: 6, premio: "Gift Card Supermercado", monto: "$150.00" },
    { lugar: 7, premio: "Gift Card Supermercado", monto: "$150.00" },
    { lugar: 8, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 9, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 10, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 11, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 12, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 13, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 14, premio: "Gift Card Supermercado", monto: "$100.00" },
    { lugar: 15, premio: "Gift Card Supermercado", monto: "$100.00" },
  ]

  const sections = [
    {
      id: "A",
      title: "Personas participantes",
      content: "Esta promoción está dirigida a personas físicas mayores de 18 años, que residan en el territorio de El Salvador, cuenten con un documento de identidad válido, vigente y reconocido por el Gobierno de El Salvador.",
    },
    {
      id: "B",
      title: "Vigencia de la actividad promocional",
      content: "La promoción estará vigente por un periodo de +1 mes, iniciando el jueves 11 de junio de 2026 y finalizando el domingo 19 de julio de 2026. La fecha última que tiene el cliente para participar en la promoción: Hasta las 12:00 m del día 19 de julio de 2026.",
    },
    {
      id: "C",
      title: "De los participantes",
      content: "Podrán participar en la presente promoción aquellas personas que residan legalmente en la República de El Salvador, que sean mayores de dieciocho (18) años de edad cumplidos al momento de su participación en la promoción, y que cuenten con Documento Único Identidad (DUI) vigente o Carnet de Residente vigente (esto último aplica únicamente en el caso de ser extranjeros residentes en El Salvador), y que cumplan con los requisitos establecidos en el presente reglamento.",
    },
    {
      id: "D",
      title: "Forma de participar",
      content: "Las personas interesadas, podrán hacerlo al participar en las dinámicas de cada una de las empresas del grupo participantes, allí recibirás gratis el Pasaporte. A continuación, escanea el código QR impreso que aparece en la portada del Pasaporte 2026 o ingresa a www.pasaporte2026.com y completa los datos personales que te solicitan: Nombre y apellido, Tipo de Documento de Identidad Personal: DUI o Carnet de Residente, Número, Correo electrónico y Número de teléfono. Empieza participando en el juego de pronósticos de los partidos: adivinando el resultado final (ganador). Ya estás participando para ganarte los premios.",
    },
  ]

  const puntuacion = [
    { criterio: "Marcador exacto", puntos: "10 puntos", desc: "por acertar el resultado exacto del partido al final del tiempo regular más tiempo añadido (120 min en eliminatorias)" },
    { criterio: "Ganador correcto", puntos: "4 puntos", desc: "por acertar el equipo ganador o el empate, sin acertar el marcador" },
    { criterio: "Diferencia de goles", puntos: "3 puntos", desc: "por acertar la diferencia de goles entre ambos equipos" },
    { criterio: "Ganador en penales", puntos: "+5 puntos", desc: "bono en eliminatorias: si el partido termina empate y vas a penales, +5 puntos si acertás el equipo que gana la tanda" },
  ]

  const multiplicadores = [
    { fase: "Fase de grupos", valor: "x1.0" },
    { fase: "Dieciseisavos", valor: "x1.25" },
    { fase: "Octavos de final", valor: "x1.5" },
    { fase: "Cuartos de final", valor: "x2.0" },
    { fase: "Semifinales", valor: "x2.5" },
    { fase: "Final", valor: "x3.0" },
  ]

  return (
    <main className="min-h-screen bg-[#0A0A0B] relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/bg-internal.jpg"
          alt=""
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/80 via-[#0A0A0B]/85 to-[#0A0A0B]/90" />
      </div>
      <header className="px-6 py-5 border-b border-white/10 sticky top-0 z-50 bg-red-atlantida">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 relative z-10">
        {/* Título */}
        <div className="text-center mb-12">
          <p className="text-red-atlantida text-xs font-bold tracking-[0.2em] uppercase mb-3">Pasaporte 2026</p>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-3">
            Bases del Concurso
          </h1>
          <p className="text-white/30 text-sm">Atlántida Pasión Mundialista</p>
        </div>

        {/* Intro */}
        <div className="rounded-2xl border border-white/5 p-6 md:p-8 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
          <p className="text-white/60 text-sm leading-relaxed">
            Este reglamento establece las condiciones de la promoción interna corporativa, y tiene como objetivo premiar a los participantes del Pasaporte 2026 | Atlántida Pasión Mundialista entregados por las empresas participantes del Grupo Financiero Atlántida: Banco Atlántida El Salvador, S.A., AFP Confía, S.A., Atlántida Capital, S.A. DE C.V., Atlántida Securities, S.A de C.V., Seguros Atlántida, S.A., Leasing Atlántida, Atlántida Titulizadora, Fundación Atlántida.
          </p>
        </div>

        {/* Secciones A-D */}
        <div className="space-y-4 mb-6">
          {sections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-white/5 p-6 md:p-8" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-red-atlantida/10 text-red-atlantida">
                  {section.id}
                </span>
                <div>
                  <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-3">{section.title}</h2>
                  <p className="text-white/50 text-sm leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* E. Premios */}
        <div className="rounded-2xl border border-white/5 p-6 md:p-8 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-start gap-4 mb-6">
            <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-red-atlantida/10 text-red-atlantida">
              E
            </span>
            <div>
              <h2 className="text-white font-bold text-sm uppercase tracking-wide">Premios</h2>
              <p className="text-white/40 text-xs mt-1">La promoción otorgará premios en dos fases, de acuerdo con la posición obtenida en el ranking general.</p>
            </div>
          </div>

          {/* Fase de Grupos */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h3 className="text-white font-bold text-sm">Fase de Grupos</h3>
              <span className="text-white/25 text-xs">(11 de junio - 27 de junio de 2026)</span>
            </div>
            <p className="text-white/40 text-xs mb-4">
              Al finalizar la fase de grupos del torneo, los diez (10) participantes que ocupen las primeras posiciones del ranking general serán acreedores a un premio cada uno.
            </p>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_100px] bg-white/5 px-4 py-2.5">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Lugar</span>
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Premio</span>
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider text-right">Monto</span>
              </div>
              {premiosGrupos.map((p, i) => (
                <div key={p.lugar} className={`grid grid-cols-[60px_1fr_100px] px-4 py-3 ${i !== premiosGrupos.length - 1 ? "border-b border-white/5" : ""}`}>
                  <span className={`text-sm font-black ${p.lugar <= 3 ? "text-yellow-400" : "text-white/50"}`}>{p.lugar}</span>
                  <span className="text-white/70 text-sm">{p.premio}</span>
                  <span className="text-white font-bold text-sm text-right">{p.monto}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fase Eliminatoria */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="text-white font-bold text-sm">Fase Eliminatoria</h3>
              <span className="text-white/25 text-xs">(28 de junio - 19 de julio de 2026)</span>
            </div>
            <p className="text-white/40 text-xs mb-4">
              Al finalizar la fase eliminatoria del torneo, se premiarán los quince (15) participantes mejor posicionados en el ranking general acumulado.
            </p>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_100px] bg-white/5 px-4 py-2.5">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Lugar</span>
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">Premio</span>
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider text-right">Monto</span>
              </div>
              {premiosEliminatoria.map((p, i) => (
                <div key={p.lugar} className={`grid grid-cols-[60px_1fr_100px] px-4 py-3 ${i !== premiosEliminatoria.length - 1 ? "border-b border-white/5" : ""}`}>
                  <span className={`text-sm font-black ${p.lugar <= 3 ? "text-yellow-400" : "text-white/50"}`}>{p.lugar}</span>
                  <span className="text-white/70 text-sm">{p.premio}</span>
                  <span className="text-white font-bold text-sm text-right">{p.monto}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-white/40 text-xs leading-relaxed">
              Los premios no son transferibles, no son negociables ni canjeables por dinero en efectivo. Los ganadores serán notificados a través de la plataforma y/o por los medios de contacto proporcionados al momento del registro.
            </p>
          </div>
        </div>

        {/* F. Ranking y determinación de ganadores */}
        <div className="rounded-2xl border border-white/5 p-6 md:p-8 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-start gap-4 mb-6">
            <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-red-atlantida/10 text-red-atlantida">
              F
            </span>
            <div>
              <h2 className="text-white font-bold text-sm uppercase tracking-wide">Ranking y determinación de ganadores</h2>
              <p className="text-white/40 text-xs mt-1">Los ganadores se determinarán exclusivamente por su posición en el ranking general de la plataforma. No se realizarán sorteos aleatorios.</p>
            </div>
          </div>

          <h3 className="text-white font-bold text-sm mb-4">Sistema de puntuación</h3>
          <div className="space-y-2 mb-6">
            {puntuacion.map((p) => (
              <div key={p.criterio} className="flex items-center gap-4 rounded-xl p-3 border border-white/5" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <span className="shrink-0 text-yellow-400 font-black text-sm w-20 text-center">{p.puntos}</span>
                <div>
                  <span className="text-white text-sm font-bold">{p.criterio}</span>
                  <span className="text-white/30 text-sm"> — {p.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 border border-white/5 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
            <p className="text-white/60 text-xs leading-relaxed mb-1">
              <span className="text-white font-bold">Racha de exactos consecutivos:</span> los participantes que acierten marcadores exactos en partidos consecutivos obtendrán un multiplicador progresivo sobre sus puntos (x2, x3, hasta un máximo de x4).
            </p>
          </div>

          <h3 className="text-white font-bold text-sm mb-3">Multiplicadores por fase</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
            {multiplicadores.map((m) => (
              <div key={m.fase} className="rounded-xl p-3 border border-white/5 text-center" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{m.fase}</p>
                <p className="text-red-atlantida font-black text-lg">{m.valor}</p>
              </div>
            ))}
          </div>

          <h3 className="text-white font-bold text-sm mb-3">Criterios de desempate</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/50 text-xs font-bold">1</span>
              <p className="text-white/50 text-sm">Mayor cantidad de marcadores exactos acertados.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/50 text-xs font-bold">2</span>
              <p className="text-white/50 text-sm">Mayor cantidad de pronósticos realizados.</p>
            </div>
          </div>

          <p className="text-white/30 text-xs mt-4">
            El ranking es público y puede ser consultado en tiempo real dentro de la plataforma por todos los participantes registrados.
          </p>
        </div>

        {/* G. Consultas + Divulgación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="rounded-2xl border border-white/5 p-6" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-red-atlantida/10 text-red-atlantida">
                G
              </span>
              <div>
                <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-2">Consultas</h2>
                <p className="text-white/50 text-sm">Para mayor información contacte a su departamento de recursos humanos.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 p-6" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-red-atlantida/10 text-red-atlantida">
                H
              </span>
              <div>
                <h2 className="text-white font-bold text-sm uppercase tracking-wide mb-2">Divulgación</h2>
                <p className="text-white/50 text-sm">El presente reglamento será publicado en la plataforma de la promoción <span className="text-white font-bold">www.pasaporte2026.com</span>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center border-t border-white/5 pt-8">
          <p className="text-white/20 text-[10px] leading-relaxed max-w-lg mx-auto">
            Pasaporte 2026 es una publicación editorial independiente, no afiliada ni patrocinada por la FIFA.
          </p>
        </div>
      </div>
    </main>
  )
}

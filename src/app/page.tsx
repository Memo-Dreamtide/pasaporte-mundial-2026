import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-5xl font-bold text-white mb-4">
          Pasaporte Mundial
        </h1>
        <p className="text-xl text-green-200 mb-2">
          2026
        </p>
        <p className="text-green-300 mb-8 max-w-md mx-auto">
          Pronostica los 104 partidos, acumula puntos y gana premios.
          Demuestra que eres el mejor predictor de El Salvador.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/registro"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full transition-colors"
          >
            Registrarse Gratis
          </Link>
          <Link
            href="/login"
            className="border-2 border-white text-white hover:bg-white hover:text-green-900 font-bold py-3 px-8 rounded-full transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
        <p className="text-green-400 text-sm mt-8">
          Hecho para El Salvador — 100% Gratis
        </p>
      </div>
    </main>
  )
}

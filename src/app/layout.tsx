import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pasaporte Mundial 2026 | Pronósticos de Fútbol",
  description: "Pronostica los 104 partidos del torneo, acumula puntos y gana premios. El mejor predictor de El Salvador.",
  keywords: ["mundial", "2026", "pronósticos", "el salvador", "fútbol"],
  openGraph: {
    title: "Pasaporte Mundial 2026",
    description: "Pronostica los partidos y gana premios",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}

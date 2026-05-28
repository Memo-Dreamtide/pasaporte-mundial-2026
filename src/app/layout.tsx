import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Pasaporte 2026 | Predice. Compite. Gana.",
  description: "La plataforma de predicciones del Mundial 2026. Pronostica los 104 partidos, acumula puntos y gana premios. Presentado por Banco Atlantida.",
  keywords: ["mundial", "2026", "predicciones", "el salvador", "banco atlantida"],
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Pasaporte 2026",
  },
  openGraph: {
    title: "Pasaporte 2026",
    description: "Predice los partidos del Mundial y gana premios",
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
      <body className={`${roboto.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

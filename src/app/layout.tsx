import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pasaporte2026.com"),
  title: "Pasaporte 2026 | Predice. Compite. Gana.",
  description: "La plataforma de predicciones del Mundial 2026. Pronostica los 104 partidos, acumula puntos y gana premios. Presentado por Grupo Financiero Atlántida.",
  keywords: ["mundial", "2026", "predicciones", "el salvador", "banco atlantida", "atlantida", "pasaporte", "futbol"],
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
    title: "Pasaporte 2026 | Vive el Mundial con Atlántida",
    description: "Predice los 104 partidos del Mundial 2026, acumula puntos y gana premios. Presentado por Grupo Financiero Atlántida.",
    url: "https://www.pasaporte2026.com",
    siteName: "Pasaporte 2026",
    locale: "es_SV",
    type: "website",
    images: [
      {
        url: "/images/og-share.png",
        width: 1200,
        height: 630,
        alt: "Pasaporte 2026 — Vive el Mundial con Grupo Financiero Atlántida",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pasaporte 2026 | Vive el Mundial con Atlántida",
    description: "Predice los partidos del Mundial 2026 y gana premios.",
    images: ["/images/og-share.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${roboto.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

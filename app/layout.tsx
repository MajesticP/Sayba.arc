import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { headers } from "next/headers"
import { ogImage } from "@/lib/data"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SAYBA ARC — Konsultan IT & Engineering Pontianak",
  description:
    "SAYBA ARC adalah konsultan IT dan engineering dari Pontianak. Melayani pengembangan perangkat lunak, sistem informasi, pemetaan spasial, dan dokumen rancang bangun untuk bisnis dan instansi di Kalimantan Barat.",
  applicationName: "SAYBA ARC",
  keywords: [
    "konsultan IT Pontianak",
    "konsultan engineering Pontianak",
    "jasa pembuatan aplikasi Pontianak",
    "jasa pemetaan GIS Kalimantan Barat",
    "jasa gambar teknik AutoCAD",
    "pengembangan web Pontianak",
    "sistem informasi instansi",
    "SAYBA ARC",
    "Kalimantan Barat",
  ],
  authors: [{ name: "SAYBA ARC", url: "https://sayba.id" }],
  metadataBase: new URL("https://sayba.id"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/logo-256.png", type: "image/png", sizes: "256x256" },
    ],
    apple: "/logo-180.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://sayba.id",
    siteName: "SAYBA ARC",
    title: "SAYBA ARC — Konsultan IT & Engineering Pontianak",
    description:
      "Pengembangan perangkat lunak, sistem informasi, pemetaan spasial, dan dokumen rancang bangun untuk bisnis dan instansi di Kalimantan Barat.",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAYBA ARC — Konsultan IT & Engineering Pontianak",
    description:
      "Pengembangan perangkat lunak, sistem informasi, pemetaan spasial, dan dokumen rancang bangun.",
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "facebook-domain-verification": "marr0bprnwfpm0mlot2sixgg29lv36",
  },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Read the nonce injected by middleware so Next.js can stamp it onto its own
  // inline hydration scripts. Without this, the browser sees a nonce in the CSP
  // and silently ignores 'unsafe-inline' — blocking all of Next.js's scripts.
  const nonce = (await headers()).get("x-nonce") ?? undefined

  return (
    <html lang="id">
      <head>
        {/* Exposes nonce to Next.js runtime so it stamps all its inline scripts */}
        {nonce && <meta property="csp-nonce" content={nonce} />}
        <meta name="theme-color" content="#1c2321" />
        {/* Tidak ada preconnect ke Google Fonts: next/font/google mengunduh
            Geist saat build dan menyajikannya dari domain sendiri
            (/_next/static/media/*.woff2). Preconnect ke fonts.googleapis.com
            dan fonts.gstatic.com hanya membuka koneksi TLS yang tak pernah
            dipakai, dan itu mengambil jatah koneksi di jalur kritis. */}
      </head>
      <body className={`${geist.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}

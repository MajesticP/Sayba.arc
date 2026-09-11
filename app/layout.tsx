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
  title: "SAYBA ARC — ART YOU BELIEVE",
  description:
    "SAYBA ARC adalah agensi digital dan engineering dari Pontianak yang menghadirkan solusi teknis, rekayasa, dan pengembangan untuk bisnis dan instansi di Indonesia.",
  applicationName: "SAYBA ARC",
  keywords: [
    "agensi digital",
    "engineering",
    "GIS",
    "Web GIS",
    "pengembangan web",
    "solusi IT",
    "SAYBA ARC",
    "Pontianak",
    "Kalimantan Barat",
    "Art You Believe"
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
    url: "https://sayba.id",
    siteName: "SAYBA ARC",
    title: "SAYBA ARC — ART YOU BELIEVE",
    description: "Agensi digital & engineering dari Pontianak. Solusi teknis nyata untuk bisnis dan instansi di Indonesia.",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAYBA ARC — ART YOU BELIEVE",
    description: "Agensi digital & engineering dari Pontianak. Solusi teknis nyata untuk bisnis dan instansi di Indonesia.",
    images: [ogImage.url],
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
    <html lang="en">
      <head>
        {/* Exposes nonce to Next.js runtime so it stamps all its inline scripts */}
        {nonce && <meta property="csp-nonce" content={nonce} />}
        <meta name="theme-color" content="#0A1628" />
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

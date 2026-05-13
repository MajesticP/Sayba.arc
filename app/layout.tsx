import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { headers } from "next/headers"
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
    "SAYBA ARC is an Indonesian geospatial and IT agency specializing in ArcGIS development, Web GIS, spatial analysis, and full-stack IT solutions.",
  applicationName: "SAYBA ARC",
  keywords: [
    "ArcGIS development",
    "GIS agency",
    "Web GIS",
    "spatial analysis",
    "IT development",
    "ArcGIS Enterprise",
    "geospatial solutions",
    "SAYBA ARC",
    "3D DESIGN",
    "AUTOCAD",
    "SKETCHUP"
  ],
  authors: [{ name: "SAYBA ARC", url: "https://sayba.web.id" }],
  metadataBase: new URL("https://sayba.web.id"),
  openGraph: {
    type: "website",
    url: "https://sayba.web.id",
    siteName: "SAYBA ARC",
    title: "SAYBA ARC — ART YOU BELIEVE",
    description: "ArcGIS development, Web GIS, spatial analysis, and IT solutions from West Kalimantan, Indonesia.",
    images: [{ url: "https://sayba.web.id/logo.png", width: 1200, height: 630, alt: "SAYBA ARC" }],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geist.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}

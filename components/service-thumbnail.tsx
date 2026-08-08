"use client"

import { DynamicIcon } from "@/lib/dynamic-icon"

export function gdriveToImg(url: string): string {
  if (!url) return url
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

interface ServiceThumbnailProps {
  imgSrc: string | null
  alt: string
  color: string
  icon?: string | null
  badgeNumber?: number
}

/**
 * Thumbnail gambar layanan — DIPAKAI BERSAMA oleh Home (components/services.tsx)
 * dan halaman Layanan (components/services-client.tsx) supaya rasio & crop
 * gambar dijamin 100% identik di kedua halaman (single source of truth).
 */
export default function ServiceThumbnail({ imgSrc, alt, color, icon, badgeNumber }: ServiceThumbnailProps) {
  return (
    <div className="relative w-full aspect-[12/5] bg-black/5 overflow-hidden leading-[0]">
      {imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 block"
          onError={e => {
            const el = e.currentTarget
            el.style.display = "none"
            const fb = el.nextElementSibling as HTMLElement | null
            if (fb) fb.style.display = "flex"
          }}
        />
      ) : null}
      <div
        className="absolute inset-0 items-center justify-center transition-transform group-hover:scale-110 duration-300"
        style={{ backgroundColor: `${color}18`, display: imgSrc ? "none" : "flex" }}
      >
        <DynamicIcon name={icon ?? "map"} color={color} size={28} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 group-hover:h-1 transition-all duration-300" style={{ backgroundColor: color }} />
      {badgeNumber != null && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/80 backdrop-blur-sm border border-black/8 flex items-center justify-center shadow-sm">
          <span className="text-[8px] font-black text-black/40">0{badgeNumber}</span>
        </div>
      )}
    </div>
  )
}

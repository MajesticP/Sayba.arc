"use client"

import Link from "next/link"
import { DynamicIcon } from "@/lib/dynamic-icon"
import type { Layanan } from "@/lib/database.types"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"

function getDeptColor(dept: string): string {
  const map: Record<string, string> = {
    arcgis: "#ff914d",
    it: "#111111",
    kelautan: "#0a6e8a",
  }
  const found = LAYANAN_DEPTS.find(d => d.value === dept)
  return map[dept] ?? found?.color ?? "#888"
}

function getDeptLabel(dept: string): string {
  const map: Record<string, string> = {
    arcgis: "Pemetaan & GIS",
    it: "Digital & IT",
    kelautan: "Teknik Kelautan",
  }
  const found = LAYANAN_DEPTS.find(d => d.value === dept)
  return map[dept] ?? found?.label ?? dept
}

/** Route Google Drive share links through the local image proxy (/api/gdrive-img) */
function gdriveToImg(url: string): string {
  if (!url) return url
  // Already a proxied URL — use as-is
  if (url.startsWith("/api/gdrive-img")) return url
  // Extract file ID from any Drive share link format
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

interface ServicesProps {
  allLayanan: Layanan[]
}

export default function Services({ allLayanan }: ServicesProps) {
  if (!allLayanan.length) return null

  return (
    <section className="py-16 md:py-28 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff914d]/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#ff914d]">Layanan Unggulan</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-black leading-tight">
                Solusi Terbaik<br className="hidden md:block" />
                <span className="text-[#ff914d]"> untuk Anda</span>
              </h2>
              <p className="text-black/50 text-sm md:text-base mt-3 max-w-md">
                Tiga layanan paling diminati klien kami — dipilih langsung dari portofolio aktif.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black transition-colors group self-start md:self-auto"
            >
              Lihat semua layanan
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {allLayanan.slice(0, 3).map((service, i) => {
            const color = getDeptColor(service.dept)
            const deptLabel = getDeptLabel(service.dept)
            const imgSrc = service.image_url ? gdriveToImg(service.image_url) : null

            return (
              <Link
                key={service.id}
                href={service.slug ? `/services/${service.slug}` : "#"}
                className="group relative flex flex-col rounded-2xl md:rounded-3xl overflow-hidden border border-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ "--card-color": color } as React.CSSProperties}
              >
                {/* Image area */}
                <div className="relative w-full h-44 md:h-52 overflow-hidden bg-black/5">
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgSrc}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => {
                        const el = e.currentTarget
                        el.style.display = "none"
                        const fb = el.nextElementSibling as HTMLElement | null
                        if (fb) fb.style.display = "flex"
                      }}
                    />
                  ) : null}

                  {/* Fallback icon (shown when no image OR image fails to load) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                    style={{
                      backgroundColor: `${color}18`,
                      display: imgSrc ? "none" : "flex",
                    }}
                  >
                    <DynamicIcon name={service.icon ?? "map"} color={color} size={40} />
                  </div>

                  {/* Colored bottom border on image */}
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />

                  {/* Number badge */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-black/8 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-black text-black/40">0{i + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 md:p-6 bg-white group-hover:bg-black/[0.01] transition-colors">
                  {/* Dept tag */}
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: color === "#111111" ? "#777" : color }}
                  >
                    {deptLabel}
                    {service.category ? ` · ${service.category}` : ""}
                  </span>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-black text-black mb-2 leading-snug">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-black/45 text-sm leading-relaxed flex-1 line-clamp-3">
                    {service.description ?? ""}
                  </p>

                  {/* CTA */}
                  <div
                    className="mt-4 flex items-center gap-1.5 text-sm font-bold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200"
                    style={{ color: color === "#111111" ? "#111" : color }}
                  >
                    Pelajari lebih lanjut
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom strip */}
        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 py-5 border-t border-black/8">
          <p className="text-black/35 text-sm text-center sm:text-left">
            Tidak menemukan yang Anda cari?
          </p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#ff914d] transition-colors duration-200"
          >
            Jelajahi Semua Layanan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}

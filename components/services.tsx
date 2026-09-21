"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { DynamicIcon } from "@/lib/dynamic-icon"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"

function gdriveToImg(url: string): string {
  if (!url) return url
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export default function Services({ allLayanan, depts }: { allLayanan: Layanan[]; depts: LayananDept[] }) {
  const header = useInView()
  const cards = useInView(0.08)

  if (!allLayanan || !allLayanan.length) return null

  return (
    <section className="pt-6 pb-10 md:pt-14 md:pb-20 bg-[#f8f9fa] overflow-hidden" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div ref={header.ref} className={`mb-10 md:mb-16 transition-all duration-700 ease-out ${header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#ff914d]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff914d]">Layanan Unggulan</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 relative z-10">
            <div>
              <h2 className="text-[22px] leading-tight md:text-5xl font-black text-black tracking-tight">
                Solusi Terbaik<br className="hidden md:block" />
                <span className="text-[#ff914d]"> untuk Anda</span>
              </h2>
              <p className="text-black/50 text-[14px] md:text-base mt-2 md:mt-3 max-w-md leading-relaxed">
                Layanan paling diminati klien kami — dipilih langsung dari portofolio aktif.
              </p>
            </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-black/50 hover:text-black transition-colors group self-start md:self-auto mt-2 md:mt-0"
              >
              Lihat semua layanan
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>

        {/* Cards — mobile: stack, desktop: stack (long cards) */}
        <div ref={cards.ref} className="flex flex-col gap-5 sm:gap-6 lg:gap-8 w-full relative z-10 px-4 sm:px-0">
          {allLayanan.slice(0, 4).map((service, i) => {
            const deptCfg = depts.find(d => d.value === service.dept)
            const color = deptCfg?.color ?? "#888"
            const deptLabel = deptCfg?.label ?? service.dept
            const imgSrc = service.image_url ? gdriveToImg(service.image_url) : null

            return (
              <Link key={service.id} href={service.slug ? `/services/${service.slug}` : "#"}
                className={`group relative transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.15)] overflow-hidden rounded-[24px] border border-black/5 flex flex-col md:flex-row bg-white shadow-sm hover:border-[#ff914d]/30 w-full ${cards.inView ? "animate-card-reveal" : "opacity-0"}`}
                style={{
                  "--card-color": color,
                  animationDelay: `${i * 120}ms`,
                } as React.CSSProperties}>

                {/* Image — responsive width, fixed height on mobile, full height on desktop */}
                <div className="relative w-full md:w-[45%] lg:w-[40%] xl:w-[35%] bg-black/5 overflow-hidden shrink-0 h-[220px] md:h-auto md:min-h-[220px] rounded-t-[24px] md:rounded-t-none md:rounded-l-[24px]">
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc} alt={service.title} className="w-full object-cover transition-transform duration-600 group-hover:scale-105 block"
                      style={{ height: "100%" }}
                      onError={e => { const el = e.currentTarget; el.style.display = "none"; const fb = el.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "flex" }} />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                    style={{ backgroundColor: `${color}18`, display: imgSrc ? "none" : "flex" }}>
                    <DynamicIcon name={service.icon ?? "map"} color={color} size={30} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 group-hover:h-1 transition-all duration-300" style={{ backgroundColor: color }} />
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/80 backdrop-blur-sm border border-black/8 flex items-center justify-center shadow-sm">
                    <span className="text-[8px] font-black text-black/40">0{i + 1}</span>
                  </div>
                </div>

                {/* Content — hard-capped at remaining space */}
                <div
                  className="flex flex-col p-6 md:p-8 lg:p-10 bg-white group-hover:bg-black/[0.01] transition-colors duration-300 flex-1 justify-center"
                >
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-2 lg:mb-3 flex-shrink-0 line-clamp-1" style={{ color }}>
                    {deptLabel}{service.category ? ` · ${service.category}` : ""}
                  </span>
                  <h3 className="text-[18px] md:text-[20px] lg:text-[24px] font-black text-black mb-3 lg:mb-4 leading-snug group-hover:text-black/80 transition-colors flex-shrink-0 line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-black/45 text-[14px] md:text-[15px] leading-relaxed line-clamp-3 lg:line-clamp-4 mb-5">
                    {service.description ?? ""}
                  </p>
                  <div className="mt-auto pt-2 lg:pt-4 flex items-center gap-1.5 text-[11.5px] lg:text-[13px] font-bold flex-shrink-0" style={{ color }}>
                    Pelajari lebih lanjut
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Swipe hint — mobile only */}
        {/* Dihapus karena layout sudah berbentuk stack */}

        {/* Bottom strip */}
        <div className={`mt-8 md:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-black/8 transition-all duration-700 relative z-10 ${cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "500ms" }}>
          <p className="text-black/40 text-[14px] md:text-[15px] font-medium text-center sm:text-left">Tidak menemukan yang Anda cari?</p>
          <Link href="/services" className="btn-shine inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-3.5 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-[#ff914d] transition-colors duration-200 hover:shadow-[0_10px_20px_-5px_rgba(255,145,77,0.3)] hover:scale-105 active:scale-95 w-full sm:w-auto">
            Jelajahi Semua Layanan
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import PageTransition from "@/components/page-transition"
import { DynamicIcon } from "@/lib/dynamic-icon"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"

function getDeptCfg(dept: string, depts: LayananDept[]) {
  const d = depts.find(x => x.value === dept)
  const color = d?.color ?? "#888"
  return {
    label: d?.label ?? dept,
    color,
    iconBg: `bg-[${color}]/10 group-hover:bg-[${color}]/20`,
    accent: `group-hover:text-[${color}]`,
    border: `hover:border-[${color}]/40`,
    shadow: "hover:shadow-lg",
  }
}

interface Props { allLayanan: Layanan[]; allDepts: LayananDept[] }

export default function ServicesClient({ allLayanan, allDepts }: Props) {
  const [activeDept, setActiveDept] = useState<string>("semua")
  const [activeCategory, setActiveCategory] = useState<string>("semua")

  const depts = useMemo(() => {
    const seen = new Set<string>(); const result: string[] = []
    for (const l of allLayanan) { if (!seen.has(l.dept)) { seen.add(l.dept); result.push(l.dept) } }
    return result
  }, [allLayanan])

  const categories = useMemo(() => {
    const base = activeDept === "semua" ? allLayanan : allLayanan.filter(l => l.dept === activeDept)
    const seen = new Set<string>(); const result: string[] = []
    for (const l of base) { if (l.category && !seen.has(l.category)) { seen.add(l.category); result.push(l.category) } }
    return result
  }, [allLayanan, activeDept])

  const handleDeptChange = (dept: string) => { setActiveDept(dept); setActiveCategory("semua") }

  const filtered = useMemo(() => {
    return allLayanan.filter(l => {
      const matchDept = activeDept === "semua" || l.dept === activeDept
      const matchCat = activeCategory === "semua" || l.category === activeCategory
      return matchDept && matchCat
    })
  }, [allLayanan, activeDept, activeCategory])

  const grouped = useMemo(() => {
    const map = new Map<string, Layanan[]>()
    for (const l of filtered) { if (!map.has(l.dept)) map.set(l.dept, []); map.get(l.dept)!.push(l) }
    return map
  }, [filtered])

  if (allLayanan.length === 0) {
    return (
      <section className="py-16 bg-white flex-1 flex items-center justify-center">
        <p className="text-black/30 text-base">Belum ada layanan tersedia.</p>
      </section>
    )
  }

  return (
    <section className="py-6 md:py-16 bg-white flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filter bar */}
        <div className="mb-5 md:mb-10 space-y-1.5 md:space-y-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 mr-1">Dept</span>
            <FilterChip label="Semua" active={activeDept === "semua"} color="#ff914d" onClick={() => handleDeptChange("semua")} />
            {depts.map(dept => {
              const cfg = getDeptCfg(dept, allDepts)
              return <FilterChip key={dept} label={cfg.label} active={activeDept === dept} color={cfg.color} onClick={() => handleDeptChange(dept)} />
            })}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 mr-1">Kategori</span>
              <FilterChip label="Semua" active={activeCategory === "semua"} color="#888" onClick={() => setActiveCategory("semua")} small />
              {categories.map(cat => (
                <FilterChip key={cat} label={cat} active={activeCategory === cat}
                  color={activeDept !== "semua" ? getDeptCfg(activeDept, allDepts).color : "#888"}
                  onClick={() => setActiveCategory(cat)} small />
              ))}
            </div>
          )}

          <p className="text-[11px] text-black/30">
            Menampilkan <span className="font-semibold text-black/50">{filtered.length}</span> layanan
            {activeCategory !== "semua" && <> dalam <span className="font-semibold text-black/50">"{activeCategory}"</span></>}
          </p>
        </div>

        {/* Grouped cards */}
        <div className="space-y-7 md:space-y-16">
          {[...grouped.entries()].map(([dept, services], gi) => {
            const cfg = getDeptCfg(dept, allDepts)
            return (
              <PageTransition key={dept} delay={gi * 80}>
                <div>
                  {/* Dept header */}
                  <div className="flex items-center gap-2.5 mb-3 md:mb-8">
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.color }}>
                      <DeptIcon dept={dept} />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: cfg.color }}>Departemen</div>
                      <h2 className="text-[14px] md:text-xl font-bold text-black leading-tight">{cfg.label}</h2>
                    </div>
                    <div className="flex-1 h-px bg-black/8" />
                    <span className="text-[10px] font-bold text-black/25 tabular-nums">{services.length} layanan</span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {services.map(service => <ServiceCard key={service.id} service={service} cfg={cfg} />)}
                  </div>
                </div>
              </PageTransition>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-black/25 text-base">Tidak ada layanan untuk filter ini.</p>
            <button onClick={() => { setActiveDept("semua"); setActiveCategory("semua") }} className="mt-3 text-sm text-[#ff914d] underline hover:text-[#e07b3a] transition-colors">Reset filter</button>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-black rounded-2xl p-6 md:p-10 relative overflow-hidden mt-8 md:mt-16">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#ff914d] opacity-[0.08] blur-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-[#ff914d] rounded-full" />
          <h2 className="text-[18px] md:text-3xl font-bold text-white mb-1.5 md:mb-3 relative z-10">Butuh solusi kustom?</h2>
          <p className="text-white/40 text-[12px] md:text-base mb-5 md:mb-6 relative z-10">Setiap organisasi memiliki tantangan unik. Mari diskusikan solusi yang tepat.</p>
          <Link href="/contact" className="inline-block px-7 py-2.5 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:scale-105 relative z-10 text-[13px]">
            Diskusikan Proyek Anda
          </Link>
        </div>
      </div>
    </section>
  )
}

function gdriveToImg(url: string): string {
  if (!url) return url
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

function FilterChip({ label, active, color, onClick, small }: { label: string; active: boolean; color: string; onClick: () => void; small?: boolean }) {
  return (
    <button onClick={onClick}
      className={`transition-all duration-200 font-semibold rounded-full border ${small ? "text-[10px] px-2.5 py-0.5" : "text-[11px] px-3 py-1"} ${active ? "text-white border-transparent shadow-sm" : "text-black/40 border-black/12 bg-white hover:border-black/25 hover:text-black/60"}`}
      style={active ? { backgroundColor: color, borderColor: color } : {}}>
      {label}
    </button>
  )
}

function ServiceCard({ service, cfg }: { service: Layanan; cfg: { label: string; color: string; iconBg: string; accent: string; border: string; shadow: string } }) {
  const imgSrc = (service as any).image_url ? gdriveToImg((service as any).image_url) : null

  return (
    <Link href={service.slug ? `/services/${service.slug}` : "#"}
      className={`group bg-white ${cfg.border} ${cfg.shadow} transition-all duration-300 hover:-translate-y-1 relative overflow-hidden rounded-xl border border-black/8 w-full flex flex-col`}

    >
      {/* Image area — hard-capped height */}
      <div className="relative w-full bg-black/5 overflow-hidden leading-[0]" style={{ height: "160px" }}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={service.title} className="w-full object-cover transition-transform duration-500 group-hover:scale-105 block"
            style={{ height: "100%" }}
            onError={e => { const el = e.currentTarget; el.style.display = "none"; const fb = el.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "flex" }} />
        ) : null}
        <div className={`absolute inset-0 items-center justify-center ${cfg.iconBg} transition-colors duration-300`} style={{ display: imgSrc ? "none" : "flex" }}>
          <DynamicIcon name={service.icon ?? "map"} color={cfg.color} size={24} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: cfg.color }} />
      </div>

      {/* Content — hard-capped at remaining 130px */}
      <div className="flex flex-col p-4 flex-1">
        {service.category && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mb-1 w-fit flex-shrink-0" style={{ backgroundColor: `${cfg.color}14`, color: cfg.color }}>
            # {service.category}
          </span>
        )}
        <h4 className={`text-[13px] font-bold text-black mb-1.5 ${cfg.accent} transition-colors duration-200 leading-snug line-clamp-2 flex-shrink-0`}>
          {service.title}
        </h4>
        <p className="text-black/50 text-[11.5px] leading-relaxed line-clamp-3">
          {service.description}
        </p>
        <div className="mt-auto pt-1 flex items-center gap-1 text-[10.5px] font-semibold flex-shrink-0" style={{ color: cfg.color }}>
          Selengkapnya
          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </Link>
  )
}

function DeptIcon({ dept }: { dept: string }) {
  if (dept === "arcgis") return <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
  if (dept === "it") return <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
  if (dept === "kelautan") return <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l3-8 4 4 4-6 3 5M3 21h18" /></svg>
  return <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
}

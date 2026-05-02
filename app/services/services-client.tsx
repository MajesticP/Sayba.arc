"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import PageTransition from "@/components/page-transition"
import { DynamicIcon } from "@/lib/dynamic-icon"
import type { Layanan } from "@/lib/database.types"
import { getDeptLabel } from "@/lib/layanan-config"

// Dept config — color + label per dept value
const DEPT_CONFIG: Record<string, { label: string; color: string; iconBg: string; accent: string; border: string; shadow: string }> = {
  arcgis: {
    label: "Pemetaan & Lingkungan",
    color: "#ff914d",
    iconBg: "bg-[#ff914d]/10 group-hover:bg-[#ff914d]/20",
    accent: "group-hover:text-[#ff914d]",
    border: "hover:border-[#ff914d]/40 hover:shadow-orange-100",
    shadow: "hover:shadow-xl",
  },
  it: {
    label: "Teknologi & Digital",
    color: "#111111",
    iconBg: "bg-black/5 group-hover:bg-black/10",
    accent: "",
    border: "hover:border-black/25 hover:shadow-black/5",
    shadow: "hover:shadow-xl",
  },
  kelautan: {
    label: "Teknik Kelautan",
    color: "#0a6e8a",
    iconBg: "bg-[#0a6e8a]/10 group-hover:bg-[#0a6e8a]/20",
    accent: "group-hover:text-[#0a6e8a]",
    border: "hover:border-[#0a6e8a]/40 hover:shadow-cyan-100",
    shadow: "hover:shadow-xl",
  },
}

function getDeptCfg(dept: string) {
  return DEPT_CONFIG[dept] ?? {
    label: getDeptLabel(dept),
    color: "#888",
    iconBg: "bg-gray-100",
    accent: "",
    border: "hover:border-gray-300",
    shadow: "hover:shadow-md",
  }
}

interface Props {
  allLayanan: Layanan[]
}

export default function ServicesClient({ allLayanan }: Props) {
  const [activeDept, setActiveDept] = useState<string>("semua")
  const [activeCategory, setActiveCategory] = useState<string>("semua")

  // Unique depts that actually have layanan
  const depts = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const l of allLayanan) {
      if (!seen.has(l.dept)) { seen.add(l.dept); result.push(l.dept) }
    }
    return result
  }, [allLayanan])

  // Categories available for the active dept filter
  const categories = useMemo(() => {
    const base = activeDept === "semua" ? allLayanan : allLayanan.filter(l => l.dept === activeDept)
    const seen = new Set<string>()
    const result: string[] = []
    for (const l of base) {
      if (l.category && !seen.has(l.category)) { seen.add(l.category); result.push(l.category) }
    }
    return result
  }, [allLayanan, activeDept])

  // Reset category filter when dept changes
  const handleDeptChange = (dept: string) => {
    setActiveDept(dept)
    setActiveCategory("semua")
  }

  // Final filtered list
  const filtered = useMemo(() => {
    return allLayanan.filter(l => {
      const matchDept = activeDept === "semua" || l.dept === activeDept
      const matchCat = activeCategory === "semua" || l.category === activeCategory
      return matchDept && matchCat
    })
  }, [allLayanan, activeDept, activeCategory])

  // Group filtered by dept (preserve insertion order)
  const grouped = useMemo(() => {
    const map = new Map<string, Layanan[]>()
    for (const l of filtered) {
      if (!map.has(l.dept)) map.set(l.dept, [])
      map.get(l.dept)!.push(l)
    }
    return map
  }, [filtered])

  if (allLayanan.length === 0) {
    return (
      <section className="py-20 bg-white flex-1 flex items-center justify-center">
        <p className="text-black/30 text-lg">Belum ada layanan tersedia.</p>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Filter bar ── */}
        <div className="mb-10 space-y-3">

          {/* Dept filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-black/30 mr-1">Departemen</span>
            <FilterChip
              label="Semua"
              active={activeDept === "semua"}
              color="#ff914d"
              onClick={() => handleDeptChange("semua")}
            />
            {depts.map(dept => {
              const cfg = getDeptCfg(dept)
              return (
                <FilterChip
                  key={dept}
                  label={cfg.label}
                  active={activeDept === dept}
                  color={cfg.color}
                  onClick={() => handleDeptChange(dept)}
                />
              )
            })}
          </div>

          {/* Category filter — only show when categories exist */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-black/30 mr-1">Kategori</span>
              <FilterChip
                label="Semua"
                active={activeCategory === "semua"}
                color="#888"
                onClick={() => setActiveCategory("semua")}
                small
              />
              {categories.map(cat => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  color={activeDept !== "semua" ? getDeptCfg(activeDept).color : "#888"}
                  onClick={() => setActiveCategory(cat)}
                  small
                />
              ))}
            </div>
          )}

          {/* Result count */}
          <p className="text-[12px] text-black/30">
            Menampilkan <span className="font-semibold text-black/50">{filtered.length}</span> layanan
            {activeCategory !== "semua" && <> dalam kategori <span className="font-semibold text-black/50">"{activeCategory}"</span></>}
          </p>
        </div>

        {/* ── Grouped service cards ── */}
        <div className="space-y-16">
          {[...grouped.entries()].map(([dept, services], gi) => {
            const cfg = getDeptCfg(dept)
            return (
              <PageTransition key={dept} delay={gi * 80}>
                <div>
                  {/* Dept header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: cfg.color }}
                      >
                        <DeptIcon dept={dept} />
                      </div>
                      <div>
                        <div
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: cfg.color }}
                        >
                          Departemen
                        </div>
                        <h2 className="text-xl font-bold text-black">{cfg.label}</h2>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-black/8" />
                    <span className="text-[11px] font-bold text-black/25 tabular-nums">{services.length} layanan</span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {services.map(service => (
                      <ServiceCard key={service.id} service={service} cfg={cfg} />
                    ))}
                  </div>
                </div>
              </PageTransition>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-black/25 text-lg">Tidak ada layanan untuk filter ini.</p>
            <button
              onClick={() => { setActiveDept("semua"); setActiveCategory("semua") }}
              className="mt-4 text-sm text-[#ff914d] underline hover:text-[#e07b3a] transition-colors"
            >
              Reset filter
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-black rounded-3xl p-10 relative overflow-hidden mt-16">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#ff914d] opacity-[0.08] blur-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#ff914d] rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10">Butuh solusi kustom?</h2>
          <p className="text-white/40 mb-6 relative z-10">Setiap organisasi memiliki tantangan unik. Mari diskusikan solusi yang tepat untuk Anda.</p>
          <Link href="/contact" className="inline-block px-8 py-3 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:scale-105 relative z-10">
            Diskusikan Proyek Anda
          </Link>
        </div>

      </div>
    </section>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FilterChip({ label, active, color, onClick, small }: {
  label: string; active: boolean; color: string; onClick: () => void; small?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        transition-all duration-200 font-semibold rounded-full border
        ${small ? "text-[11px] px-3 py-1" : "text-[12.5px] px-4 py-1.5"}
        ${active
          ? "text-white border-transparent shadow-sm"
          : "text-black/40 border-black/12 bg-white hover:border-black/25 hover:text-black/60"}
      `}
      style={active ? { backgroundColor: color, borderColor: color } : {}}
    >
      {label}
    </button>
  )
}

function ServiceCard({ service, cfg }: { service: Layanan; cfg: ReturnType<typeof getDeptCfg> }) {
  return (
    <Link
      href={service.slug ? `/services/${service.slug}` : "#"}
      className={`group bg-white rounded-2xl p-6 border border-black/8 ${cfg.border} ${cfg.shadow} transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col`}
    >
      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: cfg.color }}
      />

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} flex items-center justify-center mb-5 flex-shrink-0 transition-colors duration-300`}>
        <DynamicIcon name={service.icon ?? "map"} color={cfg.color} size={22} />
      </div>

      {/* Category badge */}
      {service.category && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 w-fit"
          style={{
            backgroundColor: `${cfg.color}14`,
            color: cfg.color === "#111111" ? "#555" : cfg.color,
          }}
        >
          # {service.category}
        </span>
      )}

      {/* Title + description */}
      <h4 className={`text-base font-bold text-black mb-2 ${cfg.accent} transition-colors duration-200`}>
        {service.title}
      </h4>
      <p className="text-black/50 text-sm leading-relaxed flex-1">{service.description}</p>

      {/* Arrow CTA */}
      <div
        className="mt-4 flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ color: cfg.color === "#111111" ? "#111" : cfg.color }}
      >
        Selengkapnya
        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

function DeptIcon({ dept }: { dept: string }) {
  if (dept === "arcgis") return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
  if (dept === "it") return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
  if (dept === "kelautan") return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l3-8 4 4 4-6 3 5M3 21h18" />
    </svg>
  )
  return <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
}

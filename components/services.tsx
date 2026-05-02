"use client"

import Link from "next/link"
import PageTransition from "@/components/page-transition"
import { DynamicIcon } from "@/lib/dynamic-icon"
import { getDeptLabel } from "@/lib/layanan-config"
import type { Layanan } from "@/lib/database.types"

// Same dept config as services-client — keeps styling consistent
const DEPT_CONFIG: Record<string, {
  label: string; subtitle: string; color: string
  iconBg: string; accent: string; border: string; shadow: string
  headerIcon: React.ReactNode
}> = {
  arcgis: {
    label: "Pemetaan & Analisis Lingkungan",
    subtitle: "Layanan GIS dan pemetaan berbasis ArcGIS untuk kebutuhan analisis lingkungan, tata ruang, dan pengelolaan sumber daya alam.",
    color: "#ff914d",
    iconBg: "bg-[#ff914d]/10 group-hover:bg-[#ff914d]/20",
    accent: "group-hover:text-[#ff914d]",
    border: "hover:border-[#ff914d]/40 hover:shadow-orange-100",
    shadow: "hover:shadow-xl",
    headerIcon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  it: {
    label: "Pengembangan Digital & Kecerdasan Data",
    subtitle: "Dari web dan mobile hingga machine learning dan data science — solusi digital end-to-end untuk kebutuhan modern organisasi Anda.",
    color: "#111111",
    iconBg: "bg-black/5 group-hover:bg-black/10",
    accent: "",
    border: "hover:border-black/25 hover:shadow-black/5",
    shadow: "hover:shadow-xl",
    headerIcon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  kelautan: {
    label: "Desain & Gambar Teknik Kapal",
    subtitle: "Gambar teknik kapal 2D dengan AutoCAD — dari desain lambung dan rencana garis hingga gambar konstruksi dan tata letak akomodasi.",
    color: "#0a6e8a",
    iconBg: "bg-[#0a6e8a]/10 group-hover:bg-[#0a6e8a]/20",
    accent: "group-hover:text-[#0a6e8a]",
    border: "hover:border-[#0a6e8a]/40 hover:shadow-cyan-100",
    shadow: "hover:shadow-xl",
    headerIcon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l3-8 4 4 4-6 3 5M3 21h18" />
      </svg>
    ),
  },
}

// Fallback for any dept not in DEPT_CONFIG (new ones added via admin)
function getFallbackCfg(dept: string) {
  return {
    label: getDeptLabel(dept),
    subtitle: "",
    color: "#888888",
    iconBg: "bg-gray-100 group-hover:bg-gray-200",
    accent: "",
    border: "hover:border-gray-300",
    shadow: "hover:shadow-md",
    headerIcon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  }
}

function getDeptCfg(dept: string) {
  return DEPT_CONFIG[dept] ?? getFallbackCfg(dept)
}

interface ServicesProps {
  allLayanan: Layanan[]
}

export default function Services({ allLayanan }: ServicesProps) {
  // Group by dept, preserving insertion order
  const grouped = new Map<string, Layanan[]>()
  for (const l of allLayanan) {
    if (!grouped.has(l.dept)) grouped.set(l.dept, [])
    grouped.get(l.dept)!.push(l)
  }

  if (grouped.size === 0) return null

  return (
    <section className="py-24 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Layanan Kami</h2>
          <p className="text-black/50 text-lg max-w-2xl mx-auto">
            Departemen spesialis dengan satu misi — solusi teknis yang nyata untuk kebutuhan organisasi Anda.
          </p>
        </div>

        {/* Dynamic dept sections */}
        {[...grouped.entries()].map(([dept, services], gi) => {
          const cfg = getDeptCfg(dept)
          return (
            <PageTransition key={dept} delay={(gi + 1) * 100}>
              <div className={gi < grouped.size - 1 ? "mb-20" : ""}>

                {/* Dept header */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {cfg.headerIcon}
                    </div>
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: cfg.color === "#111111" ? "rgba(0,0,0,0.4)" : cfg.color }}
                      >
                        Departemen
                      </div>
                      <h3 className="text-xl font-bold text-black">{cfg.label}</h3>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-black/8" />
                </div>

                {cfg.subtitle && (
                  <p className="text-black/50 text-base mb-8 max-w-2xl">{cfg.subtitle}</p>
                )}

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((service) => (
                    <Link
                      key={service.slug ?? service.id}
                      href={service.slug ? `/services/${service.slug}` : "#"}
                      className={`group bg-white rounded-2xl p-6 border border-black/8 ${cfg.border} ${cfg.shadow} transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col`}
                    >
                      <div
                        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} flex items-center justify-center mb-5 flex-shrink-0 transition-colors duration-300`}>
                        <DynamicIcon name={service.icon ?? "map"} color={cfg.color} size={24} />
                      </div>

                      {/* Category badge */}
                      {service.category && (
                        <span
                          className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3 w-fit"
                          style={{
                            backgroundColor: `${cfg.color}14`,
                            color: cfg.color === "#111111" ? "#555" : cfg.color,
                          }}
                        >
                          # {service.category}
                        </span>
                      )}

                      <h4 className={`text-base font-bold text-black mb-2 ${cfg.accent} transition-colors duration-200`}>
                        {service.title}
                      </h4>
                      <p className="text-black/50 text-sm leading-relaxed flex-1">{service.description}</p>
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
                  ))}
                </div>
              </div>
            </PageTransition>
          )
        })}

      </div>
    </section>
  )
}

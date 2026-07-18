"use client"

import Link from "next/link"
import { Code2, MapPin as MapPinIcon, BrainCircuit, Ruler } from "lucide-react"

const serviceNodes = [
  { Icon: Code2, label: "Web & App", top: 56, left: 298, accent: true },
  { Icon: MapPinIcon, label: "GIS", top: 56, left: 86, accent: false },
  { Icon: BrainCircuit, label: "Data & ML", top: 268, left: 86, accent: false },
  { Icon: Ruler, label: "Dokumen", top: 268, left: 298, accent: true },
]

interface HeroData {
  title: string
  subtitle: string
  primaryButton: { text: string; href: string }
  secondaryButton: { text: string; href: string }
  badge?: string
}

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative min-h-[360px] md:min-h-[680px] flex items-center overflow-hidden bg-black">
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,145,77,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.8) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Orbs */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-[#ff914d] animate-orb-pulse pointer-events-none" style={{ opacity: 0.07 }} />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[#ff914d] animate-orb-pulse-2 pointer-events-none" style={{ animationDelay: "2s", opacity: 0.05 }} />

      {/* Rings — desktop only */}
      <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-[#ff914d]/8 animate-spin-slow pointer-events-none" />
      <div className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full border border-[#ff914d]/5 animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "30s" }} />

      {/* Floating icons — desktop only */}
      <div className="hidden lg:block absolute top-20 right-28 opacity-25 animate-float-side" style={{ animationDuration: "4s" }}>
        <svg width="28" height="38" viewBox="0 0 32 42" fill="#ff914d"><path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0zm0 22a6 6 0 110-12 6 6 0 010 12z" /></svg>
      </div>

      <div className="w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-14 items-center">

            {/* Text */}
            <div className="space-y-3 md:space-y-7">
              {data.badge && (
                <div className="animate-fade-in-up stagger-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/15 text-[11px] font-medium text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
                  {data.badge}
                </div>
              )}

              <h1 className="animate-blur-in stagger-2 text-[26px] leading-[1.12] sm:text-4xl lg:text-6xl font-bold text-white tracking-tight">
                {data.title}
              </h1>

              <p className="animate-fade-in-up stagger-3 text-white/55 text-[13px] md:text-lg leading-relaxed max-w-xl">
                {data.subtitle}
              </p>

              {/* Value badges */}
              <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-1.5 pt-0.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#ff914d]/15 border border-[#ff914d]/30 hover:bg-[#ff914d]/25 transition-all duration-300">
                  <svg className="w-3 h-3 text-[#ff914d] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-[11px] font-semibold text-[#ff914d]">Tim Multidisiplin</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:bg-white/14 transition-all duration-300">
                  <svg className="w-3 h-3 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  <span className="text-[11px] font-semibold text-white/70">Hasil Nyata</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/15 hover:bg-white/14 transition-all duration-300">
                  <svg className="w-3 h-3 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-[11px] font-semibold text-white/70">Pontianak, Indonesia</span>
                </div>
              </div>

              <div className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row gap-2 pt-0.5">
                <Link href={data.primaryButton.href} className="btn-shine px-5 py-2.5 md:py-3 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 text-center text-sm active:scale-95">
                  {data.primaryButton.text}
                </Link>
                <Link href={data.secondaryButton.href} className="px-5 py-2.5 md:py-3 rounded-xl font-semibold bg-white/8 text-white border border-white/15 hover:bg-white/14 transition-all duration-200 hover:scale-105 text-center text-sm active:scale-95">
                  {data.secondaryButton.text}
                </Link>
              </div>
            </div>

            {/* Visual panel — desktop only */}
            <div className="hidden lg:flex justify-center animate-fade-in-right stagger-3">
              <div className="relative w-[440px] h-[380px]">
                <div className="w-full h-full rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden relative shadow-2xl">
                  <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(255,145,77,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                  {/* Orbit rings around the logo */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-dashed border-[#ff914d]/25 animate-spin-slow" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#ff914d]/10" />

                  {/* Spokes connecting logo to service nodes */}
                  <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 440 380">
                    {serviceNodes.map((n, i) => (
                      <line key={i} x1="220" y1="190" x2={n.left + 28} y2={n.top + 28}
                        stroke={n.accent ? "rgba(255,145,77,0.4)" : "rgba(255,255,255,0.15)"}
                        strokeWidth="1.5" strokeDasharray="4 5" />
                    ))}
                  </svg>

                  {/* Neon logo centerpiece */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-neon-flicker">
                    <img
                      src="/Sayba%20Arc.png"
                      alt="SAYBA ARC"
                      className="w-28 h-28 rounded-2xl object-contain"
                      style={{ filter: "drop-shadow(0 0 10px rgba(255,145,77,0.9)) drop-shadow(0 0 28px rgba(255,145,77,0.6)) drop-shadow(0 0 55px rgba(255,145,77,0.35))" }}
                    />
                  </div>

                  {/* Orbiting service nodes */}
                  {serviceNodes.map(({ Icon, label, top, left, accent }, i) => (
                    <div key={i} className="absolute flex flex-col items-center gap-1.5" style={{ top, left }}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${accent ? "bg-[#ff914d]/15 border-[#ff914d]/35" : "bg-white/8 border-white/15"}`}>
                        <Icon className={`w-5 h-5 ${accent ? "text-[#ff914d]" : "text-white/75"}`} strokeWidth={1.75} />
                      </div>
                      <span className="text-[10px] font-semibold text-white/70 text-center whitespace-nowrap">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="animate-scale-in stagger-5 absolute -top-4 -right-6 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white shadow-xl">
                  <div className="text-2xl font-bold text-[#ff914d]">50+</div>
                  <div className="text-xs text-white/40">Proyek Selesai</div>
                </div>
                <div className="animate-scale-in stagger-6 absolute -bottom-4 -left-6 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white shadow-xl">
                  <div className="text-2xl font-bold text-[#ff914d]">4+</div>
                  <div className="text-xs text-white/40">Bidang Keahlian</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"

interface HeroData {
  title: string
  subtitle: string
  primaryButton: { text: string; href: string }
  secondaryButton: { text: string; href: string }
  badge?: string
}

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative min-h-[480px] md:min-h-[680px] flex items-center overflow-hidden bg-black">
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,145,77,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated orbs */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-[#ff914d] animate-orb-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[#ff914d] animate-orb-pulse-2 pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Spinning ring decoration */}
      <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-[#ff914d]/8 animate-spin-slow pointer-events-none" />
      <div className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full border border-[#ff914d]/5 animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "30s" }} />

      {/* Floating pin icon */}
      <div className="hidden lg:block absolute top-20 right-28 opacity-25 animate-float-side" style={{ animationDuration: "4s" }}>
        <svg width="28" height="38" viewBox="0 0 32 42" fill="#ff914d">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0zm0 22a6 6 0 110-12 6 6 0 010 12z" />
        </svg>
      </div>
      <div className="hidden lg:block absolute bottom-24 left-20 opacity-15 animate-float-up" style={{ animationDuration: "5s", animationDelay: "1s" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff914d" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="#ff914d" opacity="0.5" />
        </svg>
      </div>

      <div className="w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14 items-center">

            {/* Text — staggered entrance */}
            <div className="space-y-4 md:space-y-7">
              {data.badge && (
                <div className="animate-fade-in-up stagger-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/15 text-xs font-medium text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
                  {data.badge}
                </div>
              )}

              <h1 className="animate-blur-in stagger-2 text-2xl sm:text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                {data.title}
              </h1>

              <p className="animate-fade-in-up stagger-3 text-white/55 text-sm md:text-lg leading-relaxed max-w-xl">
                {data.subtitle}
              </p>

              {/* Department badges */}
              <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-2 pt-0.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#ff914d]/15 border border-[#ff914d]/30 transition-all duration-300 hover:bg-[#ff914d]/25 hover:scale-105">
                  <svg className="w-3.5 h-3.5 text-[#ff914d] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-xs font-semibold text-[#ff914d]">Departemen ArcGIS</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/8 border border-white/15 transition-all duration-300 hover:bg-white/14 hover:scale-105">
                  <svg className="w-3.5 h-3.5 text-white/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="text-xs font-semibold text-white/70">Departemen IT</span>
                </div>
              </div>

              <div className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row gap-2 pt-0.5">
                <Link
                  href={data.primaryButton.href}
                  className="btn-shine px-6 py-2.5 md:py-3 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 text-center text-sm active:scale-95"
                >
                  {data.primaryButton.text}
                </Link>
                <Link
                  href={data.secondaryButton.href}
                  className="px-6 py-2.5 md:py-3 rounded-xl font-semibold bg-white/8 text-white border border-white/15 hover:bg-white/14 transition-all duration-200 hover:scale-105 hover:border-white/30 text-center text-sm active:scale-95"
                >
                  {data.secondaryButton.text}
                </Link>
              </div>
            </div>

            {/* Visual panel */}
            <div className="hidden lg:flex justify-center animate-fade-in-right stagger-3">
              <div className="relative w-[440px] h-[380px]">
                <div className="w-full h-full rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden relative shadow-2xl transition-all duration-500 hover:border-[#ff914d]/20 hover:shadow-[#ff914d]/10">
                  {/* Map grid */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,145,77,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.5) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 440 380">
                    <polygon points="80,60 200,40 280,100 240,200 100,180" fill="rgba(255,145,77,0.15)" stroke="rgba(255,145,77,0.5)" strokeWidth="1.5" />
                    <polygon points="200,160 320,140 380,220 340,310 180,290" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    {/* Animated ping on dot */}
                    <circle cx="160" cy="120" r="6" fill="#ff914d" opacity="0.9" />
                    <circle cx="160" cy="120" r="14" fill="#ff914d" opacity="0.2">
                      <animate attributeName="r" values="10;22;10" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="290" cy="200" r="5" fill="white" opacity="0.6" />
                    <circle cx="290" cy="200" r="12" fill="white" opacity="0.1">
                      <animate attributeName="r" values="8;18;8" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="110" cy="260" r="4" fill="#ff914d" opacity="0.7" />
                  </svg>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-white/40 mb-2 font-medium">Lapisan Analisis Spasial</div>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-white/60">
                        <span className="w-3 h-3 rounded-full bg-[#ff914d] animate-pulse" />Zona A
                      </span>
                      <span className="flex items-center gap-1.5 text-white/60">
                        <span className="w-3 h-3 rounded-full bg-white/50" />Zona B
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="animate-scale-in stagger-5 absolute -top-4 -right-6 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white shadow-xl hover:bg-white/12 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-[#ff914d]">50+</div>
                  <div className="text-xs text-white/40">Proyek Selesai</div>
                </div>
                <div className="animate-scale-in stagger-6 absolute -bottom-4 -left-6 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white shadow-xl hover:bg-white/12 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-[#ff914d]">GIS</div>
                  <div className="text-xs text-white/40">Bersertifikat Esri</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

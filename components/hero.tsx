"use client"

import Link from "next/link"
import PageTransition from "@/components/page-transition"

interface HeroData {
  title: string
  subtitle: string
  primaryButton: { text: string; href: string }
  secondaryButton: { text: string; href: string }
  badge?: string
}

interface HeroProps {
  data: HeroData
}

export default function Hero({ data }: HeroProps) {
  return (
    <section className="relative min-h-[600px] md:min-h-[680px] flex items-center overflow-hidden bg-black">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,145,77,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Orange glow */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#ff914d] opacity-[0.08] blur-3xl pointer-events-none" />

      {/* Floating decorations */}
      <div className="hidden lg:block absolute top-20 right-28 opacity-25 animate-bounce" style={{ animationDuration: "3.5s" }}>
        <svg width="28" height="38" viewBox="0 0 32 42" fill="#ff914d">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0zm0 22a6 6 0 110-12 6 6 0 010 12z" />
        </svg>
      </div>

      <div className="w-full relative z-10">
        <PageTransition>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              {/* Text */}
              <div className="space-y-7">
                {data.badge && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-xs font-medium text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
                    {data.badge}
                  </div>
                )}

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                  {data.title}
                </h1>

                <p className="text-white/55 text-lg leading-relaxed max-w-xl">
                  {data.subtitle}
                </p>

                {/* Department badges */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ff914d]/15 border border-[#ff914d]/30">
                    <svg className="w-4 h-4 text-[#ff914d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-sm font-semibold text-[#ff914d]">Departemen ArcGIS</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/15">
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="text-sm font-semibold text-white/70">Departemen IT</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link
                    href={data.primaryButton.href}
                    className="px-8 py-3.5 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/25 hover:scale-105 text-center"
                  >
                    {data.primaryButton.text}
                  </Link>
                  <Link
                    href={data.secondaryButton.href}
                    className="px-8 py-3.5 rounded-xl font-semibold bg-white/8 text-white border border-white/15 hover:bg-white/12 transition-all duration-200 hover:scale-105 text-center"
                  >
                    {data.secondaryButton.text}
                  </Link>
                </div>
              </div>

              {/* Visual panel */}
              <div className="hidden lg:flex justify-center">
                <div className="relative w-[440px] h-[380px]">
                  <div className="w-full h-full rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden relative shadow-2xl">
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
                      <circle cx="160" cy="120" r="6" fill="#ff914d" opacity="0.9" />
                      <circle cx="160" cy="120" r="14" fill="#ff914d" opacity="0.2" />
                      <circle cx="290" cy="200" r="5" fill="white" opacity="0.6" />
                      <circle cx="290" cy="200" r="12" fill="white" opacity="0.1" />
                      <circle cx="110" cy="260" r="4" fill="#ff914d" opacity="0.7" />
                    </svg>

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-white/40 mb-2 font-medium">Lapisan Analisis Spasial</div>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-white/60">
                          <span className="w-3 h-3 rounded-full bg-[#ff914d]" />Zona A
                        </span>
                        <span className="flex items-center gap-1.5 text-white/60">
                          <span className="w-3 h-3 rounded-full bg-white/50" />Zona B
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="absolute -top-4 -right-6 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white shadow-xl">
                    <div className="text-2xl font-bold text-[#ff914d]">50+</div>
                    <div className="text-xs text-white/40">Proyek Selesai</div>
                  </div>
                  <div className="absolute -bottom-4 -left-6 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white shadow-xl">
                    <div className="text-2xl font-bold text-[#ff914d]">GIS</div>
                    <div className="text-xs text-white/40">Bersertifikat Esri</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      </div>
    </section>
  )
}

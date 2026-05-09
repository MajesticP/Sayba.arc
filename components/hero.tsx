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
    <section className="relative min-h-[560px] md:min-h-screen max-h-[900px] flex flex-col overflow-hidden bg-[#0a0a0a]">

      {/* ── Topographic contour lines background ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[0,1,2,3,4,5,6,7,8].map((i) => (
          <ellipse
            key={i}
            cx="820" cy="340"
            rx={180 + i * 90}
            ry={110 + i * 58}
            fill="none"
            stroke="#ff914d"
            strokeWidth="1"
            transform={`rotate(${-15 + i * 3} 820 340)`}
          />
        ))}
        {[0,1,2,3,4].map((i) => (
          <ellipse
            key={`b${i}`}
            cx="200" cy="650"
            rx={90 + i * 70}
            ry={55 + i * 44}
            fill="none"
            stroke="#ff914d"
            strokeWidth="0.8"
            transform={`rotate(${20 + i * 5} 200 650)`}
          />
        ))}
      </svg>

      {/* ── Right-side atmospheric glow ── */}
      <div className="absolute top-0 right-0 w-[55%] h-full pointer-events-none">
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ff914d] opacity-[0.07] blur-[120px]" />
        <div className="absolute bottom-1/4 right-[15%] w-[260px] h-[260px] rounded-full bg-[#ff6b1a] opacity-[0.06] blur-[80px]" />
      </div>

      {/* ── Coordinate decoration ── */}
      <div className="absolute top-6 right-5 md:top-10 md:right-10 text-right pointer-events-none select-none">
        <div className="text-[10px] md:text-xs font-mono text-white/15 leading-relaxed">
          <div>0°01′N 109°20′E</div>
          <div className="text-[#ff914d]/30">KALIMANTAN BARAT</div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col justify-center w-full relative z-10">
        <PageTransition>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-4 md:pt-16 md:pb-6">

            {/* Badge */}
            {data.badge && (
              <div className="inline-flex items-center gap-2 mb-4 md:mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
                <span className="text-[11px] md:text-xs font-mono font-medium text-white/40 uppercase tracking-[0.2em]">
                  {data.badge}
                </span>
              </div>
            )}

            {/* ── Headline — each word a different treatment ── */}
            <div className="mb-4 md:mb-8">
              <h1 className="leading-[0.92] tracking-tight">
                <span className="block text-[15vw] sm:text-[11vw] lg:text-[9vw] font-black text-white">
                  Peta.
                </span>
                <span
                  className="block text-[15vw] sm:text-[11vw] lg:text-[9vw] font-black"
                  style={{ WebkitTextStroke: "2px #ff914d", color: "transparent" }}
                >
                  Kode.
                </span>
                <span className="block text-[15vw] sm:text-[11vw] lg:text-[9vw] font-black text-white/18">
                  Kapal.
                </span>
              </h1>
            </div>

            {/* Subtitle + CTA row */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 md:gap-6">
              <p className="text-white/45 text-sm md:text-base leading-relaxed max-w-lg">
                {data.subtitle}
              </p>
              <div className="flex flex-row gap-2.5 flex-shrink-0">
                <Link
                  href={data.primaryButton.href}
                  className="px-5 py-2.5 md:px-7 md:py-3 rounded-lg font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30 text-sm whitespace-nowrap"
                >
                  {data.primaryButton.text}
                </Link>
                <Link
                  href={data.secondaryButton.href}
                  className="px-5 py-2.5 md:px-7 md:py-3 rounded-lg font-semibold text-white/70 border border-white/15 hover:border-white/30 hover:text-white transition-all duration-200 text-sm whitespace-nowrap"
                >
                  {data.secondaryButton.text}
                </Link>
              </div>
            </div>

          </div>
        </PageTransition>
      </div>

      {/* ── Department strip — anchored to bottom ── */}
      <div className="relative z-10 mt-auto">
        <div className="border-t border-white/[0.07]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-3">

              {/* ArcGIS */}
              <Link href="/services?dept=arcgis" className="group flex flex-col gap-1.5 md:gap-3 py-4 md:py-6 pr-4 md:pr-8 border-r border-white/[0.07] hover:bg-white/[0.02] transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-[#ff914d]/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#ff914d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#ff914d]">ArcGIS</span>
                </div>
                <p className="text-[10px] md:text-xs text-white/30 leading-snug hidden sm:block">Pemetaan & Analisis Spasial</p>
                <div className="w-0 group-hover:w-8 h-px bg-[#ff914d] transition-all duration-300" />
              </Link>

              {/* IT */}
              <Link href="/services?dept=it" className="group flex flex-col gap-1.5 md:gap-3 px-4 md:px-8 py-4 md:py-6 border-r border-white/[0.07] hover:bg-white/[0.02] transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-white/8 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">IT</span>
                </div>
                <p className="text-[10px] md:text-xs text-white/30 leading-snug hidden sm:block">Pengembangan Digital & ML</p>
                <div className="w-0 group-hover:w-8 h-px bg-white/40 transition-all duration-300" />
              </Link>

              {/* Kelautan */}
              <Link href="/services?dept=kelautan" className="group flex flex-col gap-1.5 md:gap-3 px-4 md:px-8 py-4 md:py-6 hover:bg-white/[0.02] transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-[#0a6e8a]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#0a9ec4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l3-8 4 4 4-6 3 5M3 21h18" />
                    </svg>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#0a9ec4]/70">Kelautan</span>
                </div>
                <p className="text-[10px] md:text-xs text-white/30 leading-snug hidden sm:block">Gambar Teknik Kapal AutoCAD</p>
                <div className="w-0 group-hover:w-8 h-px bg-[#0a9ec4] transition-all duration-300" />
              </Link>

            </div>
          </div>
        </div>

        {/* Stat bar */}
        <div className="bg-[#ff914d]/[0.05] border-t border-[#ff914d]/10">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex items-center gap-5 md:gap-10 py-2.5 md:py-3 overflow-x-auto">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm md:text-base font-black text-[#ff914d]">50+</span>
                <span className="text-[10px] md:text-xs text-white/30">Proyek Selesai</span>
              </div>
              <div className="w-px h-3 bg-white/10 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm md:text-base font-black text-white/50">3</span>
                <span className="text-[10px] md:text-xs text-white/30">Departemen Spesialis</span>
              </div>
              <div className="w-px h-3 bg-white/10 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse flex-shrink-0" />
                <span className="text-[10px] md:text-xs text-white/30">Pontianak, Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

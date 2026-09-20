"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface HeroData {
  title: string
  subtitle: string
  primaryButton: { text: string; href: string }
  secondaryButton: { text: string; href: string }
  badge?: string
}

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative min-h-[480px] md:min-h-[800px] flex items-center justify-center overflow-hidden bg-black text-center pt-20 md:pt-32 pb-16">
      {/* Subtle minimalist grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      
      {/* Clean elegant glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ff914d] opacity-10 blur-[120px] rounded-[100%]" />

      <div className="w-full relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Badge */}
          {data.badge && (
            <div className="animate-fade-in-up stagger-1 mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
              {data.badge}
            </div>
          )}

          {/* Title */}
          <h1 className="animate-blur-in stagger-2 text-3xl sm:text-5xl lg:text-[64px] font-bold text-white tracking-tight leading-[1.1] mb-6">
            {data.title.split('SAYBA ARC').map((part, i, arr) => 
              i === arr.length - 1 ? part : <span key={i}>{part}<span className="text-[#ff914d]">SAYBA ARC</span></span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up stagger-3 text-white/50 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            {data.subtitle}
          </p>

          {/* Buttons */}
          <div className="animate-fade-in-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={data.primaryButton.href} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-medium bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,145,77,0.3)] hover:-translate-y-0.5 text-sm">
              {data.primaryButton.text}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={data.secondaryButton.href} className="w-full sm:w-auto px-8 py-3.5 rounded-full font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 text-sm">
              {data.secondaryButton.text}
            </Link>
          </div>

          {/* Minimalist Trust Badges */}
          <div className="animate-fade-in-up stagger-5 mt-16 flex flex-wrap justify-center gap-6 sm:gap-12 pt-8 border-t border-white/5">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-bold text-white">50+</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Proyek Selesai</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Tingkat Keberhasilan</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-bold text-white">4+</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Bidang Keahlian IT</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}

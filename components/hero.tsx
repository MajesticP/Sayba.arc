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
    <section className="relative flex items-center justify-center overflow-hidden bg-black text-center pt-32 pb-16 md:pt-44 md:pb-24 px-2 min-h-[90vh]">
      {/* 3D WebGL Background */}
      <ThreeBackground />
      
      {/* Subtle minimalist grid background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      
      {/* Clean elegant glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ea580c] opacity-[0.07] blur-[150px] rounded-[100%] pointer-events-none" />
      
      <div className="w-full relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Badge */}
          {data.badge && (
            <div className="animate-fade-in-up stagger-1 mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-widest font-bold text-white/70 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse shadow-[0_0_8px_#ea580c]" />
              {data.badge}
            </div>
          )}
          
          {/* Title */}
          <h1 className="animate-blur-in stagger-2 text-[32px] sm:text-5xl lg:text-[72px] font-extrabold text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl">
            {data.title.split('SAYBA ARC').map((part, i, arr) => 
              i === arr.length - 1 ? part : <span key={i}>{part}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] to-[#fbbf24]">SAYBA ARC</span></span>
            )}
          </h1>
          
          {/* Subtitle */}
          <p className="animate-fade-in-up stagger-3 text-white/60 text-sm md:text-xl leading-relaxed max-w-3xl mx-auto mb-12 font-medium">
            {data.subtitle}
          </p>
          
          {/* Buttons */}
          <div className="animate-fade-in-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={data.primaryButton.href} className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold bg-[#ea580c] text-white hover:bg-[#c2410c] transition-all duration-200 hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:-translate-y-1 text-[13px] tracking-wide uppercase">
              {data.primaryButton.text}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href={data.secondaryButton.href} className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-1 text-[13px] tracking-wide uppercase backdrop-blur-sm">
              {data.secondaryButton.text}
            </Link>
          </div>
          
          {/* Minimalist Trust Badges */}
          <div className="animate-fade-in-up stagger-5 mt-16 md:mt-24 flex justify-center gap-8 sm:gap-16 pt-8 md:pt-10 border-t border-white/[0.08]">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">50+</span>
              <span className="text-[9px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-bold">Proyek Selesai</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">100%</span>
              <span className="text-[9px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-bold">Keberhasilan</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">4+</span>
              <span className="text-[9px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-bold">Keahlian Inti</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
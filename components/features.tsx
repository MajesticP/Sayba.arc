"use client"

import { useEffect, useRef, useState } from "react"
import { DynamicIcon } from "@/lib/dynamic-icon"

interface FeatureItem { icon: string; title: string; description: string }
interface FeaturesProps { title: string; subtitle: string; items: FeatureItem[] }

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export default function Features({ title, subtitle, items }: FeaturesProps) {
  const header = useInView()
  const grid = useInView(0.08)

  return (
    <section className="relative overflow-hidden bg-[#f8f9fa] pt-14 pb-16 md:pt-24 md:pb-28" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={header.ref} className={`text-center mb-8 md:mb-16 transition-all duration-700 ease-out ${header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block text-[10px] md:text-[12px] font-bold text-[#ff914d] uppercase tracking-widest mb-3 border border-[#ff914d]/30 bg-white px-3 py-1 rounded-full shadow-sm">Keunggulan Kami</span>
          <div className={`h-1.5 md:h-2 rounded-full bg-[#ff914d]/20 max-w-[60px] mx-auto mb-4 md:mb-5 transition-all duration-1000 ${header.inView ? "w-full" : "w-0"}`} style={{ transitionDelay: "200ms" }} />
          <h2 className="text-[22px] md:text-5xl font-black text-black mb-2 md:mb-5 tracking-tight">{title}</h2>
          <p className="text-black/50 text-[13px] md:text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </div>

        <div ref={grid.ref} className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
          {items.map((feature, index) => (
            <div key={index}
              className={`group bg-white hover:bg-white border border-black/5 hover:border-[#ff914d]/30 rounded-2xl md:rounded-3xl p-5 md:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] ${grid.inView ? "animate-card-reveal" : "opacity-0"}`}
              style={{ animationDelay: `${index * 80}ms` }}>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-[14px] md:rounded-[18px] bg-white border border-[#ff914d]/30 shadow-sm flex items-center justify-center mb-4 md:mb-6 group-hover:bg-[#ff914d]/10 group-hover:scale-110 transition-all duration-300">
                <DynamicIcon name={feature.icon} color="#ff914d" size={24} className="hidden md:block" />
                <DynamicIcon name={feature.icon} color="#ff914d" size={20} className="md:hidden" />
              </div>
              <h3 className="text-black font-black text-[15px] md:text-[22px] mb-2 leading-snug group-hover:text-[#ff914d] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-black/50 text-[12px] sm:text-[12.5px] md:text-[15px] leading-relaxed group-hover:text-black/70 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

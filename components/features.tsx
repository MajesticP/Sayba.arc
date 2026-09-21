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
    <section className="pt-20 pb-24 md:pt-32 md:pb-36 bg-black" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={header.ref} className={`text-center mb-12 md:mb-20 transition-all duration-700 ease-out ${header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block text-[11px] font-bold text-[#ea580c] uppercase tracking-[0.2em] mb-4">Keunggulan Kami</span>
          <h2 className="text-[28px] md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight max-w-3xl mx-auto">{title}</h2>
          <p className="text-white/50 text-[14px] md:text-lg max-w-2xl mx-auto font-medium">{subtitle}</p>
        </div>

        <div ref={grid.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((feature, index) => (
            <div key={index}
              className={`group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:border-[#ea580c]/30 ${grid.inView ? "animate-card-reveal" : "opacity-0"}`}
              style={{ animationDelay: `${index * 80}ms` }}>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 group-hover:bg-[#ea580c]/15 transition-colors duration-300 border border-white/[0.05]">
                <DynamicIcon name={feature.icon} color="#ea580c" size={24} />
              </div>
              <h3 className="text-white font-bold text-[16px] md:text-lg mb-3 leading-snug group-hover:text-[#ea580c] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-white/50 text-[13px] md:text-[15px] leading-relaxed transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
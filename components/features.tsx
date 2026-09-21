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
    <section className="py-10 md:py-24 bg-carbon" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div ref={header.ref} className={`text-center mb-8 md:mb-16 transition-all duration-700 ease-out ${header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-block text-[10px] font-bold text-powder uppercase tracking-widest mb-2">Keunggulan Kami</span>
          <div className={`h-px bg-steel/40 max-w-xs mx-auto mb-3 transition-all duration-1000 ${header.inView ? "w-full" : "w-0"}`} style={{ transitionDelay: "200ms" }} />
          <h2 className="text-[20px] md:text-4xl font-bold text-platinum mb-1.5 md:mb-4">{title}</h2>
          <p className="text-steel text-[13px] md:text-base max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div ref={grid.ref} className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
          {items.map((feature, index) => (
            <div key={index}
              className={`group bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 hover:border-powder/35 rounded-xl p-3.5 md:p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-powder/5 ${grid.inView ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 80}ms` }}>
              <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg bg-powder/20 flex items-center justify-center mb-2.5 md:mb-4 group-hover:bg-powder/35 group-hover:scale-110 transition-all duration-300">
                <DynamicIcon name={feature.icon} color="#a9b4c2" size={17} />
              </div>
              <h3 className="text-platinum font-bold text-[13px] md:text-base mb-1 leading-snug group-hover:text-powder transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-steel text-[11px] md:text-sm leading-relaxed group-hover:text-platinum/70 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { DynamicIcon } from "@/lib/dynamic-icon"

interface FeatureItem {
  icon: string
  title: string
  description: string
}

interface FeaturesProps {
  title: string
  subtitle: string
  items: FeatureItem[]
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export default function Features({ title, subtitle, items }: FeaturesProps) {
  const header = useInView()
  const grid = useInView(0.08)

  return (
    <section className="py-14 md:py-24 bg-black" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          ref={header.ref}
          className={`text-center mb-10 md:mb-16 transition-all duration-700 ease-out ${
            header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3">
            Keunggulan Kami
          </span>
          {/* Animated underline */}
          <div className={`h-px bg-[#ff914d]/40 max-w-xs mx-auto mb-4 transition-all duration-1000 ${header.inView ? "w-full" : "w-0"}`} style={{ transitionDelay: "200ms" }} />
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">{title}</h2>
          <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Cards grid with stagger */}
        <div ref={grid.ref} className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-5">
          {items.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 hover:border-[#ff914d]/35 rounded-xl md:rounded-2xl p-3 md:p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#ff914d]/5 ${
                grid.inView ? "animate-card-reveal" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-[#ff914d]/20 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-[#ff914d]/35 group-hover:scale-110 transition-all duration-300">
                <DynamicIcon name={feature.icon} color="#ff914d" size={18} />
              </div>
              <h3 className="text-white font-bold text-xs md:text-base mb-1 md:mb-2 leading-snug group-hover:text-[#ff914d] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-white/40 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none group-hover:text-white/55 transition-colors duration-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

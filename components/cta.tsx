"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import CuttingBoardBackground from "@/components/cutting-board-bg"

interface CTAData { title: string; subtitle: string; buttonText: string; buttonHref: string }

export default function CTA({ data }: { data: CTAData }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <section className="py-10 md:py-24 bg-ice-dim" id="cta">
      <div ref={ref} className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <div className="bg-navy rounded-2xl md:rounded-3xl p-7 md:p-16 text-center relative overflow-hidden">
          <CuttingBoardBackground tone="dark" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-steel/60 to-transparent" />
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 bg-orange rounded-full transition-all duration-1000 ${inView ? "w-28" : "w-0"}`} style={{ transitionDelay: "400ms" }} />

          <div className="relative z-10">
            <h2 className={`text-[22px] md:text-5xl font-bold text-ice mb-2 md:mb-4 leading-tight transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
              {data.title}
            </h2>
            <p className={`text-orange text-[13px] md:text-lg mb-6 md:mb-10 max-w-2xl mx-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "320ms" }}>
              {data.subtitle}
            </p>
            <div className={`transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} style={{ transitionDelay: "440ms" }}>
              <Link href={data.buttonHref} className="inline-block px-8 py-3.5 rounded-xl font-bold text-[15px] bg-orange text-navy hover:bg-orange transition-all duration-200 hover:shadow-2xl hover:shadow-powder/30 hover:scale-105 active:scale-95">
                {data.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

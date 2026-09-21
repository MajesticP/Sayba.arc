"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

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
    <section className="pt-16 pb-12 md:py-24 bg-black" id="cta">
      <div ref={ref} className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <div className="bg-white/[0.03] rounded-2xl md:rounded-3xl p-7 md:p-16 text-center relative overflow-hidden border border-white/[0.06] shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ea580c]/60 to-transparent" />
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 bg-[#ea580c] rounded-full transition-all duration-1000 ${inView ? "w-28" : "w-0"}`} style={{ transitionDelay: "400ms" }} />

          {/* Deep immersive glow inside card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-[#ea580c] opacity-[0.05] blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <h2 className={`text-[24px] md:text-5xl font-extrabold text-white mb-2 md:mb-4 leading-tight transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
              {data.title}
            </h2>
            <p className={`text-white/50 text-[13px] md:text-lg mb-6 md:mb-10 max-w-2xl mx-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "320ms" }}>
              {data.subtitle}
            </p>
            <div className={`transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} style={{ transitionDelay: "440ms" }}>
              <Link href={data.buttonHref} className="inline-block px-8 py-3.5 rounded-xl font-bold text-[15px] bg-[#ea580c] text-white hover:bg-[#c2410c] transition-all duration-200 hover:shadow-2xl hover:shadow-[#ea580c]/40 hover:scale-105 active:scale-95">
                {data.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
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
    <section className="pt-16 pb-12 md:py-24 bg-[#f8f9fa]" id="cta" ref={ref}>
      <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <div className="bg-black rounded-[24px] md:rounded-[32px] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-xl shadow-black/5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/60 to-transparent" />
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 bg-[#ff914d] rounded-full transition-all duration-1000 ${inView ? "w-28" : "w-0"}`} style={{ transitionDelay: "400ms" }} />

          <div className="relative z-10">
            <h2 className={`text-[26px] sm:text-3xl md:text-5xl font-black text-white mb-3 md:mb-5 leading-tight tracking-tight transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
              {data.title}
            </h2>
            <p className={`text-white/45 text-[14px] sm:text-[15px] md:text-[18px] mb-8 md:mb-10 max-w-2xl mx-auto transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "320ms" }}>
              {data.subtitle}
            </p>
            <div className={`transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} style={{ transitionDelay: "440ms" }}>
              <Link href={data.buttonHref} className="btn-shine inline-block px-8 py-3.5 md:px-10 md:py-4 rounded-xl font-bold text-[15px] md:text-[16px] bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105 active:scale-95">
                {data.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

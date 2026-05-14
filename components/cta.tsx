"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface CTAData {
  title: string
  subtitle: string
  buttonText: string
  buttonHref: string
}

export default function CTA({ data }: { data: CTAData }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="py-14 md:py-24 bg-[#f7f7f7]" id="cta">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="bg-black rounded-3xl p-8 md:p-16 text-center relative overflow-hidden group">
          {/* Animated orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#ff914d] animate-orb-pulse pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#ff914d] animate-orb-pulse-2 pointer-events-none" style={{ animationDelay: "2.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#ff914d] opacity-[0.03] animate-spin-slow pointer-events-none border border-[#ff914d]/10" />

          {/* Animated top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/60 to-transparent" />
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 bg-[#ff914d] rounded-full transition-all duration-1000 ${
              inView ? "w-32" : "w-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          />

          <div className="relative z-10">
            <h2
              className={`text-2xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              {data.title}
            </h2>
            <p
              className={`text-white/45 text-base md:text-lg mb-7 md:mb-10 max-w-2xl mx-auto transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "320ms" }}
            >
              {data.subtitle}
            </p>
            <div
              className={`transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              style={{ transitionDelay: "440ms" }}
            >
              <Link
                href={data.buttonHref}
                className="btn-shine inline-block px-10 py-4 rounded-xl font-bold text-base bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105 active:scale-95 animate-glow"
              >
                {data.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

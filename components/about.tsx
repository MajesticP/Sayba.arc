"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import ThreeGlobe from "./three-globe"

interface AboutData {
  title: string; description: string
  stats: Array<{ value: string; label: string }>
  buttonText: string; buttonHref: string
}

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

function useCountUp(target: string, active: boolean) {
  const [display, setDisplay] = useState("0")
  useEffect(() => {
    if (!active) return
    const num = parseInt(target.replace(/\D/g, ""))
    const suffix = target.replace(/[\d]/g, "")
    if (isNaN(num)) { setDisplay(target); return }
    const duration = 1200; const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * num) + suffix)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target])
  return display
}

function StatCard({ value, label, active, delay }: { value: string; label: string; active: boolean; delay: number }) {
  const count = useCountUp(value, active)
  return (
    <div className={`bg-white/[0.03] rounded-2xl p-4 md:p-6 border border-white/[0.06] hover:border-[#ea580c]/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(255,145,77,0.05)] ${active ? "animate-card-reveal" : "opacity-0"}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#ea580c] to-[#ffb382] mb-1.5 tracking-tighter">{count}</div>
      <div className="text-white/40 text-[11px] md:text-xs font-bold uppercase tracking-[0.1em]">{label}</div>
    </div>
  )
}

export default function About({ data }: { data: AboutData }) {
  const left = useInView(); const right = useInView()

  return (
    <section className="py-20 md:py-32 bg-black" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Stats panel */}
          <div ref={left.ref} className={`relative transition-all duration-700 ease-out ${left.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#ea580c]/10 to-transparent blur-3xl opacity-50 rounded-full" />
            
            {/* 3D Globe */}
            <div className="relative flex justify-center mb-6 md:mb-8">
              <ThreeGlobe width={300} height={300} />
            </div>
            
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {data.stats.map((stat, index) => (
                <StatCard key={index} value={stat.value} label={stat.label} active={left.inView} delay={index * 100} />
              ))}
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-[#ff914d] opacity-15 -z-10 animate-float-up" style={{ animationDuration: "4s" }} />
          </div>

          {/* Text */}
          <div ref={right.ref} className={`space-y-6 md:space-y-8 transition-all duration-700 ease-out ${right.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`} style={{ transitionDelay: "150ms" }}>
            <div>
              <span className="inline-block text-[11px] font-bold text-[#ea580c] uppercase tracking-[0.2em] mb-4">Tentang Kami</span>
              <h2 className="text-[28px] md:text-5xl font-extrabold text-white leading-tight tracking-tight">{data.title}</h2>
            </div>
            <p className="text-white/50 text-[14px] md:text-lg leading-relaxed font-medium">{data.description}</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
              <Link href={data.buttonHref} className="w-full sm:w-auto text-center px-8 py-4 rounded-full font-bold text-[13px] uppercase tracking-wide bg-[#ea580c] text-white hover:bg-[#ff7a28] transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,145,77,0.3)] hover:-translate-y-1">
                {data.buttonText}
              </Link>
              <Link href="/services" className="w-full sm:w-auto text-center px-8 py-4 rounded-full font-bold text-[13px] uppercase tracking-wide bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                Layanan Kami
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

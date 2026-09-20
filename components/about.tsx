"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

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
    <div className={`bg-white/[0.05] rounded-xl p-3 md:p-5 border border-white/8 hover:border-[#ff914d]/35 transition-all duration-500 hover:-translate-y-1 ${active ? "animate-card-reveal" : "opacity-0"}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="text-[22px] md:text-3xl font-bold text-[#ff914d] mb-0.5">{count}</div>
      <div className="text-white/40 text-[11px] md:text-sm">{label}</div>
    </div>
  )
}

export default function About({ data }: { data: AboutData }) {
  const left = useInView(); const right = useInView()

  return (
    <section className="pt-16 pb-12 md:py-24 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">

          {/* Stats panel */}
          <div ref={left.ref} className={`relative transition-all duration-700 ease-out ${left.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="bg-black rounded-2xl p-5 md:p-10">
              <div className="grid grid-cols-2 gap-2.5 md:gap-5">
                {data.stats.map((stat, index) => (
                  <StatCard key={index} value={stat.value} label={stat.label} active={left.inView} delay={index * 100} />
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-[#ff914d] opacity-15 -z-10 animate-float-up" style={{ animationDuration: "4s" }} />
          </div>

          {/* Text */}
          <div ref={right.ref} className={`space-y-3.5 md:space-y-6 transition-all duration-700 ease-out ${right.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`} style={{ transitionDelay: "150ms" }}>
            <div>
              <span className="inline-block text-[10px] font-bold text-[#ff914d] uppercase tracking-widest mb-1.5">Tentang Kami</span>
              <div className={`h-px bg-[#ff914d]/30 mb-2.5 transition-all duration-1000 ${right.inView ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
              <h2 className="text-[20px] md:text-4xl font-bold text-black leading-tight">{data.title}</h2>
            </div>
            <p className="text-black/55 text-[13px] md:text-lg leading-relaxed">{data.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={data.buttonHref} className="btn-shine px-5 py-2.5 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:scale-105 active:scale-95 text-[13px]">
                {data.buttonText}
              </Link>
              <Link href="/services" className="px-5 py-2.5 rounded-xl font-semibold bg-black text-white hover:bg-black/80 transition-all duration-200 hover:scale-105 active:scale-95 text-[13px]">
                Layanan Kami
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

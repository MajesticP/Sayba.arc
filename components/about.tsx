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
      <div className="text-lg sm:text-[22px] md:text-3xl font-bold text-[#ff914d] mb-0.5">{count}</div>
      <div className="text-white/40 text-[10px] sm:text-[11px] md:text-sm leading-tight">{label}</div>
    </div>
  )
}

export default function About({ data }: { data: AboutData }) {
  const left = useInView(); const right = useInView()

  return (
    <section className="bg-white py-14 md:py-28" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Stats panel */}
          <div ref={left.ref} className={`relative transition-all duration-700 ease-out ${left.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="bg-black rounded-2xl p-4 sm:p-5 md:p-10">
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-5">
                {data.stats.map((stat, index) => (
                  <StatCard key={index} value={stat.value} label={stat.label} active={left.inView} delay={index * 100} />
                ))}
              </div>
            </div>
          </div>

          {/* Text */}
          <div ref={right.ref} className={`space-y-3.5 md:space-y-6 transition-all duration-700 ease-out ${right.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`} style={{ transitionDelay: "150ms" }}>
            <div>
              <span className="inline-block text-[10px] md:text-[12px] font-bold text-[#ff914d] uppercase tracking-widest mb-2 border border-[#ff914d]/30 bg-white px-3 py-1 rounded-full shadow-sm">Tentang Kami</span>
              <div className={`h-1.5 md:h-2 rounded-full bg-[#ff914d]/20 max-w-[60px] mb-4 md:mb-5 transition-all duration-1000 ${right.inView ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
              <h2 className="text-[24px] md:text-[32px] lg:text-4xl font-black text-black leading-tight tracking-tight">{data.title}</h2>
            </div>
            <p className="text-black/55 text-[14px] sm:text-[15px] md:text-lg leading-relaxed">{data.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={data.buttonHref} className="px-5 py-2.5 rounded-full font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:scale-105 active:scale-95 text-[13px]">
                {data.buttonText}
              </Link>
              <Link href="/services" className="px-5 py-2.5 rounded-full font-semibold bg-black text-white hover:bg-black/80 transition-all duration-200 hover:scale-105 active:scale-95 text-[13px]">
                Layanan Kami
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

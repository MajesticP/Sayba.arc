"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface AboutData {
  title: string
  description: string
  stats: Array<{ value: string; label: string }>
  buttonText: string
  buttonHref: string
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

function useCountUp(target: string, active: boolean) {
  const [display, setDisplay] = useState("0")
  useEffect(() => {
    if (!active) return
    const num = parseInt(target.replace(/\D/g, ""))
    const suffix = target.replace(/[\d]/g, "")
    if (isNaN(num)) { setDisplay(target); return }
    const duration = 1200
    const start = performance.now()
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
    <div
      className={`bg-white/[0.05] rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/8 hover:border-[#ff914d]/35 transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.08] ${
        active ? "animate-card-reveal" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-2xl md:text-3xl font-bold text-[#ff914d] mb-0.5 md:mb-1">{count}</div>
      <div className="text-white/40 text-xs md:text-sm">{label}</div>
    </div>
  )
}

export default function About({ data }: { data: AboutData }) {
  const left = useInView()
  const right = useInView()

  return (
    <section className="py-8 md:py-24 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Stats panel — slide in from left */}
          <div
            ref={left.ref}
            className={`relative transition-all duration-700 ease-out ${
              left.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="bg-black rounded-2xl md:rounded-3xl p-5 md:p-10 hover:shadow-2xl hover:shadow-[#ff914d]/5 transition-shadow duration-500">
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {data.stats.map((stat, index) => (
                  <StatCard key={index} value={stat.value} label={stat.label} active={left.inView} delay={index * 100} />
                ))}
              </div>

              {/* Mini map */}
              <div className="mt-6 rounded-xl bg-white/[0.04] border border-white/8 p-4 relative overflow-hidden group hover:border-[#ff914d]/20 transition-colors duration-300">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255,145,77,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.4) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                  }}
                />
                <svg className="w-full h-24 relative z-10 opacity-80" viewBox="0 0 300 100">
                  <polygon points="30,20 100,10 150,40 120,80 20,70" fill="rgba(255,145,77,0.2)" stroke="rgba(255,145,77,0.6)" strokeWidth="1" />
                  <polygon points="130,30 220,20 270,60 230,90 100,75" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <circle cx="75" cy="45" r="5" fill="#ff914d" />
                  <circle cx="75" cy="45" r="10" fill="#ff914d" opacity="0.3">
                    <animate attributeName="r" values="7;16;7" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="190" cy="55" r="4" fill="white" opacity="0.5" />
                </svg>
                <div className="text-xs text-white/30 text-center mt-1 relative z-10">Kalimantan Barat, Indonesia</div>
              </div>
            </div>
            {/* Orange accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-[#ff914d] opacity-15 -z-10 animate-float-up" style={{ animationDuration: "4s" }} />
          </div>

          {/* Text — slide in from right */}
          <div
            ref={right.ref}
            className={`space-y-4 md:space-y-6 transition-all duration-700 ease-out ${
              right.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            <div>
              <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-2 md:mb-3">
                Tentang Kami
              </span>
              <div className={`h-px bg-[#ff914d]/30 mb-3 transition-all duration-1000 ${right.inView ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
              <h2 className="text-2xl md:text-4xl font-bold text-black leading-tight">{data.title}</h2>
            </div>
            <p className="text-black/55 text-sm md:text-lg leading-relaxed">{data.description}</p>

            <div className="flex flex-wrap gap-2 md:gap-3 pt-1">
              <Link
                href={data.buttonHref}
                className="btn-shine px-5 py-2.5 md:py-3 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105 active:scale-95 text-sm"
              >
                {data.buttonText}
              </Link>
              <Link
                href="/services"
                className="px-5 py-2.5 md:py-3 rounded-xl font-semibold bg-black text-white hover:bg-black/80 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
              >
                Layanan Kami
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

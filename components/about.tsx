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

function StatCard({ value, label, active, delay }: { value: string; label: string; active: boolean; delay: number }) {
  // Angka ditampilkan statis, tanpa count-up. Tahun kalender (2025) tidak
  // masuk akal kalau dianimasikan dari nol, dan gerakan itu juga mengabaikan
  // preferensi reduced-motion. Reveal tetap ada lewat fade-in-up yang sudah
  // dimatikan otomatis di globals.css saat pengguna minta reduce motion.
  return (
    <div className={`bg-white/[0.05] rounded-xl p-3 md:p-5 border border-white/8 hover:border-orange/35 transition-all duration-500 hover:-translate-y-1 ${active ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="text-[22px] md:text-3xl font-bold text-ice mb-0.5">{value}</div>
      <div className="text-orange text-[11px] md:text-sm">{label}</div>
    </div>
  )
}

export default function About({ data }: { data: AboutData }) {
  const left = useInView(); const right = useInView()

  return (
    <section className="py-8 md:py-24 bg-ice" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">

          {/* Stats panel */}
          <div ref={left.ref} className={`relative transition-all duration-700 ease-out ${left.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="bg-navy rounded-2xl p-5 md:p-10">
              <div className="grid grid-cols-2 gap-2.5 md:gap-5">
                {data.stats.map((stat, index) => (
                  <StatCard key={index} value={stat.value} label={stat.label} active={left.inView} delay={index * 100} />
                ))}
              </div>
              {/* Mini map */}
              <div className="mt-4 rounded-xl bg-white/[0.04] border border-white/8 p-3 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(169,180,194,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(169,180,194,0.4) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                <svg className="w-full h-20 relative z-10 opacity-80" viewBox="0 0 300 100">
                  <polygon points="30,20 100,10 150,40 120,80 20,70" fill="rgba(169,180,194,0.2)" stroke="rgba(169,180,194,0.6)" strokeWidth="1" />
                  <polygon points="130,30 220,20 270,60 230,90 100,75" fill="rgba(238,241,239,0.05)" stroke="rgba(238,241,239,0.2)" strokeWidth="1" />
                  <circle cx="75" cy="45" r="5" fill="#f07a26" />
                  <circle cx="190" cy="55" r="4" fill="#f4f6f9" opacity="0.5" />
                </svg>
                <div className="text-[11px] text-orange/70 text-center mt-1 relative z-10">Kalimantan Barat, Indonesia</div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div ref={right.ref} className={`space-y-3.5 md:space-y-6 transition-all duration-700 ease-out ${right.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`} style={{ transitionDelay: "150ms" }}>
            <div>
              <span className="inline-block text-[10px] font-bold text-slate-brand uppercase tracking-widest mb-1.5">Tentang Kami</span>
              <div className={`h-px bg-orange/40 mb-2.5 transition-all duration-1000 ${right.inView ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
              <h2 className="text-[20px] md:text-4xl font-bold text-navy leading-tight">{data.title}</h2>
            </div>
            <p className="text-slate-brand text-[13px] md:text-lg leading-relaxed">{data.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={data.buttonHref} className="px-5 py-2.5 rounded-xl font-semibold bg-orange text-navy hover:bg-orange transition-all duration-200 hover:scale-105 active:scale-95 text-[13px]">
                {data.buttonText}
              </Link>
              <Link href="/services" className="px-5 py-2.5 rounded-xl font-semibold bg-navy text-ice hover:bg-navy/80 transition-all duration-200 hover:scale-105 active:scale-95 text-[13px]">
                Layanan Kami
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

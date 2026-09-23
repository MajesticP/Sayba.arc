"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { BoardSection } from "@/components/cutting-board-bg"

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
  //
  // Label memakai `text-orange-soft` pada opasitas penuh, bukan `text-orange/70`.
  // Orange pada 70% opasitas menyatu dengan navy di belakangnya sehingga
  // rasionya jatuh di bawah 4.5:1; orange-soft penuh 7.36:1.
  return (
    // Kartu statistik: efek sorot kursor disamakan dengan kartu konten lain.
    // Kemiringannya tidak dipakai di sini karena kartunya kecil dan angkanya
    // dibaca sekilas — memiringkannya justru menyulitkan.
    <div className={`kartu-sorot bg-white/[0.06] rounded-xl p-3 md:p-5 border border-white/10 hover:border-orange/45 transition-all duration-500 hover:-translate-y-1 ${active ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="text-[21px] md:text-3xl font-bold text-ice mb-1 tabular-nums leading-none">{value}</div>
      <div className="text-orange-soft text-[11px] md:text-[13px] leading-snug">{label}</div>
    </div>
  )
}

/**
 * About: section Tentang Kami.
 *
 * Dua kartu di dalam satu panel: panel statistik bernada navy di kiri, dan
 * kartu teks putih di kanan. Teks sengaja dibungkus kartu, bukan dibiarkan
 * jatuh di atas permukaan panel, supaya seluruh section punya permukaan yang
 * pasti dan tidak ada paragraf yang tampak mengambang tanpa bingkai.
 */
export default function About({ data }: { data: AboutData }) {
  const left = useInView(); const right = useInView()

  return (
    <BoardSection id="about" aria-labelledby="about-heading" panelClassName="panel-top-pad">
      <div className="panel-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-7 items-stretch">

          {/* Kartu statistik: satu-satunya bidang navy di section ini. */}
          <div ref={left.ref} className={`transition-all duration-700 ease-out ${left.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="bg-navy rounded-2xl p-5 md:p-8 h-full">
              <div className="grid grid-cols-2 gap-2.5 md:gap-4">
                {data.stats.map((stat, index) => (
                  <StatCard key={index} value={stat.value} label={stat.label} active={left.inView} delay={index * 100} />
                ))}
              </div>
              {/* Peta ringkas: memperlihatkan lokasi kerja, bukan hiasan. */}
              <div className="mt-4 rounded-xl bg-white/[0.05] border border-white/10 p-3 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(244,246,249,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(244,246,249,0.4) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                <svg className="w-full h-20 relative z-10 opacity-90" viewBox="0 0 300 100" role="img" aria-label="Peta ringkas wilayah kerja di Kalimantan Barat">
                  <polygon points="30,20 100,10 150,40 120,80 20,70" fill="rgba(244,246,249,0.20)" stroke="rgba(244,246,249,0.55)" strokeWidth="1" />
                  <polygon points="130,30 220,20 270,60 230,90 100,75" fill="rgba(244,246,249,0.05)" stroke="rgba(244,246,249,0.22)" strokeWidth="1" />
                  <circle cx="75" cy="45" r="5" fill="#f07a26" />
                  <circle cx="190" cy="55" r="4" fill="#f4f6f9" opacity="0.5" />
                </svg>
                <div className="text-[11.5px] text-ice/85 text-center mt-1.5 relative z-10">Kalimantan Barat, Indonesia</div>
              </div>
            </div>
          </div>

          {/* Kartu teks: putih, sejajar tinggi dengan kartu statistik. */}
          <div
            ref={right.ref}
            className={`transition-all duration-700 ease-out ${right.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
            style={{ transitionDelay: "150ms" }}
          >
            <div className="bg-white rounded-2xl border border-ice-line p-5 md:p-8 h-full flex flex-col">
              <div>
                <span className="inline-block text-[11px] font-bold text-orange-text uppercase tracking-widest mb-2">Tentang Kami</span>
                <h2 id="about-heading" className="text-[21px] md:text-[30px] font-bold text-navy leading-tight">{data.title}</h2>
                <div className={`h-px bg-orange mb-4 mt-3 transition-all duration-1000 ${right.inView ? "w-16" : "w-0"}`} style={{ transitionDelay: "300ms" }} />
              </div>
              <p className="text-slate-brand text-[13.5px] md:text-[15.5px] leading-relaxed">{data.description}</p>
              <div className="btn-row mt-6 md:mt-auto md:pt-7">
                <Link href={data.buttonHref} className="btn-solid">
                  {data.buttonText}
                </Link>
                <Link href="/services" className="btn-outline">
                  Layanan Kami
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BoardSection>
  )
}

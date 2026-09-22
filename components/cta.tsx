"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Mail } from "lucide-react"
import { BoardSection } from "@/components/cutting-board-bg"

interface CTAData { title: string; subtitle: string; buttonText: string; buttonHref: string }

/**
 * CTA: ajakan terakhir sebelum footer.
 *
 * Panelnya sengaja TERANG, bukan navy. Footer tepat di bawahnya bernyawa navy,
 * dan dua bidang navy yang berdampingan membuat keduanya menyatu sehingga
 * footer tampak lebih tinggi daripada yang sebenarnya. Permukaan terang di
 * antara keduanya memberi batas yang jelas dan menjaga tinggi footer terbaca
 * apa adanya.
 *
 * Aksen orange dipakai pada garis dan tombol saja, tidak pada teks di atas
 * latar terang, karena orange mentah gagal kontras bila dipakai menulis.
 */
export default function CTA({ data }: { data: CTAData }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold: 0.2 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <BoardSection id="cta" aria-labelledby="cta-heading" panelClassName="panel-top-pad">
      <div ref={ref} className="panel-pad py-0 md:py-2">
        <div className="text-center max-w-2xl mx-auto">

          {/* Garis ukur sebagai penanda mulai, bukan dekorasi: menandai bahwa
              bagian ini adalah penutup halaman. */}
          <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto mb-6 md:mb-7" aria-hidden="true">
            <span className="h-px flex-1 bg-orange/45" />
            <span className="w-1.5 h-1.5 rounded-full bg-orange" />
            <span className="h-px flex-1 bg-orange/45" />
          </div>

          <h2
            id="cta-heading"
            className={`text-[23px] md:text-[38px] font-bold text-navy mb-3 leading-tight transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "120ms" }}
          >
            {data.title}
          </h2>

          <p
            className={`text-slate-brand text-[14px] md:text-[16px] leading-relaxed mb-7 md:mb-9 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "240ms" }}
          >
            {data.subtitle}
          </p>

          <div
            className={`btn-row justify-center transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            style={{ transitionDelay: "360ms" }}
          >
            <Link href={data.buttonHref} className="btn-solid">
              {data.buttonText}
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn-quiet">
              <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
              Kirim email
            </Link>
          </div>
        </div>
      </div>
    </BoardSection>
  )
}

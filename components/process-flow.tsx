"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import type { ProcessStep } from "@/lib/database.types"

/**
 * ProcessFlow — diagram alir proses kerja layanan (horizontal, 6 tahap).
 *
 * Dipakai di halaman slug layanan (`service-detail-client.tsx`).
 * Bila admin belum mengisi kolom `process_steps`, dipakai 6 tahap bawaan
 * sesuai alur kerja SAYBA ARC: Konsultasi → SPK → Invoice DP → Review →
 * Invoice Pelunasan → Serah Terima.
 *
 * Bentuk visual mengikuti motif "meja potong" (DESIGN.md): garis ukur tipis
 * dengan penanda tahap, bukan kartu-kartu mengambang. Di layar lebar alur
 * dibaca mendatar; di layar sempit berubah menjadi stepper vertikal supaya
 * enam tahap tetap terbaca tanpa gulir horizontal.
 */

const DEFAULT_STEPS: ProcessStep[] = [
  { title: "Konsultasi", description: "Diskusi lingkup pekerjaan, kebutuhan data, dan target waktu penyelesaian." },
  { title: "SPK", description: "Surat Perintah Kerja disepakati dan ditandatangani sebagai dasar pelaksanaan." },
  { title: "Invoice DP", description: "Uang muka ditagihkan sesuai kesepakatan sebelum pekerjaan teknis dimulai." },
  { title: "Review", description: "Draf hasil diperiksa bersama; catatan revisi teknis dicatat dan dikerjakan." },
  { title: "Invoice Pelunasan", description: "Sisa pembayaran ditagihkan setelah hasil pekerjaan disetujui." },
  { title: "Serah Terima", description: "Berkas sumber, laporan teknis, dan dukungan pasca serah terima diserahkan." },
]

export default function ProcessFlow({ steps }: { steps?: ProcessStep[] }) {
  const items = steps && steps.length > 0 ? steps : DEFAULT_STEPS

  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Tahap ke-i muncul berurutan supaya mata mengikuti alur, bukan melihat blok jadi.
  const reveal = (i: number) =>
    `transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`

  return (
    <section className="mt-12 md:mt-16" aria-labelledby="process-flow-title">
      <h2
        id="process-flow-title"
        className="text-[18px] md:text-2xl font-bold text-carbon mb-1.5"
      >
        Proses Kerja Layanan
      </h2>
      <p className="text-[14px] text-slate-brand mb-6 md:mb-8 max-w-2xl">
        Enam tahap yang kami lalui bersama klien, dari konsultasi awal sampai serah terima berkas.
      </p>

      <div ref={ref} className="relative rounded-2xl border border-platinum-line bg-white p-5 md:p-8 overflow-hidden">
        {/* Kisi meja potong — sangat tipis, hanya memberi tekstur teknis */}
        <div className="cutting-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

        <div className="relative">
          {/* ── Layar lebar: alur mendatar ── */}
          <ol
            className="hidden lg:grid gap-4 list-none p-0 m-0"
            style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map((step, i) => (
              <li key={i} className={`relative flex flex-col items-center text-center ${reveal(i)}`} style={{ transitionDelay: `${i * 110}ms` }}>
                {/* Garis penghubung + arah panah ke tahap berikutnya */}
                {i < items.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-[22px] left-1/2 z-0 flex w-[calc(100%+1rem)] -translate-y-1/2 items-center"
                  >
                    <span
                      className={`h-px flex-1 origin-left bg-platinum-line transition-transform duration-700 ease-out ${inView ? "scale-x-100" : "scale-x-0"}`}
                      style={{ transitionDelay: `${i * 110 + 150}ms` }}
                    />
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-platinum-line" aria-hidden="true" />
                  </span>
                )}

                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-platinum-line bg-white text-[13px] font-bold text-carbon tabular-nums">
                  {i + 1}
                </span>

                <h3 className="relative z-10 text-[14px] font-semibold text-carbon leading-snug mt-3">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="relative z-10 text-[13px] text-slate-brand leading-relaxed mt-1.5">
                    {step.description}
                  </p>
                )}
              </li>
            ))}
          </ol>

          {/* ── Layar sempit: stepper vertikal ── */}
          <ol className="lg:hidden list-none p-0 m-0">
            {items.map((step, i) => (
              <li
                key={i}
                className={`relative flex gap-4 ${i < items.length - 1 ? "pb-6" : ""} ${reveal(i)}`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                {i < items.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[21px] top-11 bottom-0 w-px bg-platinum-line"
                  />
                )}

                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-platinum-line bg-white text-[13px] font-bold text-carbon tabular-nums">
                  {i + 1}
                </span>

                <div className="pt-1.5 min-w-0">
                  <h3 className="text-[14px] font-semibold text-carbon leading-snug">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-[13px] text-slate-brand leading-relaxed mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

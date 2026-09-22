"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { isGambarContoh } from "@/lib/image-path"
import Link from "next/link"
import { BoardSection } from "@/components/cutting-board-bg"
import type { PromoBanner } from "@/lib/database.types"

interface PromoCarouselProps {
  /** Baris tabel `promo_banner`: dikelola lewat Admin Dashboard */
  slides: PromoBanner[]
  /** Jeda geser otomatis (ms) */
  interval?: number
}

/** Link Google Drive → proxy gambar lokal, sama seperti layanan/informasi */
function gdriveToImg(url: string): string {
  if (!url || isGambarContoh(url)) return ""
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

/**
 * PromoCarousel: banner promosi, lembar kedua di atas meja potong.
 *
 * Panelnya sendiri yang menjadi bingkai banner, jadi banner tidak lagi
 * mengambang sebagai kotak terpisah di atas latar. Di ponsel banner tampil
 * dengan rasio lebih tinggi supaya gambar dan tombolnya tetap terbaca.
 */
export default function PromoCarousel({ slides, interval = 3000 }: PromoCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Preferensi gerakan: kalau pengguna minta reduce motion, carousel tidak
  // pernah geser sendiri (WCAG 2.2.2). Navigasi manual tetap tersedia.
  const [reduceMotion, setReduceMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

  // Banner tanpa gambar sah tidak ditampilkan: banner kosong lebih buruk
  // daripada tidak ada banner, dan berkas contoh sudah dihapus dari /public.
  const sah = slides.filter((sl) => gdriveToImg(sl.image_url) !== "")
  const count = sah.length

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Geser otomatis: berhenti saat hover, fokus, sentuh, tab tidak aktif,
  // atau saat pengguna memilih reduce motion.
  useEffect(() => {
    if (paused || reduceMotion || count < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => window.clearInterval(id)
  }, [paused, reduceMotion, count, interval])

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  if (!count) return null

  return (
    <BoardSection id="promo" aria-labelledby="promo-heading" panelClassName="panel-top-pad">
      <h2 id="promo-heading" className="sr-only">Promosi SAYBA ARC</h2>

      <div
        className="group relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={(e) => {
          setPaused(true)
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current
          touchStartX.current = null
          setPaused(false)
          if (start === null) return
          const delta = e.changedTouches[0].clientX - start
          if (Math.abs(delta) > 45) (delta < 0 ? next : prev)()
        }}
      >
        {/* Track */}
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {sah.map((slide) => {
            const hasCopy = Boolean(slide.title || slide.eyebrow || slide.subtitle)
            const cta = slide.cta_text && slide.cta_href ? { text: slide.cta_text, href: slide.cta_href } : null
            const body = (
              /* Rasio banner: 4:3 di ponsel supaya gambar tidak terpotong
                 separuh, lalu melebar mengikuti layar sampai 8:3 di desktop. */
              <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] md:aspect-[8/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gdriveToImg(slide.image_url)}
                  alt={slide.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />

                {hasCopy && (
                  // Di ponsel banner tampil sebagai gambar utuh: teks disembunyikan
                  // dengan `sr-only`, BUKAN `hidden`. Bedanya penting untuk SEO:
                  // Google memakai mobile-first indexing, jadi teks yang benar-benar
                  // dihapus dari DOM di ponsel ikut hilang dari indeks. Dengan
                  // sr-only teksnya tetap ada, terbaca crawler dan pembaca layar,
                  // hanya tidak terlihat. Mulai md tampil normal seperti biasa.
                  <div className="sr-only md:not-sr-only md:absolute md:inset-0">
                    {/* Scrim agar teks tetap terbaca: hanya perlu saat teks tampil */}
                    <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/65 to-transparent" />

                    <div className="md:relative md:h-full md:flex md:items-center">
                      <div className="md:px-12 lg:px-16 md:max-w-lg lg:max-w-xl">
                        {slide.eyebrow && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-orange/15 border border-orange/30 mb-1.5 md:mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange" aria-hidden="true" />
                            <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-orange-soft">
                              {slide.eyebrow}
                            </span>
                          </div>
                        )}

                        {slide.title && (
                          // H3: carousel punya heading section sendiri (H2 sr-only),
                          // jadi judul slide adalah level berikutnya (hindari H1→H3).
                          <h3 className="text-[15px] sm:text-2xl md:text-4xl font-bold text-ice leading-[1.15] tracking-tight line-clamp-2">
                            {slide.title}
                          </h3>
                        )}

                        {slide.subtitle && (
                          <p className="hidden sm:block text-ice/80 text-[13px] md:text-base mt-2 md:mt-3 leading-relaxed">
                            {slide.subtitle}
                          </p>
                        )}

                        {cta && (
                          <span className="mt-2 md:mt-6 inline-flex items-center gap-1.5 px-3 py-1 md:px-5 md:py-2.5 min-h-0 rounded-full bg-orange text-navy text-[10.5px] md:text-sm font-bold shadow-lg transition-transform duration-200 group-hover:scale-[1.03]">
                            {cta.text}
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )

            return (
              <div key={slide.id} className="w-full shrink-0">
                {cta ? (
                  <Link href={cta.href} className="block" aria-label={slide.title ?? slide.alt}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </div>
            )
          })}
        </div>

        {/* Panah: area ketuk 44px, visual lebih kecil di dalamnya */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Banner sebelumnya"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 min-h-0 rounded-full bg-navy/70 backdrop-blur-sm border border-ice/20 text-ice flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-orange hover:text-navy hover:border-orange transition-all duration-200"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Banner berikutnya"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 min-h-0 rounded-full bg-navy/70 backdrop-blur-sm border border-ice/20 text-ice flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-orange hover:text-navy hover:border-orange transition-all duration-200"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Indikator titik: wrapper tiap tombol 44x44px (WCAG 2.5.8),
            dot visualnya tetap kecil di tengah. */}
        {count > 1 && (
          <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex items-center px-1 rounded-full bg-navy/60 backdrop-blur-sm border border-ice/15">
            {sah.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ke banner ${i + 1}`}
                aria-current={i === index}
                className="flex items-center justify-center w-11 h-11 min-h-0 shrink-0 rounded-full"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-orange" : "w-1.5 bg-ice/55"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </BoardSection>
  )
}

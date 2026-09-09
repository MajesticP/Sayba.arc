"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { PromoBanner } from "@/lib/database.types"

interface PromoCarouselProps {
  /** Baris tabel `promo_banner` — dikelola lewat Admin Dashboard */
  slides: PromoBanner[]
  /** Jeda geser otomatis (ms) */
  interval?: number
}

/** Link Google Drive → proxy gambar lokal, sama seperti layanan/produk */
function gdriveToImg(url: string): string {
  if (!url) return url
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

export default function PromoCarousel({ slides, interval = 3000 }: PromoCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const count = slides.length

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Geser otomatis — berhenti saat hover, fokus, sentuh, atau tab tidak aktif
  useEffect(() => {
    if (paused || count < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => window.clearInterval(id)
  }, [paused, count, interval])

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  if (!count) return null

  return (
    <section className="bg-white pt-8 md:pt-16" aria-label="Banner promosi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative group rounded-xl md:rounded-3xl overflow-hidden border border-black/10 bg-black shadow-[0_10px_40px_rgba(0,0,0,0.10)]"
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
            {slides.map((slide) => {
              const hasCopy = Boolean(slide.title || slide.eyebrow || slide.subtitle)
              const cta = slide.cta_text && slide.cta_href ? { text: slide.cta_text, href: slide.cta_href } : null
              const body = (
                <div className="relative w-full aspect-[8/3]">
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
                    // dengan `sr-only`, BUKAN `hidden`. Bedanya penting untuk SEO —
                    // Google memakai mobile-first indexing, jadi teks yang benar-benar
                    // dihapus dari DOM di ponsel ikut hilang dari indeks. Dengan
                    // sr-only teksnya tetap ada, terbaca crawler dan pembaca layar,
                    // hanya tidak terlihat. Mulai md tampil normal seperti biasa.
                    <div className="sr-only md:not-sr-only md:absolute md:inset-0">
                      {/* Scrim agar teks tetap terbaca — hanya perlu saat teks tampil */}
                      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

                      <div className="md:relative md:h-full md:flex md:items-center">
                        <div className="md:px-12 lg:px-16 md:max-w-lg lg:max-w-xl">
                          {slide.eyebrow && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-[#ff914d]/15 border border-[#ff914d]/30 mb-1.5 md:mb-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
                              <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-[#ff914d]">
                                {slide.eyebrow}
                              </span>
                            </div>
                          )}

                          {slide.title && (
                            <h3 className="text-[15px] sm:text-2xl md:text-4xl font-black text-white leading-[1.15] tracking-tight line-clamp-2">
                              {slide.title}
                            </h3>
                          )}

                          {slide.subtitle && (
                            <p className="hidden sm:block text-white/55 text-[13px] md:text-base mt-2 md:mt-3 leading-relaxed">
                              {slide.subtitle}
                            </p>
                          )}

                          {cta && (
                            <span className="mt-2 md:mt-6 inline-flex items-center gap-1.5 px-3 py-1 md:px-5 md:py-2.5 min-h-0 rounded-full bg-[#ff914d] text-white text-[10.5px] md:text-sm font-semibold shadow-lg shadow-orange-500/20 transition-transform duration-200 group-hover:scale-[1.03]">
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

          {/* Panah */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Banner sebelumnya"
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 min-h-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[#ff914d] transition-all duration-200"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Banner berikutnya"
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 min-h-0 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[#ff914d] transition-all duration-200"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Indikator titik */}
          {count > 1 && (
            <div className="absolute bottom-2.5 md:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-sm border border-white/10">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ke banner ${i + 1}`}
                  aria-current={i === index}
                  className={`block h-1.5 min-h-0 shrink-0 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-[#ff914d]" : "w-1.5 bg-white/45 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

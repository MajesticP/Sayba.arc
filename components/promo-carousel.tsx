"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { isGambarContoh } from "@/lib/image-path"
import Link from "next/link"
import { ArrowRight, Pause, Play } from "lucide-react"
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
 * Gambar dan teks DIPISAH, tidak ditumpuk. Sebelumnya teks diletakkan di atas
 * gambar dengan tabir gelap (gradient) supaya terbaca, dan itu menutupi hampir
 * separuh gambar. Sekarang gambar tampil utuh tanpa lapisan apa pun, dan teks
 * berada di strip sendiri di bawahnya.
 *
 * Strip teks memakai tiga bagian: label + judul + subjudul di kiri, tombol di
 * kanan. Di ponsel stripnya menumpuk rapi, di desktop sejajar. Karena teks
 * tidak lagi berada di atas gambar, kontrasnya pasti: warna teks diukur di
 * atas permukaan strip, bukan di atas foto yang isinya berubah-ubah.
 *
 * Banner dengan teks kosong tetap tampil sebagai gambar saja, tanpa strip.
 */
export default function PromoCarousel({ slides, interval = 6000 }: PromoCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [jedaManual, setJedaManual] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [terlihat, setTerlihat] = useState(true)

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

  // Berhenti saat banner keluar layar.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setTerlihat(e.isIntersecting), { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  // Geser otomatis: berhenti saat hover, fokus, sentuh, tab tidak aktif,
  // keluar layar, tombol jeda ditekan, atau saat pengguna minta reduce motion.
  const berhenti = paused || jedaManual || reduceMotion || !terlihat
  useEffect(() => {
    if (berhenti || count < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => window.clearInterval(id)
  }, [berhenti, count, interval])

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  if (!count) return null

  return (
    <BoardSection id="promo" aria-labelledby="promo-heading" panelClassName="panel-top-pad">
      <h2 id="promo-heading" className="sr-only">Promosi SAYBA ARC</h2>

      {/* panel-pad: kelas padding yang sama dengan section lain, jadi gambar
          banner tidak menempel ke tepi panel di sisi mana pun. */}
      <div className="panel-pad pt-0">
      <div
        ref={wrapRef}
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
        {/* Track: satu slide = gambar utuh + strip teks di bawahnya. */}
        <div
          className="flex items-stretch transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {sah.map((slide) => {
            const hasCopy = Boolean(slide.title || slide.eyebrow || slide.subtitle)
            const cta = slide.cta_text && slide.cta_href ? { text: slide.cta_text, href: slide.cta_href } : null

            const gambar = (
              /* Rasio SAMA di ponsel dan desktop: 8:3 (persegi panjang).
                 Gambar tampil utuh, tanpa tabir dan tanpa teks di atasnya. */
              <div className="relative w-full aspect-[8/3] bg-ice-dim">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gdriveToImg(slide.image_url)}
                  alt={slide.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            )

            return (
              <div key={slide.id} className="w-full shrink-0">
                <div className="rounded-2xl overflow-hidden border border-ice-line bg-white">
                  {cta ? (
                    <Link href={cta.href} className="block" aria-label={slide.title ?? slide.alt}>
                      {gambar}
                    </Link>
                  ) : (
                    gambar
                  )}

                  {/* Strip teks: permukaan sendiri, bukan di atas gambar. */}
                  {hasCopy && (
                    <div className="border-t border-ice-line bg-white px-5 sm:px-6 py-4 md:py-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="min-w-0">
                          {slide.eyebrow && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ice-dim mb-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" aria-hidden="true" />
                              <span className="text-[10.5px] font-bold uppercase tracking-widest text-orange-text">
                                {slide.eyebrow}
                              </span>
                            </span>
                          )}
                          {slide.title && (
                            // H3: carousel punya heading section sendiri (H2 sr-only),
                            // jadi judul slide adalah level berikutnya (hindari H1→H3).
                            <h3 className="text-[16px] md:text-[20px] font-bold text-navy leading-snug">
                              {slide.title}
                            </h3>
                          )}
                          {slide.subtitle && (
                            <p className="text-[13px] md:text-[14px] text-slate-brand leading-relaxed mt-1 max-w-2xl">
                              {slide.subtitle}
                            </p>
                          )}
                        </div>

                        {cta && (
                          <Link href={cta.href} className="btn-solid shrink-0 self-start md:self-center">
                            {cta.text}
                            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Kendali: diletakkan di lapisan yang persis mengikuti kotak gambar
            (aspect 8:3), bukan kotak slide. Jadi jaraknya dari tepi gambar
            selalu sama, berapa pun tinggi strip teks di bawahnya, dan tidak
            ada kendali yang menempel atau menutupi teks. */}
        {count > 1 && (
          <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[8/3]">
            <button
              type="button"
              onClick={prev}
              aria-label="Banner sebelumnya"
              className="pointer-events-auto absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 min-h-0 rounded-full bg-navy/70 backdrop-blur-sm border border-ice/25 text-ice flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-orange hover:text-navy hover:border-orange transition-all duration-200"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Banner berikutnya"
              className="pointer-events-auto absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 min-h-0 rounded-full bg-navy/70 backdrop-blur-sm border border-ice/25 text-ice flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-orange hover:text-navy hover:border-orange transition-all duration-200"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="pointer-events-auto absolute right-3 md:right-4 bottom-3 md:bottom-4 flex items-center gap-2">
              {!reduceMotion && (
                <button
                  type="button"
                  onClick={() => setJedaManual((v) => !v)}
                  aria-label={jedaManual ? "Lanjutkan geser banner" : "Jeda geser banner"}
                  className="inline-flex items-center justify-center w-10 h-10 min-h-0 rounded-full bg-navy/70 backdrop-blur-sm border border-ice/25 text-ice hover:bg-orange hover:text-navy hover:border-orange transition-all duration-200"
                >
                  {jedaManual ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
                </button>
              )}

              <div className="flex items-center px-1 rounded-full bg-navy/70 backdrop-blur-sm border border-ice/25">
                {sah.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Ke banner ${i + 1}`}
                    aria-current={i === index}
                    className="flex items-center justify-center w-9 h-9 min-h-0 shrink-0 rounded-full"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ${
                        i === index ? "w-5 bg-orange" : "w-1.5 bg-ice/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </BoardSection>
  )
}

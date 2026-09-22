"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Pause, Play } from "lucide-react"
import { isGambarContoh } from "@/lib/image-path"
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
 * PromoCarousel: banner promosi.
 *
 * Bentuknya sengaja polos: gambar utuh tanpa lapisan apa pun, lalu satu baris
 * tipis di bawahnya berisi keterangan singkat dan tombol. Tidak ada teks di
 * atas gambar dan tidak ada gradient penutup, jadi seluruh bagian gambar
 * terlihat apa adanya.
 *
 * Rasio gambar 16:9 (1600 x 900), SAMA di ponsel dan desktop. Sebelumnya 8:3
 * yang di ponsel jadi sangat pendek, dan itu yang membuat bannernya terlihat
 * berbeda antara ponsel dan desktop.
 *
 * Tombolnya diatur dari Admin: teks tombol dan tautannya. Tautan boleh alamat
 * luar (https://...) maupun halaman di dalam situs (/services). Kalau salah
 * satu kosong, tombolnya tidak ditampilkan, dan bannernya tetap tampil sebagai
 * gambar saja.
 *
 * Geser otomatis berhenti saat kursor di atasnya, saat Tab masuk, saat tab
 * browser tidak aktif, saat banner keluar layar, saat tombol jeda ditekan, dan
 * saat pengguna memilih reduce motion (WCAG 2.2.2).
 */
export default function PromoCarousel({ slides, interval = 6000 }: PromoCarouselProps) {
  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState(false)
  const [fokus, setFokus] = useState(false)
  const [jedaManual, setJedaManual] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [terlihat, setTerlihat] = useState(true)
  const touchX = useRef<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Banner tanpa gambar sah tidak ditampilkan: banner kosong lebih buruk
  // daripada tidak ada banner, dan berkas contoh sudah dihapus dari /public.
  const sah = slides.filter((sl) => gdriveToImg(sl.image_url) !== "")
  const count = sah.length

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const up = () => setReduceMotion(mq.matches)
    up()
    mq.addEventListener("change", up)
    return () => mq.removeEventListener("change", up)
  }, [])

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

  const berhenti = hover || fokus || jedaManual || reduceMotion || !terlihat
  useEffect(() => {
    if (berhenti || count < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => window.clearInterval(id)
  }, [berhenti, count, interval])

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setTerlihat(false)
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  if (!count) return null

  return (
    <BoardSection id="promo" labelledBy="promo-heading" panelClassName="panel-top-pad">
      <h2 id="promo-heading" className="sr-only">Promosi SAYBA ARC</h2>

      <div className="panel-pad pt-0">
        <div
          ref={wrapRef}
          className="group relative"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocusCapture={() => setFokus(true)}
          onBlurCapture={() => setFokus(false)}
          onTouchStart={(e) => {
            setHover(true)
            touchX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            const start = touchX.current
            touchX.current = null
            setHover(false)
            if (start === null) return
            const delta = e.changedTouches[0].clientX - start
            if (Math.abs(delta) > 45) (delta < 0 ? next : prev)()
          }}
        >
          <div
            className="flex items-stretch transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {sah.map((slide) => {
              const cta = slide.cta_text && slide.cta_href ? { text: slide.cta_text, href: slide.cta_href } : null
              // Keterangan memakai Judul dan Subjudul dari admin. Judul jadi
              // baris utama, subjudul jadi baris pendukung. Eyebrow dipakai
              // sebagai cadangan kalau judulnya dikosongkan, supaya banner
              // lama yang hanya mengisi eyebrow tetap punya keterangan.
              const judul = slide.title || slide.eyebrow
              const adaBaris = Boolean(judul || slide.subtitle || cta)
              // Tautan luar dibuka di tab baru; tautan dalam situs memakai Link
              // supaya navigasinya tetap halus tanpa memuat ulang halaman.
              const luar = cta?.href.startsWith("http")

              return (
                <div key={slide.id} className="w-full shrink-0">
                  <div className="rounded-2xl overflow-hidden border border-ice-line bg-white">
                    {/* Gambar: 16:9, rasio sama di semua ukuran layar. */}
                    <div className="relative w-full aspect-[16/9] bg-ice-dim">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={gdriveToImg(slide.image_url)}
                        alt={slide.alt}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>

                    {/* Baris tipis: judul dan keterangan di kiri, tombol di
                        kanan. Kalau semuanya kosong, baris ini tidak
                        ditampilkan dan bannernya jadi gambar polos. */}
                    {adaBaris && (
                      <div className="border-t border-ice-line bg-white px-4 sm:px-6 py-3.5 md:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {judul || slide.subtitle ? (
                            <div className="min-w-0">
                              {judul && (
                                <p className="text-[14px] md:text-[15px] font-bold text-navy leading-snug line-clamp-1">
                                  {judul}
                                </p>
                              )}
                              {slide.subtitle && (
                                <p className="text-[12.5px] md:text-[13px] text-slate-brand leading-snug mt-0.5 line-clamp-2">
                                  {slide.subtitle}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span />
                          )}

                          {cta && (
                            luar ? (
                              <a
                                href={cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-solid shrink-0 self-start sm:self-center"
                              >
                                {cta.text}
                                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                              </a>
                            ) : (
                              <Link href={cta.href} className="btn-solid shrink-0 self-start sm:self-center">
                                {cta.text}
                                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                              </Link>
                            )
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
              (16:9), bukan kotak slide. Jadi jaraknya dari tepi gambar selalu
              sama berapa pun tinggi baris keterangan di bawahnya. */}
          {count > 1 && (
            <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[16/9]">
              <button
                type="button"
                onClick={prev}
                aria-label="Banner sebelumnya"
                className="pointer-events-auto absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 min-h-0 rounded-full bg-navy/70 backdrop-blur-sm border border-ice/25 text-ice flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-orange hover:text-navy hover:border-orange transition-all duration-200"
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

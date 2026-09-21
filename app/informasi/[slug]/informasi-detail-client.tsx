"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Link2,
  ListOrdered,
  MessageSquare,
  Tag,
} from "lucide-react"
import PageTransition from "@/components/page-transition"
import type { Informasi } from "@/lib/database.types"
import { formatInformasiDate } from "@/lib/informasi-data"

export interface KategoriItem {
  slug: string
  label: string
  color: string
}

interface Props {
  article: Informasi
  blocks: string[]
  related: Informasi[]
  heroImg: string | null
  /**
   * Kategori dari tabel `informasi_kategori` (dikelola lewat Admin Dashboard).
   * Opsional: bila tidak dikirim, label memakai slug apa adanya dan warna
   * memakai aksen netral (steel).
   */
  categories?: KategoriItem[]
}

/* ── Palet (DESIGN.md) ─────────────────────────────────────────────────────
 * carbon      #1c2321  teks utama / latar gelap
 * steel       #5e6572  aksen & teks sekunder — 5.9:1 di atas putih (WCAG AA)
 * powder      #c3cdd9  aksen terang di atas latar gelap
 * platinum    #f5f7f9  latar terang
 * carbon-800  #262f2c  permukaan terangkat di atas carbon
 * ------------------------------------------------------------------------ */
const ACCENT = "#5e6572"    // Blue Slate  — teks sekunder, 5.2:1 di platinum
const CARBON = "#1c2321"
const POWDER = "#a9b4c2"    // Powder Blue — aksen terang di latar gelap, 7.6:1
const PLATINUM = "#eef1ef"  // Platinum    — latar terang utama
const CARBON_800 = "#242c29" // permukaan terangkat di atas carbon
const LINE = "#d3dad6"      // garis pemisah di latar terang

/** Label & warna kategori dari prop; fallback netral bila belum tersedia. */
function resolveCategory(slug: string, categories?: KategoriItem[]): { label: string; color: string } {
  const found = categories?.find(
    (c) => c.slug === slug || c.label.toLowerCase() === slug.toLowerCase()
  )
  return { label: found?.label ?? slug, color: found?.color ?? ACCENT }
}

/* ── Pemecahan isi menjadi seksi per sub-judul ───────────────────────────── */
interface Section {
  /** null = blok pembuka sebelum sub-judul pertama (bukan entri daftar isi) */
  heading: string | null
  blocks: string[]
}

function groupSections(blocks: string[]): Section[] {
  const sections: Section[] = []
  let current: Section = { heading: null, blocks: [] }
  for (const block of blocks) {
    if (block.startsWith("## ")) {
      if (current.heading !== null || current.blocks.length > 0) sections.push(current)
      current = { heading: block.slice(3).trim(), blocks: [] }
    } else {
      current.blocks.push(block)
    }
  }
  if (current.heading !== null || current.blocks.length > 0) sections.push(current)
  return sections
}

/** Terapkan penebalan **teks** tanpa dangerouslySetInnerHTML */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold" style={{ color: CARBON }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function InformasiDetailClient({ article, blocks, related, heroImg, categories }: Props) {
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeHeading, setActiveHeading] = useState<string | null>(null)

  const { label: catLabel, color: catColor } = resolveCategory(article.category, categories)
  // Warna kategori dipakai HANYA untuk chip/badge identitas (latar bertint),
  // bukan untuk teks panjang. Semua teks aksen di latar terang memakai steel
  // (ACCENT, #5e6572) supaya dijamin lolos WCAG AA — 5.9:1 di atas putih.
  const accent = ACCENT

  const sections = useMemo(() => groupSections(blocks), [blocks])
  const toc = useMemo(
    () => sections.map((s) => s.heading).filter((h): h is string => !!h),
    [sections]
  )

  // Bilah kemajuan baca
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, Math.max(0, (el.scrollTop / total) * 100)) : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Sorot sub-judul yang sedang terlihat — hanya mengubah WARNA, bukan ukuran huruf.
  useEffect(() => {
    if (toc.length === 0) return
    const headings = Array.from(document.querySelectorAll("[data-info-heading]"))
    if (headings.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveHeading(visible[0].target.getAttribute("data-info-heading"))
      },
      { rootMargin: "-110px 0px -70% 0px", threshold: 0 }
    )
    headings.forEach((h) => obs.observe(h))
    return () => obs.disconnect()
  }, [toc])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* diabaikan — clipboard bisa diblokir browser */
    }
  }

  // Klik daftar isi → tandai seksi aktif lebih dulu (warnanya langsung berubah),
  // lalu gulir ke sub-judul terkait.
  const goToHeading = (heading: string) => {
    setActiveHeading(heading)
    const el = Array.from(document.querySelectorAll("[data-info-heading]")).find(
      (n) => n.getAttribute("data-info-heading") === heading
    )
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      {/* Bilah kemajuan baca */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%`, backgroundColor: catColor }}
        />
      </div>

      {/* ══ HERO — pita terang, beda dari banner halaman lain ══ */}
      <section className="relative overflow-hidden border-b" style={{ backgroundColor: PLATINUM, borderColor: LINE }}>
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(94,101,114,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(94,101,114,0.10) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute -top-24 right-0 w-80 h-80 rounded-full pointer-events-none opacity-[0.10] blur-3xl"
          style={{ backgroundColor: accent }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[92px] pb-10 md:pt-32 md:pb-16">
          <PageTransition>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[11.5px] mb-5 flex-wrap" style={{ color: ACCENT }} aria-label="Breadcrumb">
              <Link href="/" className="hover:opacity-80 transition-opacity">Beranda</Link>
              <ChevronRight className="w-3 h-3 opacity-50" aria-hidden="true" />
              <Link href="/informasi" className="hover:opacity-80 transition-opacity">Informasi</Link>
              <ChevronRight className="w-3 h-3 opacity-50" aria-hidden="true" />
              <span className="truncate max-w-[260px] font-medium" style={{ color: CARBON }}>{article.title}</span>
            </nav>

            <div className="flex items-center flex-wrap gap-2.5 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${catColor}1f`, color: catColor }}
              >
                {catLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: ACCENT }}>
                <Clock className="w-3 h-3" aria-hidden="true" />
                {article.read_minutes} menit baca
              </span>
              <span aria-hidden="true" style={{ color: ACCENT }} className="opacity-50">·</span>
              <span className="text-[11.5px]" style={{ color: ACCENT }}>{formatInformasiDate(article.published_at)}</span>
            </div>

            <h1 className="text-[24px] md:text-[40px] font-black leading-[1.18] tracking-tight mb-4" style={{ color: CARBON }}>
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-[14px] md:text-[16px] leading-[1.75] mb-6 max-w-[68ch]" style={{ color: ACCENT }}>
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t" style={{ borderColor: LINE }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black shrink-0"
                  style={{ backgroundColor: accent, color: "#ffffff" }}
                >
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-bold leading-tight" style={{ color: CARBON }}>{article.author}</div>
                  <div className="text-[11px] inline-flex items-center gap-1.5 mt-0.5" style={{ color: ACCENT }}>
                    <Eye className="w-3 h-3" aria-hidden="true" />
                    {article.views.toLocaleString("id-ID")} kali dibaca
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border text-[12px] font-semibold transition-colors hover:opacity-80"
                  style={{ borderColor: LINE, color: ACCENT }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Salin Tautan</span>
                    </>
                  )}
                </button>
                <Link
                  href="/informasi"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-[12px] font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: CARBON }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Semua Informasi</span>
                </Link>
              </div>
            </div>
          </PageTransition>
        </div>
      </section>

      {/* ══ ISI: dua kolom ══ */}
      <section className="flex-1 bg-white py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* ── Kiri: isi dokumen ── */}
            <div className="lg:col-span-8 min-w-0">
              {heroImg && (
                <figure className="relative aspect-[16/9] rounded-2xl overflow-hidden border mb-8 md:mb-10 shadow-sm" style={{ borderColor: LINE }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImg} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
                </figure>
              )}

              <article>
                {sections.map((section, si) => {
                  const isActive = section.heading !== null && section.heading === activeHeading
                  return (
                    <div key={si}>
                      {section.heading && (
                        <h2
                          data-info-heading={section.heading}
                          className="text-[18px] md:text-[24px] font-black mt-9 mb-4 pb-2.5 border-b flex items-start gap-2.5 scroll-mt-28 leading-snug transition-colors duration-200"
                          style={{
                            // Penanda aktif: warna teks + border kiri berubah.
                            // Ukuran huruf TIDAK berubah saat aktif.
                            color: isActive ? accent : CARBON,
                            borderColor: LINE,
                            borderLeft: isActive ? `3px solid ${ACCENT}` : "3px solid transparent",
                            paddingLeft: "12px",
                          }}
                        >
                          {section.heading}
                        </h2>
                      )}

                      {section.blocks.map((block, bi) => {
                        const lines = block.split("\n")
                        const isList =
                          lines.length > 1 &&
                          lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "))

                        // Paragraf pada seksi aktif berubah WARNA (bukan ukuran huruf).
                        const textColor = isActive ? accent : CARBON

                        if (isList) {
                          return (
                            <ul key={bi} className="space-y-2.5 my-5 pl-1 max-w-[70ch]">
                              {lines.map((l, li) => (
                                <li
                                  key={li}
                                  className="flex items-start gap-2.5 text-[15px] md:text-[16px] leading-[1.75] transition-colors duration-200"
                                  style={{ color: textColor }}
                                >
                                  <span
                                    className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: isActive ? ACCENT : LINE }}
                                    aria-hidden="true"
                                  />
                                  <span>{renderInline(l.trim().replace(/^[-*]\s*/, ""))}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        }

                        return (
                          <p
                            key={bi}
                            className="text-[15px] md:text-[16px] leading-[1.75] my-4 whitespace-pre-line max-w-[70ch] transition-colors duration-200"
                            style={{ color: textColor }}
                          >
                            {renderInline(block)}
                          </p>
                        )
                      })}
                    </div>
                  )
                })}
              </article>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-9 pt-6 border-t" style={{ borderColor: LINE }}>
                  <Tag className="w-3.5 h-3.5" style={{ color: ACCENT }} aria-hidden="true" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: PLATINUM, color: ACCENT }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-9 rounded-2xl p-6 md:p-8 relative overflow-hidden" style={{ backgroundColor: CARBON }}>
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: POWDER }} />
                <div className="absolute -top-16 right-0 w-56 h-56 rounded-full opacity-[0.12] blur-3xl pointer-events-none" style={{ backgroundColor: POWDER }} />

                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(195,205,217,0.15)", border: "1px solid rgba(195,205,217,0.3)" }}>
                    <MessageSquare className="w-5 h-5" style={{ color: POWDER }} aria-hidden="true" />
                  </div>
                  <h3 className="text-[18px] md:text-2xl font-black mb-2" style={{ color: "#ffffff" }}>
                    Ada pertanyaan tentang dokumen ini?
                  </h3>
                  <p className="text-[13px] md:text-[15px] leading-relaxed mb-5 max-w-lg" style={{ color: POWDER }}>
                    Tim teknis SAYBA ARC siap menjelaskan detail standar, alur kerja, atau kebutuhan khusus
                    instansi Anda.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={`https://wa.me/6287721916495?text=${encodeURIComponent(
                        `Halo SAYBA ARC, saya ingin bertanya mengenai dokumen informasi "${article.title}".`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: POWDER, color: CARBON }}
                    >
                      Tanya via WhatsApp
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                      style={{ backgroundColor: CARBON_800, color: POWDER, border: "1px solid rgba(195,205,217,0.2)" }}
                    >
                      Halaman Kontak
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Kanan: sidebar melekat ── */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28 space-y-4">

                {toc.length > 0 && (
                  <div className="rounded-2xl border p-5" style={{ backgroundColor: PLATINUM, borderColor: LINE }}>
                    <div className="flex items-center gap-2 mb-3.5">
                      <ListOrdered className="w-4 h-4" style={{ color: ACCENT }} aria-hidden="true" />
                      <h3 className="text-[13px] font-black" style={{ color: CARBON }}>Daftar Isi</h3>
                    </div>
                    <nav className="space-y-0.5">
                      {toc.map((h, i) => {
                        const active = activeHeading === h
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => goToHeading(h)}
                            aria-current={active ? "true" : undefined}
                            className="block w-full text-left text-[12.5px] leading-snug py-1.5 pl-3 border-l-2 transition-colors duration-200"
                            style={{
                              // Item aktif → WARNA teks berubah ke aksen; ukuran huruf tetap.
                              // Item aktif → hanya WARNA yang berubah: teks jadi Carbon
                              // dan latar diberi tint warna kategori. Ukuran serta
                              // ketebalan huruf sengaja tetap supaya tata letak tidak
                              // bergeser saat pengguna menelusuri daftar isi.
                              borderColor: active ? ACCENT : LINE,
                              color: active ? CARBON : ACCENT,
                              backgroundColor: active ? `${catColor}26` : "transparent",
                            }}
                          >
                            {h}
                          </button>
                        )
                      })}
                    </nav>
                  </div>
                )}

                <div className="rounded-2xl border p-5" style={{ backgroundColor: PLATINUM, borderColor: LINE }}>
                  <div className="flex items-center gap-2 mb-3.5">
                    <BookOpen className="w-4 h-4" style={{ color: ACCENT }} aria-hidden="true" />
                    <h3 className="text-[13px] font-black" style={{ color: CARBON }}>Detail Dokumen</h3>
                  </div>
                  <dl className="space-y-2.5 text-[12px]">
                    {[
                      { k: "Kategori", v: catLabel },
                      { k: "Penulis", v: article.author },
                      { k: "Terbit", v: formatInformasiDate(article.published_at) },
                      { k: "Waktu Baca", v: `${article.read_minutes} menit` },
                      { k: "Dibaca", v: `${article.views.toLocaleString("id-ID")}x` },
                    ].map((row) => (
                      <div key={row.k} className="flex items-start justify-between gap-3">
                        <dt style={{ color: ACCENT }}>{row.k}</dt>
                        <dd className="font-semibold text-right" style={{ color: CARBON }}>{row.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={copyLink}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border text-[12px] font-semibold transition-colors hover:opacity-80"
                    style={{ borderColor: LINE, color: ACCENT }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Tautan tersalin</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Bagikan Dokumen</span>
                      </>
                    )}
                  </button>
                </div>

                {related.length > 0 && (
                  <div className="rounded-2xl border p-5" style={{ backgroundColor: PLATINUM, borderColor: LINE }}>
                    <div className="flex items-center gap-2 mb-3.5">
                      <FileText className="w-4 h-4" style={{ color: ACCENT }} aria-hidden="true" />
                      <h3 className="text-[13px] font-black" style={{ color: CARBON }}>Dokumen Terkait</h3>
                    </div>
                    <div className="space-y-1">
                      {related.map((r) => {
                        const rc = resolveCategory(r.category, categories)
                        return (
                          <Link
                            key={r.id}
                            href={`/informasi/${r.slug}`}
                            className="group block p-3 -mx-1 rounded-xl transition-colors hover:bg-black/[0.04]"
                          >
                            <span
                              className="inline-block px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider mb-1.5"
                              style={{ backgroundColor: `${rc.color}1f`, color: rc.color }}
                            >
                              {rc.label}
                            </span>
                            <span className="block text-[12.5px] font-bold leading-snug line-clamp-2 mb-1 transition-colors" style={{ color: CARBON }}>
                              {r.title}
                            </span>
                            <span className="text-[10.5px]" style={{ color: ACCENT }}>
                              {formatInformasiDate(r.published_at)} · {r.read_minutes} mnt
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                    <Link
                      href="/informasi"
                      className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-colors"
                      style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT, border: `1px solid ${LINE}` }}
                    >
                      Lihat Semua Informasi
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            </aside>

          </div>
        </div>
      </section>
    </>
  )
}

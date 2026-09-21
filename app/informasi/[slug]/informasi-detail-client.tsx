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
  Share2,
  Tag,
} from "lucide-react"
import PageTransition from "@/components/page-transition"
import type { Informasi } from "@/lib/database.types"
import {
  formatInformasiDate,
  getInformasiCategoryColor,
  getInformasiCategoryLabel,
} from "@/lib/informasi-data"

interface Props {
  article: Informasi
  blocks: string[]
  related: Informasi[]
  heroImg: string | null
}

/** Blok yang diawali "## " dianggap sub-judul → jadi entri daftar isi */
function headingOf(block: string): string | null {
  if (block.startsWith("## ")) return block.slice(3).trim()
  return null
}

/** Terapkan penebalan **teks** tanpa dangerouslySetInnerHTML */
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-black">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function InformasiDetailClient({ article, blocks, related, heroImg }: Props) {
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeHeading, setActiveHeading] = useState<string | null>(null)

  const color = getInformasiCategoryColor(article.category)
  const catLabel = getInformasiCategoryLabel(article.category)

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

  // Daftar isi dari sub-judul
  const toc = useMemo(
    () => blocks.map(headingOf).filter((h): h is string => !!h),
    [blocks]
  )

  // Sorot sub-judul yang sedang terlihat
  useEffect(() => {
    if (toc.length === 0) return
    const headings = Array.from(document.querySelectorAll("[data-info-heading]"))
    if (headings.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveHeading(visible[0].target.textContent?.trim() ?? null)
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

  return (
    <>
      {/* Bilah kemajuan baca */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#ff914d] to-[#ffb37d] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ══ HERO PUTIH — beda dari hero banner halaman lain ══ */}
      <section className="relative bg-[#f7f7f7] border-b border-black/8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,145,77,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.9) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute -top-24 right-0 w-80 h-80 rounded-full pointer-events-none opacity-[0.10] blur-3xl"
          style={{ backgroundColor: color }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[92px] pb-10 md:pt-32 md:pb-16">
          <PageTransition>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[11.5px] text-black/40 mb-5 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-black transition-colors">Beranda</Link>
              <ChevronRight className="w-3 h-3 text-black/25" />
              <Link href="/informasi" className="hover:text-black transition-colors">Informasi</Link>
              <ChevronRight className="w-3 h-3 text-black/25" />
              <span className="text-black/60 truncate max-w-[260px]">{article.title}</span>
            </nav>

            <div className="flex items-center flex-wrap gap-2.5 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {catLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-black/40">
                <Clock className="w-3 h-3" />
                {article.read_minutes} menit baca
              </span>
              <span aria-hidden="true" className="text-black/20">·</span>
              <span className="text-[11.5px] text-black/40">{formatInformasiDate(article.published_at)}</span>
            </div>

            <h1 className="text-[24px] md:text-[42px] font-black text-black leading-[1.15] tracking-tight mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-[14px] md:text-[17px] text-black/55 leading-relaxed mb-6 max-w-3xl">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-black/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-black shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-black leading-tight">{article.author}</div>
                  <div className="text-[11px] text-black/40 inline-flex items-center gap-1.5 mt-0.5">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString("id-ID")} kali dibaca
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-[12px] font-semibold text-black/60 hover:text-black hover:border-black/25 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Salin Tautan</span>
                    </>
                  )}
                </button>
                <Link
                  href="/informasi"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black text-white text-[12px] font-semibold hover:bg-[#ff914d] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
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
                <figure className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-black/10 mb-8 md:mb-10 shadow-xl bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImg} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
                </figure>
              )}

              <article>
                {blocks.map((block, i) => {
                  const heading = headingOf(block)
                  if (heading) {
                    return (
                      <h2
                        key={i}
                        data-info-heading
                        className="text-[18px] md:text-[26px] font-black text-black mt-9 mb-4 pb-2.5 border-b border-black/8 flex items-start gap-2.5 scroll-mt-28 leading-snug"
                      >
                        <span className="mt-1.5 md:mt-2 w-1 h-5 md:h-6 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        {heading}
                      </h2>
                    )
                  }

                  const lines = block.split("\n")
                  const isList =
                    lines.length > 1 &&
                    lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "))

                  if (isList) {
                    return (
                      <ul key={i} className="space-y-2.5 my-5 pl-1">
                        {lines.map((l, li) => (
                          <li key={li} className="flex items-start gap-2.5 text-[14px] md:text-[15.5px] text-black/65 leading-relaxed">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span>{renderInline(l.trim().replace(/^[-*]\s*/, ""))}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  }

                  return (
                    <p key={i} className="text-[14px] md:text-[15.5px] text-black/65 leading-[1.9] my-4 whitespace-pre-line">
                      {renderInline(block)}
                    </p>
                  )
                })}
              </article>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-9 pt-6 border-t border-black/8">
                  <Tag className="w-3.5 h-3.5 text-black/30" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-black/[0.04] border border-black/8 text-[11px] font-semibold text-black/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-9 rounded-2xl bg-black p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#ff914d]" />
                <div className="absolute -top-16 right-0 w-56 h-56 rounded-full bg-[#ff914d] opacity-[0.10] blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-[#ff914d]/15 border border-[#ff914d]/30 flex items-center justify-center text-[#ff914d] mb-4">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-[18px] md:text-2xl font-black text-white mb-2">
                    Ada pertanyaan tentang dokumen ini?
                  </h3>
                  <p className="text-white/50 text-[13px] md:text-[14.5px] leading-relaxed mb-5 max-w-lg">
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
                      className="btn-shine inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff914d] text-white text-[13px] font-bold hover:bg-[#e07b3a] transition-colors"
                    >
                      Tanya via WhatsApp
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white/80 text-[13px] font-semibold hover:bg-white/14 transition-colors"
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
                  <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-5">
                    <div className="flex items-center gap-2 mb-3.5">
                      <ListOrdered className="w-4 h-4 text-[#ff914d]" />
                      <h3 className="text-[13px] font-black text-black">Daftar Isi</h3>
                    </div>
                    <nav className="space-y-0.5">
                      {toc.map((h, i) => {
                        const active = activeHeading === h
                        return (
                          <a
                            key={i}
                            href={`#${encodeURIComponent(h)}`}
                            onClick={(e) => {
                              e.preventDefault()
                              const el = Array.from(document.querySelectorAll("[data-info-heading]")).find(
                                (n) => n.textContent?.trim() === h
                              )
                              el?.scrollIntoView({ behavior: "smooth", block: "start" })
                            }}
                            className={`block text-[12px] leading-snug py-1.5 pl-3 border-l-2 transition-all ${
                              active
                                ? "border-[#ff914d] text-[#ff914d] font-bold"
                                : "border-black/10 text-black/50 hover:text-black hover:border-black/30"
                            }`}
                          >
                            {h}
                          </a>
                        )
                      })}
                    </nav>
                  </div>
                )}

                <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-5">
                  <div className="flex items-center gap-2 mb-3.5">
                    <BookOpen className="w-4 h-4 text-[#ff914d]" />
                    <h3 className="text-[13px] font-black text-black">Detail Dokumen</h3>
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
                        <dt className="text-black/40">{row.k}</dt>
                        <dd className="text-black/80 font-semibold text-right">{row.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={copyLink}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/10 text-[12px] font-semibold text-black/65 hover:border-black/25 hover:text-black transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Tautan tersalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Bagikan Dokumen</span>
                      </>
                    )}
                  </button>
                </div>

                {related.length > 0 && (
                  <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-5">
                    <div className="flex items-center gap-2 mb-3.5">
                      <FileText className="w-4 h-4 text-[#ff914d]" />
                      <h3 className="text-[13px] font-black text-black">Dokumen Terkait</h3>
                    </div>
                    <div className="space-y-1">
                      {related.map((r) => (
                        <Link
                          key={r.id}
                          href={`/informasi/${r.slug}`}
                          className="group block p-3 -mx-1 rounded-xl hover:bg-black/[0.04] transition-colors"
                        >
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider mb-1.5"
                            style={{
                              backgroundColor: `${getInformasiCategoryColor(r.category)}18`,
                              color: getInformasiCategoryColor(r.category),
                            }}
                          >
                            {getInformasiCategoryLabel(r.category)}
                          </span>
                          <span className="block text-[12.5px] font-bold text-black/85 leading-snug group-hover:text-[#ff914d] transition-colors line-clamp-2 mb-1">
                            {r.title}
                          </span>
                          <span className="text-[10.5px] text-black/35">
                            {formatInformasiDate(r.published_at)} · {r.read_minutes} mnt
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/informasi"
                      className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff914d]/10 border border-[#ff914d]/25 text-[#ff914d] text-[12px] font-bold hover:bg-[#ff914d]/20 transition-colors"
                    >
                      Lihat Semua Informasi
                      <ArrowRight className="w-3.5 h-3.5" />
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

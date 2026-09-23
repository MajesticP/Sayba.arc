"use client"

import type React from "react"
import CuttingBoardBackground, { BoardSection } from "@/components/cutting-board-bg"
import { useEffect, useState } from "react"
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
import IsiArtikel from "@/components/isi-artikel"
import type { Informasi } from "@/lib/database.types"
import { formatInformasiDate } from "@/lib/informasi-data"
import { resolveKategori, type KategoriItem } from "@/lib/kategori"

interface Props {
  article: Informasi
  related: Informasi[]
  heroImg: string | null
  /**
   * Kategori dari tabel `kategori` (scope "informasi"), dikelola lewat Admin
   * Dashboard. Bila tidak dikirim, label memakai slug apa adanya dan warna
   * memakai aksen netral.
   */
  categories?: KategoriItem[]
}

/* ── Palet (DESIGN.md, Executive Navy) ───────────────────────────────────
 * navy        #112a46  latar gelap, judul, blok penting
 * navy-800    #16345a  permukaan terangkat di atas navy
 * orange      #f07a26  AKSEN saja (garis, tombol di latar gelap), maks 10%
 * orange-text #b45610  orange sebagai TEKS di latar terang: 4.53:1 di ice
 * slate       #5a5c62  teks sekunder di latar terang, 6.17:1 di ice
 * ice         #f4f6f9  latar terang utama
 * ice-line    #d8e0ea  garis pemisah di latar terang
 * ------------------------------------------------------------------------ */
const NAVY = "#112a46"
const NAVY_800 = "#16345a"
const ORANGE = "#f07a26"
const ORANGE_TEXT = "#b45610"
const SLATE = "#5a5c62"
const ICE = "#f4f6f9"
const ICE_LINE = "#d8e0ea"

export default function InformasiDetailClient({ article, related, heroImg, categories }: Props) {
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeHeading, setActiveHeading] = useState<string | null>(null)

  // Label & warna kategori dari tabel `kategori`; fallback netral bila kosong.
  const cat = resolveKategori(article.category, categories ?? [])
  const catLabel = cat.label
  const catColor = cat.color

  /**
   * Daftar isi dibaca dari DOM, bukan dari teks mentah.
   *
   * Alasannya, aturan penulisan hanya boleh ada di satu tempat
   * (lib/markdown.tsx). Kalau halaman ini ikut memecah teks sendiri, aturannya
   * jadi dua dan pelan-pelan berbeda dari halaman Berita.
   *
   * Elemennya dibaca SETELAH isi ter-render, jadi daftarnya selalu cocok
   * dengan yang benar-benar tampil.
   */
  const [toc, setToc] = useState<string[]>([])
  useEffect(() => {
    const el = document.querySelectorAll("[data-info-heading]")
    setToc(Array.from(el).map((n) => n.getAttribute("data-info-heading") ?? "").filter(Boolean))
  }, [article.body])

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

  // Sorot sub-judul yang sedang terlihat, hanya mengubah WARNA, bukan ukuran huruf.
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
      /* diabaikan, clipboard bisa diblokir browser */
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
      {/* Bilah kemajuan baca: memakai warna kategori sebagai aksen tipis */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%`, backgroundColor: catColor }}
        />
      </div>

      {/* ══ HERO: pita terang, beda dari banner halaman lain ══ */}
      <BoardSection id="kepala-informasi" panelClassName="relative overflow-hidden">
        {/* Kisi meja potong, sama seperti hero beranda dan halaman lain.
            Sebelumnya kepala halaman ini memakai kisi ad-hoc berjarak 48px
            yang membuatnya terlihat berbeda dari halaman lain. */}
        <CuttingBoardBackground tone="light" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 pt-20 pb-9 md:pt-28 md:pb-14">
          <PageTransition>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[11.5px] mb-5 flex-wrap" style={{ color: SLATE }} aria-label="Breadcrumb">
              <Link href="/" className="hover:text-navy transition-colors">Beranda</Link>
              <ChevronRight className="w-3 h-3 opacity-50" aria-hidden="true" />
              <Link href="/informasi" className="hover:text-navy transition-colors">Informasi</Link>
              <ChevronRight className="w-3 h-3 opacity-50" aria-hidden="true" />
              <span className="truncate max-w-[260px] font-medium" style={{ color: NAVY }}>{article.title}</span>
            </nav>

            <div className="flex items-center flex-wrap gap-2.5 mb-4">
              {/* Chip kategori: tint warna kategori + teks navy supaya selalu lolos
                  WCAG AA apa pun warna yang dipilih admin di database. */}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${catColor}1f`, color: NAVY }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} aria-hidden="true" />
                {catLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: SLATE }}>
                <Clock className="w-3 h-3" aria-hidden="true" />
                {article.read_minutes} menit baca
              </span>
              <span aria-hidden="true" style={{ color: SLATE }} className="opacity-50">·</span>
              <span className="text-[11.5px]" style={{ color: SLATE }}>{formatInformasiDate(article.published_at)}</span>
            </div>

            <h1 className="text-[24px] md:text-[38px] font-bold text-ice leading-tight mb-4" style={{ color: NAVY }}>
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-[14px] md:text-[16px] leading-[1.75] mb-6 max-w-[68ch]" style={{ color: SLATE }}>
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t" style={{ borderColor: ICE_LINE }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black shrink-0"
                  style={{ backgroundColor: NAVY, color: ICE }}
                >
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-bold leading-tight" style={{ color: NAVY }}>{article.author}</div>
                  <div className="text-[11px] inline-flex items-center gap-1.5 mt-0.5" style={{ color: SLATE }}>
                    <Eye className="w-3 h-3" aria-hidden="true" />
                    {article.views.toLocaleString("id-ID")} kali dibaca
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border text-[12px] font-semibold transition-colors hover:border-orange hover:text-orange-text"
                  style={{ borderColor: ICE_LINE, color: SLATE }}
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-ice text-[12px] font-semibold transition-colors hover:bg-navy-700"
                  style={{ backgroundColor: NAVY }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Semua Informasi</span>
                </Link>
              </div>
            </div>
          </PageTransition>
        </div>
      </BoardSection>

      {/* ══ ISI: dua kolom ══ */}
      <BoardSection id="isi-informasi" panelClassName="panel-top-pad">
        <div className="panel-pad">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* ── Kiri: isi dokumen ── */}
            <div className="lg:col-span-8 min-w-0">
              {heroImg && (
                <figure className="relative aspect-[16/9] rounded-2xl overflow-hidden border mb-8 md:mb-10 shadow-sm" style={{ borderColor: ICE_LINE }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImg} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
                </figure>
              )}

              <article>
                {/* Isi artikel: perender bersama dengan halaman Berita.
                    Sub-judulnya diberi data-info-heading, yang dipakai
                    daftar isi di samping untuk menyorot bagian aktif. */}
                <IsiArtikel body={article.body} warnaTebal={NAVY} warnaTeks={NAVY} aksen={catColor} />
              </article>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-9 pt-6 border-t" style={{ borderColor: ICE_LINE }}>
                  <Tag className="w-3.5 h-3.5" style={{ color: SLATE }} aria-hidden="true" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: ICE, color: SLATE }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-9 rounded-2xl p-6 md:p-8 relative overflow-hidden" style={{ backgroundColor: NAVY }}>
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ORANGE }} />

                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(240,122,38,0.15)", border: "1px solid rgba(240,122,38,0.3)" }}>
                    <MessageSquare className="w-5 h-5" style={{ color: ORANGE }} aria-hidden="true" />
                  </div>
                  <h3 className="text-[18px] md:text-2xl font-black mb-2" style={{ color: ICE }}>
                    Ada pertanyaan tentang dokumen ini?
                  </h3>
                  <p className="text-[13px] md:text-[15px] leading-relaxed mb-5 max-w-lg" style={{ color: "rgba(244,246,249,0.75)" }}>
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
                      className="btn-solid"
                      style={{ backgroundColor: ORANGE, color: NAVY }}
                    >
                      Tanya via WhatsApp
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-navy-700"
                      style={{ backgroundColor: NAVY_800, color: ICE, border: "1px solid rgba(244,246,249,0.2)" }}
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
                  <div className="rounded-2xl border p-5" style={{ backgroundColor: ICE, borderColor: ICE_LINE }}>
                    <div className="flex items-center gap-2 mb-3.5">
                      <ListOrdered className="w-4 h-4" style={{ color: SLATE }} aria-hidden="true" />
                      <h3 className="text-[13px] font-black" style={{ color: NAVY }}>Daftar Isi</h3>
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
                              // Item aktif → WARNA yang berubah (teks navy + penanda
                              // orange + tint kategori). Ukuran & ketebalan huruf tetap
                              // supaya tata letak tidak bergeser saat menelusuri isi.
                              borderColor: active ? ORANGE : ICE_LINE,
                              color: active ? NAVY : SLATE,
                              backgroundColor: active ? `${catColor}1f` : "transparent",
                            }}
                          >
                            {h}
                          </button>
                        )
                      })}
                    </nav>
                  </div>
                )}

                <div className="rounded-2xl border p-5" style={{ backgroundColor: ICE, borderColor: ICE_LINE }}>
                  <div className="flex items-center gap-2 mb-3.5">
                    <BookOpen className="w-4 h-4" style={{ color: SLATE }} aria-hidden="true" />
                    <h3 className="text-[13px] font-black" style={{ color: NAVY }}>Detail Dokumen</h3>
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
                        <dt style={{ color: SLATE }}>{row.k}</dt>
                        <dd className="font-semibold text-right" style={{ color: NAVY }}>{row.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={copyLink}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border text-[12px] font-semibold transition-colors hover:border-orange hover:text-orange-text"
                    style={{ borderColor: ICE_LINE, color: SLATE }}
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
                  <div className="rounded-2xl border p-5" style={{ backgroundColor: ICE, borderColor: ICE_LINE }}>
                    <div className="flex items-center gap-2 mb-3.5">
                      <FileText className="w-4 h-4" style={{ color: SLATE }} aria-hidden="true" />
                      <h3 className="text-[13px] font-black" style={{ color: NAVY }}>Dokumen Terkait</h3>
                    </div>
                    <div className="space-y-1">
                      {related.map((r) => {
                        const rc = resolveKategori(r.category, categories ?? [])
                        return (
                          <Link
                            key={r.id}
                            href={`/informasi/${r.slug}`}
                            className="group block p-3 -mx-1 rounded-xl transition-colors hover:bg-black/[0.04]"
                          >
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider mb-1.5"
                              style={{ backgroundColor: `${rc.color}1f`, color: NAVY }}
                            >
                              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: rc.color }} aria-hidden="true" />
                              {rc.label}
                            </span>
                            <span className="block text-[12.5px] font-bold leading-snug line-clamp-2 mb-1 text-navy group-hover:text-orange-text transition-colors">
                              {r.title}
                            </span>
                            <span className="text-[10.5px]" style={{ color: SLATE }}>
                              {formatInformasiDate(r.published_at)} · {r.read_minutes} mnt
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                    <Link
                      href="/informasi"
                      className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-colors hover:bg-navy-700"
                      style={{ backgroundColor: NAVY, color: ICE }}
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
      </BoardSection>
    </>
  )
}

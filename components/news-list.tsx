"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Eye, Search, X } from "lucide-react"
import PageTransition from "@/components/page-transition"
import CuttingBoardBackground from "@/components/cutting-board-bg"
import type { Berita } from "@/lib/database.types"
import { formatNewsDate, getCategoryColor, getCategoryLabel, newsCategories } from "@/lib/news-data"

interface Props {
  articles: Berita[]
  featured: Berita | null
}

const FALLBACK_IMG = "/berita/berita-1-800x500.png"

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string {
  if (!url) return FALLBACK_IMG
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

export default function NewsList({ articles, featured }: Props) {
  const [active, setActive] = useState("semua")
  const [query, setQuery] = useState("")

  const availableCategories = useMemo(() => {
    const used = new Set(articles.map((a) => a.category))
    return newsCategories.filter((c) => used.has(c.slug))
  }, [articles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((a) => {
      if (active !== "semua" && a.category !== active) return false
      if (!q) return true
      return (
        a.title.toLowerCase().includes(q) ||
        (a.excerpt ?? "").toLowerCase().includes(q) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [articles, active, query])

  const isFiltering = active !== "semua" || query.trim() !== ""
  const showFeatured = featured !== null && !isFiltering

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="relative bg-carbon overflow-hidden">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-14 md:pt-36 md:pb-20">
          <p className="animate-fade-in stagger-1 text-[12px] font-medium text-steel mb-4">Berita</p>
          <h1 className="animate-blur-in stagger-2 text-[28px] leading-[1.15] sm:text-4xl lg:text-[44px] font-bold text-platinum tracking-tight mb-4 max-w-3xl">
            Catatan Proyek &amp; Panduan Teknis
          </h1>
          <p className="animate-fade-in-up stagger-3 text-[14px] md:text-lg text-steel leading-relaxed max-w-2xl">
            Ditulis dari pekerjaan yang sedang dan sudah kami kerjakan di lapangan.
          </p>
        </div>
      </section>

      {/* ══ DAFTAR ══ */}
      <section className="relative z-10 -mt-6 md:-mt-10 rounded-t-[28px] md:rounded-t-[40px] bg-platinum flex-1 pb-14 md:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">

          {/* ── Kosong: belum ada artikel sama sekali ── */}
          {articles.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-[16px] font-bold text-carbon mb-1.5">Belum ada artikel</h2>
              <p className="text-[14px] text-slate-brand max-w-md mx-auto">
                Artikel sedang disiapkan. Sementara itu, Anda bisa melihat layanan kami atau
                menghubungi tim untuk pertanyaan langsung.
              </p>
            </div>
          )}

          {/* ── Sorotan ── */}
          {showFeatured && featured && (
            <PageTransition>
              <Link
                href={`/berita/${featured.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 bg-carbon rounded-2xl md:rounded-3xl overflow-hidden mb-10 md:mb-14 hover:shadow-2xl transition-all duration-200"
              >
                <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gdriveToImg(featured.image_url)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: getCategoryColor(featured.category) }}
                  >
                    {getCategoryLabel(featured.category)}
                  </span>
                </div>

                <div className="flex flex-col justify-center p-6 md:p-9">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-powder mb-3">
                    Sorotan
                  </p>
                  <h2 className="text-[18px] md:text-[24px] font-bold text-platinum leading-snug mb-3 group-hover:text-powder transition-colors">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-steel text-[14px] md:text-[15px] leading-relaxed line-clamp-3 mb-5">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-steel">
                    <span>{formatNewsDate(featured.published_at)}</span>
                    <span aria-hidden="true" className="text-steel/75">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {featured.read_minutes} menit baca
                    </span>
                  </div>
                </div>
              </Link>
            </PageTransition>
          )}

          {/* ── Filter + pencarian ── */}
          {articles.length > 0 && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                <FilterChip
                  label="Semua"
                  active={active === "semua"}
                  onClick={() => setActive("semua")}
                />
                {availableCategories.map((c) => (
                  <FilterChip
                    key={c.slug}
                    label={c.label}
                    active={active === c.slug}
                    onClick={() => setActive(c.slug)}
                  />
                ))}
              </div>

              <div className="relative lg:w-72 shrink-0">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-brand pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari artikel…"
                  aria-label="Cari artikel"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-platinum-line bg-white text-[14px] text-carbon placeholder:text-slate-brand/90 outline-none focus:border-steel focus:ring-2 focus:ring-steel/25 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-brand hover:text-carbon hover:bg-black/5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Judul hasil + jumlah ── */}
          {articles.length > 0 && (
            <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-platinum-line">
              <h2 className="text-[17px] md:text-2xl font-bold text-carbon">
                {active === "semua" ? "Semua Artikel" : getCategoryLabel(active)}
              </h2>
              <span className="text-[13px] text-slate-brand shrink-0 tabular-nums">
                {filtered.length} artikel
              </span>
            </div>
          )}

          {/* ── Kosong karena filter ── */}
          {articles.length > 0 && filtered.length === 0 && (
            <div className="py-16 text-center">
              <h3 className="text-[15px] font-bold text-carbon mb-1.5">Tidak ada artikel yang cocok</h3>
              <p className="text-[14px] text-slate-brand max-w-md mx-auto mb-5">
                {query
                  ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`
                  : "Belum ada artikel pada kategori ini."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setActive("semua")
                }}
                className="px-5 py-2.5 rounded-xl bg-carbon text-platinum text-[13px] font-semibold hover:bg-carbon-800 transition-colors"
              >
                Tampilkan semua artikel
              </button>
            </div>
          )}

          {/* ── Grid artikel ── */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((article, i) => (
                <PageTransition key={article.id} delay={Math.min(i, 6) * 60}>
                  <ArticleCard article={article} />
                </PageTransition>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

/* ── Chip filter ────────────────────────────────────────────────────────── */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
        active
          ? "bg-carbon text-platinum border-carbon"
          : "bg-white text-slate-brand border-platinum-line hover:border-steel hover:text-carbon"
      }`}
    >
      {label}
    </button>
  )
}

/* ── Kartu artikel ──────────────────────────────────────────────────────── */
function ArticleCard({ article }: { article: Berita }) {
  const color = getCategoryColor(article.category)

  return (
    <Link
      href={`/berita/${article.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-platinum-line overflow-hidden hover:border-steel hover:shadow-lg transition-all duration-200"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-platinum-dim">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gdriveToImg(article.image_url)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: color }}
        >
          {getCategoryLabel(article.category)}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-[15px] font-bold text-carbon leading-snug mb-2 line-clamp-2 group-hover:text-slate-brand transition-colors">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-[13px] text-slate-brand leading-relaxed line-clamp-3 flex-1">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-platinum-line text-[11px] text-slate-brand">
          <span>{formatNewsDate(article.published_at)}</span>
          <span aria-hidden="true" className="text-slate-brand">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {article.read_minutes} mnt
          </span>
          {article.views > 0 && (
            <>
              <span aria-hidden="true" className="text-slate-brand">·</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3" aria-hidden="true" />
                {article.views.toLocaleString("id-ID")}
              </span>
            </>
          )}
          <ArrowRight
            className="w-3.5 h-3.5 ml-auto group-hover:translate-x-1 group-hover:text-carbon transition-all"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  )
}

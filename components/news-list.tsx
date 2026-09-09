"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { Berita } from "@/lib/database.types"
import { formatNewsDate, getCategoryColor, getCategoryLabel, newsCategories } from "@/lib/news-data"

interface NewsListProps {
  articles: Berita[]
  featured: Berita | null
}

const FALLBACK_IMG = "/berita/berita-1-800x500.png"

/** Link Google Drive → proxy gambar lokal, sama seperti layanan/produk */
function gdriveToImg(url: string | null): string {
  if (!url) return FALLBACK_IMG
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

function MetaRow({ article, tone = "dark" }: { article: Berita; tone?: "dark" | "light" }) {
  const muted = tone === "dark" ? "text-white/45" : "text-black/40"
  return (
    <div className={`flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[11px] ${muted}`}>
      <span>{formatNewsDate(article.published_at)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {article.read_minutes} mnt
      </span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {article.views.toLocaleString("id-ID")}
      </span>
    </div>
  )
}

export default function NewsList({ articles, featured }: NewsListProps) {
  const [active, setActive] = useState("semua")
  const [query, setQuery] = useState("")

  // Hanya tampilkan kategori yang benar-benar punya artikel
  const availableCategories = useMemo(() => {
    const used = new Set(articles.map((a) => a.category))
    return [{ slug: "semua", label: "Semua", color: "#ff914d" }, ...newsCategories.filter((c) => used.has(c.slug))]
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

  if (!articles.length) {
    return (
      <section className="bg-white py-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-black/40 text-[13px]">Belum ada artikel yang dipublikasikan.</p>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* ── Sorotan ───────────────────────────────────────────── */}
      {featured && (
        <section className="bg-white pt-8 md:pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/berita/${featured.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-2 items-stretch justify-items-stretch rounded-xl md:rounded-3xl overflow-hidden border border-black/10 bg-black transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gdriveToImg(featured.image_url)}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/70" />
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg"
                  style={{ backgroundColor: getCategoryColor(featured.category) }}
                >
                  {getCategoryLabel(featured.category)}
                </span>
              </div>

              <div className="flex flex-col justify-center p-5 md:p-10">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#ff914d] mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
                  Sorotan
                </span>
                <h2 className="text-[19px] md:text-3xl font-black text-white leading-snug mb-2.5 group-hover:text-[#ff914d] transition-colors duration-200">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-white/50 text-[13px] md:text-base leading-relaxed mb-4 line-clamp-4">{featured.excerpt}</p>
                )}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#ff914d]/20 border border-[#ff914d]/30 flex items-center justify-center text-[#ff914d] text-[11px] font-black">
                    {featured.author.charAt(0)}
                  </div>
                  <span className="text-white/60 text-[13px] font-medium">{featured.author}</span>
                </div>
                <MetaRow article={featured} />
                <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#ff914d]">
                  Baca selengkapnya
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Filter + daftar ───────────────────────────────────── */}
      <section className="bg-white py-8 md:py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {availableCategories.map((cat) => {
                const isActive = active === cat.slug
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setActive(cat.slug)}
                    aria-pressed={isActive}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all duration-200 ${
                      isActive
                        ? "bg-black text-white border-black"
                        : "bg-white text-black/55 border-black/10 hover:border-black/30 hover:text-black"
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            <div className="relative lg:w-72 shrink-0">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari berita atau topik…"
                aria-label="Cari berita"
                className="w-full pl-9 pr-4 py-2 rounded-full border border-black/10 bg-white text-[13px] text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all"
              />
            </div>
          </div>

          {/* Judul + jumlah */}
          <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-black/8">
            <h2 className="text-[19px] md:text-2xl font-black text-black">
              {active === "semua" ? "Artikel Terbaru" : getCategoryLabel(active)}
            </h2>
            <span className="text-[13px] text-black/40 font-medium">{filtered.length} artikel</span>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-black/40 text-[13px] mb-3">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
              <button
                type="button"
                onClick={() => { setQuery(""); setActive("semua") }}
                className="text-[13px] font-semibold text-[#ff914d] hover:underline"
              >
                Atur ulang filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((article) => (
                <Link
                  key={article.id}
                  href={`/berita/${article.slug}`}
                  className="group flex flex-col items-stretch justify-start rounded-xl md:rounded-2xl overflow-hidden border border-black/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative w-full aspect-[8/5] overflow-hidden bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gdriveToImg(article.image_url)}
                      alt={article.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow"
                      style={{ backgroundColor: getCategoryColor(article.category) }}
                    >
                      {getCategoryLabel(article.category)}
                    </span>
                    <div className="absolute bottom-0 inset-x-0 h-1" style={{ backgroundColor: getCategoryColor(article.category) }} />
                  </div>

                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="text-[15px] font-black text-black leading-snug mb-1.5 line-clamp-2 group-hover:text-[#ff914d] transition-colors duration-200">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-black/45 text-[13px] leading-relaxed line-clamp-3 flex-1">{article.excerpt}</p>
                    )}
                    <div className="mt-3 pt-2.5 border-t border-black/8">
                      <MetaRow article={article} tone="light" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

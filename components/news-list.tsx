"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Eye, Search, X } from "lucide-react"
import PageTransition from "@/components/page-transition"
import CuttingBoardBackground from "@/components/cutting-board-bg"
import type { Berita } from "@/lib/database.types"
import type { KategoriItem } from "@/lib/kategori"
import { formatNewsDate } from "@/lib/news-data"

/**
 * NewsList: daftar berita.
 *
 * Kategori datang dari prop (tabel `kategori`), bukan daftar hardcode, jadi
 * admin bisa menambah kategori tanpa deploy. Hanya kategori yang benar-benar
 * dipakai artikel yang ditampilkan sebagai filter.
 */

function gdriveToImg(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

export default function NewsList({
  initialArticles,
  kategori,
}: {
  initialArticles: Berita[]
  kategori: KategoriItem[]
}) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("semua")

  const catMap = useMemo(() => {
    const m = new Map<string, KategoriItem>()
    kategori.forEach((c) => m.set(c.slug.toLowerCase(), c))
    return m
  }, [kategori])

  const catOf = (slug: string): KategoriItem =>
    catMap.get(slug.toLowerCase()) ?? { slug, label: slug, color: "#5a5c62" }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialArticles.filter((item) => {
      if (activeCategory !== "semua" && item.category.toLowerCase() !== activeCategory.toLowerCase())
        return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        (item.excerpt ?? "").toLowerCase().includes(q) ||
        (item.body ?? "").toLowerCase().includes(q) ||
        (item.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [initialArticles, activeCategory, search])

  const featured = useMemo(
    () => initialArticles.find((a) => a.featured) ?? null,
    [initialArticles]
  )

  // Hanya tampilkan kategori yang benar-benar dipakai artikel
  const usedCategories = useMemo(() => {
    const used = new Set(initialArticles.map((a) => a.category.toLowerCase()))
    return kategori.filter((c) => used.has(c.slug.toLowerCase()))
  }, [kategori, initialArticles])

  const counts = useMemo(() => {
    const map: Record<string, number> = { semua: initialArticles.length }
    usedCategories.forEach((cat) => {
      map[cat.slug] = initialArticles.filter(
        (i) => i.category.toLowerCase() === cat.slug.toLowerCase()
      ).length
    })
    return map
  }, [initialArticles, usedCategories])

  const isFiltering = activeCategory !== "semua" || search.trim() !== ""
  const showFeatured = featured !== null && !isFiltering

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="relative bg-navy overflow-hidden">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-14 md:pt-36 md:pb-20">
          <p className="animate-fade-in stagger-1 text-[12px] font-medium text-orange mb-4">
            Berita
          </p>
          <h1 className="animate-blur-in stagger-2 text-[28px] leading-[1.15] sm:text-4xl lg:text-[46px] font-bold text-ice tracking-tight mb-4 max-w-3xl">
            Catatan Kerja &amp; Kabar Tim
          </h1>
          <p className="animate-fade-in-up stagger-3 text-[14px] md:text-lg text-ice/75 leading-relaxed max-w-2xl mb-7">
            Hal yang kami temui di lapangan, dan hal yang kami pelajari darinya.
          </p>

          <div className="animate-fade-in-up stagger-4 relative max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/65 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berita atau topik…"
              aria-label="Cari berita"
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-ice text-[14px] text-ink placeholder:text-ink/70 outline-none focus:ring-2 focus:ring-orange transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ══ ISI ══ */}
      <section className="relative z-10 -mt-6 md:-mt-10 rounded-t-[28px] md:rounded-t-[40px] bg-ice flex-1 pb-14 md:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">

          {/* ── Belum ada berita ── */}
          {initialArticles.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-[17px] font-bold text-navy mb-2">Belum ada berita</h2>
              <p className="text-[13.5px] text-slate-brand max-w-md mx-auto mb-6 leading-relaxed">
                Kabar dan catatan proyek akan muncul di sini. Sementara itu, Anda bisa
                membaca panduan kerja kami.
              </p>
              <Link
                href="/informasi"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy text-ice text-[13.5px] font-semibold hover:bg-navy-700 transition-colors"
              >
                Buka Informasi
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* ── Filter kategori ── */}
          {initialArticles.length > 0 && usedCategories.length > 0 && (
            <div className="mb-8 md:mb-12">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                <FilterChip
                  label="Semua"
                  count={counts.semua ?? 0}
                  active={activeCategory === "semua"}
                  onClick={() => setActiveCategory("semua")}
                />
                {usedCategories.map((cat) => (
                  <FilterChip
                    key={cat.slug}
                    label={cat.label}
                    count={counts[cat.slug] ?? 0}
                    active={activeCategory === cat.slug}
                    onClick={() => setActiveCategory(cat.slug)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Sorotan ── */}
          {showFeatured && featured && (
            <PageTransition>
              <Link
                href={`/berita/${featured.slug}`}
                className="group block bg-navy rounded-2xl md:rounded-3xl overflow-hidden mb-10 md:mb-14 p-6 md:p-9 hover:shadow-2xl transition-all duration-200"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-orange mb-3">
                  Sorotan
                </p>
                <h2 className="text-[19px] md:text-[26px] font-bold text-ice leading-snug mb-3 group-hover:text-orange-soft transition-colors max-w-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-ice/75 text-[13.5px] md:text-[15px] leading-relaxed line-clamp-2 mb-5 max-w-3xl">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[11.5px] text-ice/70">
                  <span className="text-orange font-medium">{catOf(featured.category).label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatNewsDate(featured.published_at)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featured.read_minutes} menit baca</span>
                </div>
              </Link>
            </PageTransition>
          )}

          {/* ── Toolbar ── */}
          {initialArticles.length > 0 && (
            <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-ice-line">
              <h2 className="text-[17px] md:text-2xl font-bold text-navy">
                {activeCategory === "semua" ? "Semua Berita" : catOf(activeCategory).label}
                <span className="ml-2 text-[12.5px] font-medium text-slate-brand align-middle tabular-nums">
                  {filtered.length} artikel
                </span>
              </h2>
            </div>
          )}

          {/* ── Kosong karena filter ── */}
          {initialArticles.length > 0 && filtered.length === 0 && (
            <div className="py-16 text-center">
              <h3 className="text-[15px] font-bold text-navy mb-1.5">Tidak ada berita yang cocok</h3>
              <p className="text-[13.5px] text-slate-brand max-w-md mx-auto mb-5">
                {search
                  ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
                  : "Belum ada berita pada kategori ini."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setActiveCategory("semua")
                }}
                className="px-5 py-2.5 rounded-xl bg-navy text-ice text-[13px] font-semibold hover:bg-navy-700 transition-colors"
              >
                Tampilkan semua berita
              </button>
            </div>
          )}

          {/* ── Daftar ── */}
          {filtered.length > 0 && (
            <div className="space-y-4 md:space-y-5">
              {filtered.map((article, i) => {
                const img = gdriveToImg(article.image_url)
                const cat = catOf(article.category)
                return (
                  <PageTransition key={article.id} delay={Math.min(i, 6) * 60}>
                    <Link
                      href={`/berita/${article.slug}`}
                      className="group flex flex-col sm:flex-row gap-4 md:gap-5 bg-white rounded-2xl border border-ice-line overflow-hidden hover:border-orange hover:shadow-lg transition-all duration-200 p-3 sm:p-4"
                    >
                      {/* Foto 4:3 di kiri pada layar lebar */}
                      {img && (
                        <span className="relative w-full sm:w-48 md:w-56 aspect-[4/3] rounded-xl overflow-hidden bg-ice-dim shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt=""
                            loading="lazy"
                            className="card-img-fill transition-transform duration-500 group-hover:scale-105"
                          />
                        </span>
                      )}

                      <span className="flex flex-col flex-1 min-w-0 py-1">
                        <span className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <span className="text-[11.5px] font-semibold text-orange-text">
                            {cat.label}
                          </span>
                          <span aria-hidden="true" className="text-slate-brand">·</span>
                          <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-brand">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {article.read_minutes} mnt
                          </span>
                          {article.views > 0 && (
                            <>
                              <span aria-hidden="true" className="text-slate-brand">·</span>
                              <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-brand">
                                <Eye className="w-3 h-3" aria-hidden="true" />
                                {article.views.toLocaleString("id-ID")}
                              </span>
                            </>
                          )}
                        </span>

                        <span className="block text-[16px] md:text-[18px] font-bold text-navy leading-snug mb-1.5 line-clamp-2 group-hover:text-orange-text transition-colors">
                          {article.title}
                        </span>

                        {article.excerpt && (
                          <span className="block text-[13.5px] text-slate-brand leading-relaxed line-clamp-2 mb-3">
                            {article.excerpt}
                          </span>
                        )}

                        <span className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-ice-line">
                          <span className="text-[11.5px] text-slate-brand">
                            {formatNewsDate(article.published_at)}
                          </span>
                          <ArrowRight
                            className="w-4 h-4 text-slate-brand group-hover:text-orange-text group-hover:translate-x-1 transition-all"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    </Link>
                  </PageTransition>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

/* ── Chip filter kategori ───────────────────────────────────────────────── */
function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
        active
          ? "bg-navy text-ice border-navy"
          : "bg-white text-slate-brand border-ice-line hover:border-orange hover:text-navy"
      }`}
    >
      {label}
      <span className={`text-[11px] tabular-nums ${active ? "text-ice/70" : "text-slate-brand"}`}>
        {count}
      </span>
    </button>
  )
}

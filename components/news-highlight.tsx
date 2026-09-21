"use client"

import Link from "next/link"
import { useInView } from "@/hooks/use-in-view"
import type { Berita } from "@/lib/database.types"
import { formatNewsDate, getCategoryColor, getCategoryLabel } from "@/lib/news-data"

const FALLBACK_IMG = "/berita/berita-1-800x500.png"

function gdriveToImg(url: string | null): string {
  if (!url) return FALLBACK_IMG
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

export default function NewsHighlight({ articles }: { articles: Berita[] }) {
  const header = useInView()
  const cards = useInView({ threshold: 0.08 })

  if (!articles.length) return null

  return (
    <section className="pt-8 pb-16 md:pt-16 md:pb-28 bg-black" id="berita">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — H2 (section ini top-level di beranda) */}
        <div
          ref={header.ref}
          className={`mb-8 md:mb-16 transition-all duration-700 ease-out ${header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-platinum-dim mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-brand" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-brand">Ruang Baca</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 className="text-[22px] leading-tight md:text-5xl font-black text-carbon">
                Berita &amp; Artikel<br className="hidden md:block" />
                <span className="text-slate-brand"> Terbaru</span>
              </h2>
              <p className="text-slate-brand text-[13px] md:text-base mt-2 max-w-md">
                Catatan proyek dan panduan teknis dari tim kami — ditulis dari pengalaman lapangan.
              </p>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-brand hover:text-carbon transition-colors group self-start md:self-auto"
            >
              Lihat semua berita
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Kartu — judul tiap kartu H3, di bawah H2 section */}
        <div
          ref={cards.ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className={`group flex flex-col items-stretch justify-start shrink-0 w-[86vw] snap-center sm:w-auto sm:shrink rounded-xl md:rounded-2xl overflow-hidden border border-platinum-line bg-white transition-all duration-700 hover:-translate-y-1 hover:shadow-2xl ${cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative w-full aspect-[8/5] overflow-hidden bg-platinum-dim">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gdriveToImg(article.image_url)}
                  alt={article.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] text-white shadow"
                  style={{ backgroundColor: getCategoryColor(article.category) }}
                >
                  {getCategoryLabel(article.category)}
                </span>
                <div className="absolute bottom-0 inset-x-0 h-1" style={{ backgroundColor: getCategoryColor(article.category) }} />
              </div>

              <div className="flex flex-col flex-1 p-4">
                <h3 className="text-[15px] font-black text-carbon leading-snug mb-1.5 line-clamp-2 group-hover:text-slate-brand transition-colors duration-200">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-slate-brand text-[13px] leading-relaxed line-clamp-3 flex-1">{article.excerpt}</p>
                )}
                <div className="mt-3 pt-2.5 border-t border-platinum-line flex items-center gap-2 text-[11px] text-slate-brand">
                  <span>{formatNewsDate(article.published_at)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.read_minutes} mnt baca</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Petunjuk geser — mobile saja.
            Penanda ini murni dekoratif (bukan kontrol), jadi tidak terkena
            WCAG 2.5.8; tetap diberi area 24x24 supaya jarak antar titik lega
            dan tidak ada yang bisa tersentuh tidak sengaja. */}
        <div className="flex items-center justify-center mt-3 sm:hidden">
          {articles.map((a) => (
            <span key={a.id} className="flex items-center justify-center w-6 h-6">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-brand/40" />
            </span>
          ))}
          <span className="text-[10px] text-slate-brand ml-1.5">Geser untuk lihat lainnya</span>
        </div>

        {/* Strip penutup */}
        <div
          className={`mt-6 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-t border-platinum-line transition-all duration-700 ${cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <p className="text-slate-brand text-[13px] text-center sm:text-left">Ingin membaca lebih banyak?</p>
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-carbon text-platinum text-[13px] font-semibold hover:bg-steel hover:text-carbon transition-colors duration-200 active:scale-95"
          >
            Buka Halaman Berita
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
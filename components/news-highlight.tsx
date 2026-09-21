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

        {/* Header */}
        <div
          ref={header.ref}
          className={`mb-8 md:mb-16 transition-all duration-700 ease-out ${header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="inline-block text-[11px] font-bold text-[#ea580c] uppercase tracking-[0.2em] mb-4">Ruang Baca</span>
          <h2 className="text-[28px] md:text-5xl font-extrabold text-black leading-tight tracking-tight mb-3">
            Berita & Artikel<br className="hidden md:block" />
            <span className="text-[#ea580c]"> Terbaru</span>
          </h2>
          <p className="text-black/50 text-[14px] md:text-lg max-w-2xl font-medium">
            Catatan proyek dan panduan teknis dari tim kami — ditulis dari pengalaman lapangan.
          </p>
        </div>

        {/* Cards */}
        <div
          ref={cards.ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className={`group flex flex-col items-stretch justify-start shrink-0 w-full rounded-2xl overflow-hidden border border-black/[0.06] bg-white transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-[#ea580c]/20 ${cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/5">
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

              <div className="flex flex-col flex-1 p-5 md:p-6">
                <h3 className="text-[16px] md:text-xl font-black text-black leading-snug mb-2.5 line-clamp-2 group-hover:text-[#ea580c] transition-colors duration-200">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-black/45 text-[13px] md:text-[14px] leading-relaxed line-clamp-3 flex-1">{article.excerpt}</p>
                )}
                <div className="mt-4 pt-3 border-t border-black/6 flex items-center gap-2.5 text-[11px] text-black/40">
                  <span>{formatNewsDate(article.published_at)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.read_minutes} mnt baca</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`mt-10 md:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-black/6 transition-all duration-700 ${cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <p className="text-black/35 text-[13px] text-center sm:text-left">Ingin membaca lebih banyak?</p>
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white text-[13px] font-bold uppercase tracking-wider hover:bg-[#ea580c] transition-colors duration-200 hover:shadow-[0_0_20px_rgba(255,145,77,0.3)] hover:-translate-y-1"
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
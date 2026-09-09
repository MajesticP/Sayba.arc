"use client"

import Link from "next/link"
import { useInView } from "@/hooks/use-in-view"
import type { Berita } from "@/lib/database.types"
import { formatNewsDate, getCategoryColor, getCategoryLabel } from "@/lib/news-data"

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

export default function NewsHighlight({ articles }: { articles: Berita[] }) {
  const header = useInView()
  const cards = useInView({ threshold: 0.08 })

  // Belum ada artikel terbit — sembunyikan section-nya, sama seperti Services
  if (!articles.length) return null

  return (
    <section className="py-10 md:py-24 bg-white" id="berita">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          ref={header.ref}
          className={`mb-7 md:mb-12 transition-all duration-700 ease-out ${header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff914d]/10 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff914d]">Ruang Baca</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 className="text-[22px] leading-tight md:text-5xl font-black text-black">
                Berita &amp; Artikel<br className="hidden md:block" />
                <span className="text-[#ff914d]"> Terbaru</span>
              </h2>
              <p className="text-black/50 text-[13px] md:text-base mt-2 max-w-md">
                Catatan proyek dan panduan teknis dari tim kami — ditulis dari pengalaman lapangan.
              </p>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-black/50 hover:text-black transition-colors group self-start md:self-auto"
            >
              Lihat semua berita
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Kartu */}
        <div ref={cards.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className={`group flex flex-col items-stretch justify-start rounded-xl md:rounded-2xl overflow-hidden border border-black/10 bg-white transition-all duration-700 hover:-translate-y-1 hover:shadow-2xl ${cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
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
                <div className="mt-3 pt-2.5 border-t border-black/8 flex items-center gap-2 text-[11px] text-black/40">
                  <span>{formatNewsDate(article.published_at)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.read_minutes} mnt baca</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Strip penutup */}
        <div
          className={`mt-6 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-t border-black/8 transition-all duration-700 ${cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <p className="text-black/35 text-[13px] text-center sm:text-left">Ingin membaca lebih banyak?</p>
          <Link
            href="/berita"
            className="btn-shine inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-[13px] font-semibold hover:bg-[#ff914d] transition-colors duration-200 hover:scale-105 active:scale-95"
          >
            Buka Halaman Berita
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

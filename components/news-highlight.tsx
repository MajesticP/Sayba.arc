"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import type { Berita } from "@/lib/database.types"
import type { KategoriItem } from "@/lib/kategori"
import { formatNewsDate } from "@/lib/news-data"

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

/**
 * NewsHighlight: section Berita di beranda.
 *
 * Kartu dengan foto, berbeda dari section Informasi yang berbentuk daftar.
 * Perbedaan bentuk ini disengaja: berita dibaca karena ketertarikan pada
 * gambar dan topik, dokumen dibaca karena judulnya.
 */
export default function NewsHighlight({
  articles,
  kategori,
}: {
  articles: Berita[]
  kategori: KategoriItem[]
}) {
  const header = useInView()
  const cards = useInView({ threshold: 0.08 })

  // Belum ada artikel terbit: section tidak ditampilkan sama sekali.
  if (!articles.length) return null

  const labelOf = (slug: string) =>
    kategori.find((k) => k.slug.toLowerCase() === slug.toLowerCase())?.label ?? slug

  return (
    <section className="py-10 md:py-24" id="berita">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          ref={header.ref}
          className={`mb-7 md:mb-12 transition-all duration-700 ease-out ${
            header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-[12px] font-semibold text-orange-text mb-2">Berita</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 className="text-[22px] leading-tight md:text-[36px] font-bold text-navy">
                Catatan Kerja &amp; Kabar Tim
              </h2>
              <p className="text-slate-brand text-[13.5px] md:text-base mt-2 max-w-md">
                Ditulis dari pengalaman lapangan, bukan dari brosur.
              </p>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-brand hover:text-navy transition-colors group self-start md:self-auto"
            >
              Lihat semua berita
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div
          ref={cards.ref}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mb-2 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 md:gap-6 sm:overflow-visible sm:pb-0 sm:mb-0"
        >
          {articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className={`group flex flex-col items-stretch justify-start shrink-0 w-[86vw] snap-center sm:w-auto sm:shrink rounded-xl md:rounded-2xl overflow-hidden border border-ice-line bg-white transition-all duration-700 hover:-translate-y-1 hover:shadow-xl hover:border-orange ${
                cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative w-full aspect-[8/5] overflow-hidden bg-ice-dim">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gdriveToImg(article.image_url)}
                  alt=""
                  loading="lazy"
                  className="card-img-fill transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-navy bg-orange">
                  {labelOf(article.category)}
                </span>
              </div>

              <div className="flex flex-col flex-1 p-4">
                <h3 className="text-[15px] font-bold text-navy leading-snug mb-1.5 line-clamp-2 group-hover:text-orange-text transition-colors duration-200">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-slate-brand text-[13px] leading-relaxed line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-3 pt-2.5 border-t border-ice-line flex items-center gap-2 text-[11.5px] text-slate-brand">
                  <span>{formatNewsDate(article.published_at)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.read_minutes} mnt baca</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Petunjuk geser: mobile saja. Penanda dekoratif, bukan kontrol. */}
        <div className="flex items-center justify-center mt-3 sm:hidden">
          {articles.map((a) => (
            <span key={a.id} className="flex items-center justify-center w-6 h-6">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-brand/60" />
            </span>
          ))}
          <span className="text-[10px] text-slate-brand ml-1.5">Geser untuk lihat lainnya</span>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { ArrowRight, Clock, FileText } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import type { Informasi } from "@/lib/database.types"
import type { KategoriItem } from "@/lib/kategori"
import { formatInformasiDate } from "@/lib/informasi-data"

/**
 * InformasiHighlight: section Informasi di beranda.
 *
 * Berbeda dari section Berita: dokumen disajikan sebagai daftar bernomor
 * dengan garis ukur, bukan kartu bergambar. Alasannya, dokumen teknis dibaca
 * karena judulnya, bukan karena fotonya. Bentuk daftar juga memberi variasi
 * komposisi di beranda sehingga dua section tidak terasa kembar.
 */
export default function InformasiHighlight({
  articles,
  kategori,
}: {
  articles: Informasi[]
  kategori: KategoriItem[]
}) {
  const header = useInView()
  const list = useInView({ threshold: 0.05 })

  // Belum ada dokumen: section tidak ditampilkan sama sekali.
  if (!articles.length) return null

  const labelOf = (slug: string) =>
    kategori.find((k) => k.slug.toLowerCase() === slug.toLowerCase())?.label ?? slug

  return (
    <section className="py-10 md:py-24" id="informasi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          ref={header.ref}
          className={`mb-7 md:mb-12 transition-all duration-700 ease-out ${
            header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-orange-text mb-2">Informasi</p>
              <h2 className="text-[22px] leading-tight md:text-[36px] font-bold text-navy">
                Panduan &amp; Standar Kerja
              </h2>
              <p className="text-slate-brand text-[13.5px] md:text-base mt-2 max-w-md">
                Acuan yang kami pakai sehari-hari, terbuka untuk Anda baca.
              </p>
            </div>
            <Link
              href="/informasi"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-brand hover:text-navy transition-colors group self-start md:self-auto"
            >
              Lihat semua informasi
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div ref={list.ref} className="border-t border-ice-line">
          {articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/informasi/${article.slug}`}
              className={`group grid grid-cols-[auto_1fr_auto] items-start gap-4 md:gap-6 py-5 md:py-6 border-b border-ice-line transition-all duration-500 hover:bg-white/70 px-1 md:px-3 ${
                list.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="flex items-center gap-3 pt-0.5">
                <span className="text-[12px] font-bold text-slate-brand tabular-nums w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="hidden sm:flex w-9 h-9 rounded-lg bg-ice-dim items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-navy" aria-hidden="true" />
                </span>
              </span>

              <span className="min-w-0">
                <span className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <span className="text-[11.5px] font-semibold text-orange-text">
                    {labelOf(article.category)}
                  </span>
                  <span aria-hidden="true" className="text-slate-brand">·</span>
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-brand">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {article.read_minutes} mnt baca
                  </span>
                </span>
                <span className="block text-[16px] md:text-[18px] font-bold text-navy leading-snug group-hover:text-orange-text transition-colors line-clamp-2">
                  {article.title}
                </span>
                {article.excerpt && (
                  <span className="block text-[13.5px] text-slate-brand leading-relaxed line-clamp-2 mt-1.5">
                    {article.excerpt}
                  </span>
                )}
              </span>

              <span className="pt-1 text-[12px] text-slate-brand whitespace-nowrap hidden md:block">
                {formatInformasiDate(article.published_at)}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-brand text-[13.5px] text-center sm:text-left">
            Butuh dokumen yang belum ada di daftar?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy text-ice text-[13.5px] font-semibold hover:bg-navy-700 transition-colors"
          >
            Tanyakan ke tim kami
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

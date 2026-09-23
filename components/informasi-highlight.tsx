"use client"

import Link from "next/link"
import { ArrowRight, Clock, FileText } from "lucide-react"
import { BoardSection } from "@/components/cutting-board-bg"
import CarouselGulir from "@/components/carousel-gulir"
import { useInView } from "@/hooks/use-in-view"
import type { Informasi } from "@/lib/database.types"
import type { KategoriItem } from "@/lib/kategori"
import { formatInformasiDate } from "@/lib/informasi-data"

/**
 * InformasiHighlight: section Informasi di beranda.
 *
 * Bentuknya daftar dokumen bernomor yang digulir vertikal: kartunya benar-benar
 * digulir (bukan digeser satu langkah dengan lompatan), bisa diseret manual,
 * dan bergulir otomatis. Jendelanya setinggi DUA kartu, jadi tinggi section
 * tetap sama berapa pun jumlah dokumennya.
 *
 * Kenapa daftar, bukan kartu bergambar: dokumen teknis dibaca karena judulnya,
 * bukan karena fotonya. Bentuk daftar juga memberi variasi komposisi di
 * beranda sehingga tidak terasa kembar dengan section Berita.
 *
 * Gulirannya aktif hanya kalau dokumennya lebih dari dua. Dengan dua dokumen
 * atau kurang, semuanya tampil sekaligus dan tidak ada guliran sama sekali.
 */
export default function InformasiHighlight({
  articles,
  kategori,
}: {
  articles: Informasi[]
  kategori: KategoriItem[]
}) {
  const header = useInView()

  // Belum ada dokumen: section tidak ditampilkan sama sekali.
  if (!articles.length) return null

  const labelOf = (slug: string) =>
    kategori.find((k) => k.slug.toLowerCase() === slug.toLowerCase())?.label ?? slug

  return (
    <BoardSection id="informasi" labelledBy="informasi-heading" panelClassName="panel-top-pad">
      <div className="panel-pad">

        <div
          ref={header.ref}
          className={`mb-6 md:mb-10 transition-all duration-700 ease-out ${
            header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <p className="text-[12px] font-bold text-orange-text mb-2">Informasi</p>
              <h2 id="informasi-heading" className="text-[22px] leading-tight md:text-[34px] font-bold text-navy">
                Panduan &amp; Standar Kerja
              </h2>
              <p className="text-slate-brand text-[13.5px] md:text-[15px] mt-2 max-w-md leading-relaxed">
                Acuan yang kami pakai sehari-hari, terbuka untuk Anda baca.
              </p>
            </div>
            <Link
              href="/informasi"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-brand hover:text-navy transition-colors group self-start md:self-auto shrink-0"
            >
              Lihat semua informasi
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mb-3">
          <h3 className="text-[15px] md:text-[17px] font-bold text-navy">Dokumen terbaru</h3>
          <span className="text-[11px] font-bold text-slate-brand px-2 py-0.5 rounded-full bg-ice-dim tabular-nums">
            {articles.length}
          </span>
        </div>

        <CarouselGulir jumlah={articles.length} minItem={2} label="Dokumen informasi">
          {articles.map((article, i) => (
            <div key={article.id} data-item>
              <Link
                href={`/informasi/${article.slug}`}
                className="kartu-sorot group grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-start gap-4 md:gap-6 rounded-xl md:rounded-2xl border border-ice-line bg-white px-4 md:px-6 py-4 md:py-5 transition-all duration-300 hover:border-orange/45 hover:bg-ice-dim/60"
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
                    <span className="text-[11.5px] font-bold text-orange-text">
                      {labelOf(article.category)}
                    </span>
                    <span aria-hidden="true" className="text-slate-brand">·</span>
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-brand">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {article.read_minutes} mnt baca
                    </span>
                  </span>
                  <span className="block text-[15.5px] md:text-[17px] font-bold text-navy leading-snug group-hover:text-orange-text transition-colors line-clamp-2">
                    {article.title}
                  </span>
                  {article.excerpt && (
                    <span className="block text-[13px] text-slate-brand leading-relaxed line-clamp-2 mt-1.5">
                      {article.excerpt}
                    </span>
                  )}
                  <span className="block md:hidden text-[11.5px] text-slate-brand mt-2">
                    {formatInformasiDate(article.published_at)}
                  </span>
                </span>

                <span className="hidden md:flex items-center gap-3 pt-1 shrink-0">
                  <span className="text-[12px] text-slate-brand whitespace-nowrap">
                    {formatInformasiDate(article.published_at)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-brand group-hover:text-orange-text group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                </span>
              </Link>
            </div>
          ))}
        </CarouselGulir>

        <div className="mt-6 md:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-ice-line">
          <p className="text-slate-brand text-[13.5px] text-center sm:text-left leading-relaxed">
            Butuh dokumen yang belum ada di daftar?
          </p>
          <Link href="/contact" className="btn-outline w-full sm:w-auto shrink-0">
            Tanyakan ke tim kami
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </BoardSection>
  )
}

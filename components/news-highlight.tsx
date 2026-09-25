"use client"

import Link from "next/link"
import { isGambarContoh } from "@/lib/image-path"
import { gambarAmanAtau } from "@/lib/gambar"
import { ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { BoardSection } from "@/components/cutting-board-bg"
import TiltCard from "@/components/tilt-card"
import type { Berita } from "@/lib/database.types"
import type { KategoriItem } from "@/lib/kategori"
import { formatNewsDate } from "@/lib/news-data"

/**
 * Gambar cadangan bila berita belum punya foto.
 *
 * Sebelumnya ini menunjuk berkas contoh di /public/berita. Berkas contoh itu
 * sudah dihapus, dan memakai foto contoh sebagai cadangan justru menyesatkan
 * pembaca (foto proyek lain tampil seolah milik berita ini). Karena itu
 * cadangannya bukan gambar, melainkan bidang bergaris ukur dengan inisial
 * judul: jujur bahwa fotonya belum ada, dan tetap rapi.
 */
const FALLBACK_IMG = ""

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string {
  if (!url || isGambarContoh(url)) return FALLBACK_IMG
  return gambarAmanAtau(url, FALLBACK_IMG)
}

/**
 * NewsHighlight: section Berita di beranda.
 *
 * Kartu dengan foto, berbeda dari section Informasi yang berbentuk daftar.
 * Perbedaan bentuk ini disengaja: berita dibaca karena ketertarikan pada
 * gambar dan topik, dokumen dibaca karena judulnya.
 *
 * Label kategori memakai warna kategorinya sebagai GARIS dan TINT saja,
 * sedangkan teksnya selalu navy. Alasannya, warna kategori dipilih untuk
 * tampil sebagai bidang, bukan sebagai teks, dan sebagian di antaranya
 * (mis. orange) gagal kontras bila dipakai menulis di latar terang.
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

  const kategoriOf = (slug: string) =>
    kategori.find((k) => k.slug.toLowerCase() === slug.toLowerCase())

  return (
    <BoardSection id="berita" aria-labelledby="berita-heading">
      {/* Pita kepala: label, judul, dan keterangan bagian. Latarnya satu tingkat
          lebih gelap dari panel supaya terbaca sebagai kepala bagian, bukan
          menyatu dengan daftar berita di bawahnya. */}
      <div className="kepala-bagian">
        <div
          ref={header.ref}
          className={`transition-all duration-700 ease-out ${
            header.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-[12px] font-bold text-orange-text mb-2">Berita</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 id="berita-heading" className="text-[22px] leading-tight md:text-[34px] font-bold text-navy">
                Catatan Kerja &amp; Kabar Tim
              </h2>
              <p className="text-slate-brand text-[13.5px] md:text-[15px] mt-2 max-w-md leading-relaxed">
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
      </div>

      <div className="panel-pad pt-6 md:pt-8">
        {/* Di ponsel kartu digulir mendatar dengan lebar 84% supaya kartu
            berikutnya tetap mengintip, jadi jelas masih ada lanjutannya. */}
        <div
          ref={cards.ref}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mb-3 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 md:gap-6 sm:overflow-visible sm:pb-0 sm:mb-0"
        >
          {articles.map((article, i) => {
            const kat = kategoriOf(article.category)
            const warna = kat?.color ?? "#5a5c62"
            const label = kat?.label ?? article.category
            return (
              /* Kartu berita miring mengikuti kursor, efek TiltedCard dari
                 React Bits. Di layar sentuh efeknya mati sendiri. */
              <TiltCard
                key={article.id}
                max={4}
                lift={3}
                className="shrink-0 w-[85%] snap-center sm:w-auto sm:shrink"
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className={`kartu-sorot kartu-angkat kartu-putih group flex flex-col items-stretch justify-start h-full overflow-hidden transition-all duration-700 hover:border-orange ${
                    cards.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="relative w-full aspect-[8/5] overflow-hidden bg-ice-dim">
                    {gdriveToImg(article.image_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={gdriveToImg(article.image_url)}
                        alt=""
                        loading="lazy"
                        className="card-img-fill transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      /* Belum ada foto: bidang garis ukur dengan inisial judul.
                         Bukan foto contoh, supaya tidak menyesatkan pembaca. */
                      <span className="absolute inset-0 flex items-center justify-center cutting-grid">
                        <span className="text-[34px] font-bold text-navy/25 select-none" aria-hidden="true">
                          {article.title.charAt(0)}
                        </span>
                      </span>
                    )}
                    {/* Label kategori: warna kategori jadi garis + tint tipis,
                        teksnya tetap navy supaya selalu lolos kontras. */}
                    <span
                      className="absolute top-2.5 left-2.5 inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] font-bold text-navy"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.94)",
                        boxShadow: `inset 0 0 0 1.5px ${warna}`,
                      }}
                    >
                      {label}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-4 md:p-5">
                    <h3 className="text-[15px] md:text-[16px] font-bold text-navy leading-snug mb-1.5 line-clamp-2 group-hover:text-orange-text transition-colors duration-200">
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
              </TiltCard>
            )
          })}
        </div>

        {/* Petunjuk geser: mobile saja. Penanda dekoratif, bukan kontrol. */}
        <div className="flex items-center justify-center mt-4 sm:hidden">
          {articles.map((a) => (
            <span key={a.id} className="flex items-center justify-center w-6 h-6">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-brand/60" />
            </span>
          ))}
          <span className="text-[10.5px] text-slate-brand ml-1.5">Geser untuk lihat lainnya</span>
        </div>

        <div className="mt-6 md:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-ice-line">
          <p className="text-slate-brand text-[13.5px] text-center sm:text-left leading-relaxed">
            Ada pertanyaan tentang cara kami bekerja?
          </p>
          <Link href="/contact" className="btn-outline w-full sm:w-auto shrink-0">
            Hubungi kami
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </BoardSection>
  )
}

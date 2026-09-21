import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { getDept } from "@/lib/layanan-config"

/**
 * Services: section Layanan di beranda.
 *
 * Layanan bersifat TERPUSAT: tidak ada paket, tidak ada tingkat harga.
 * Klien menghubungi kami, lingkup dan biaya disusun per proyek. Karena itu
 * tidak ada kartu harga di sini, hanya lingkup pekerjaan dan tautan ke detail.
 */

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

export default function Services({
  allLayanan,
  depts,
}: {
  allLayanan: Layanan[]
  depts: LayananDept[]
}) {
  return (
    <section className="py-10 md:py-24" id="layanan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-7 md:mb-12">
          <p className="text-[12px] font-semibold text-orange-text mb-2">Layanan</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-[22px] leading-tight md:text-[36px] font-bold text-navy">
                Dua Departemen, Satu Standar Kerja
              </h2>
              <p className="text-slate-brand text-[13.5px] md:text-base mt-2 max-w-xl">
                Setiap pekerjaan disusun per proyek: lingkup, jadwal, dan biaya
                disepakati tertulis sebelum mulai. Tidak ada paket tetap, karena
                kebutuhan tiap klien berbeda.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-brand hover:text-navy transition-colors group self-start md:self-auto shrink-0"
            >
              Lihat semua layanan
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Dua departemen sebagai dua kolom. Isi kolom adalah layanan yang
            benar-benar ada di database, bukan daftar contoh. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {depts.map((dept) => {
            const items = allLayanan.filter((l) => l.dept === dept.value)
            return (
              <div key={dept.value} className="bg-white rounded-2xl border border-ice-line overflow-hidden">
                <div className="bg-navy px-5 md:px-7 py-5 md:py-6">
                  <h3 className="text-[17px] md:text-[20px] font-bold text-ice">{dept.label}</h3>
                  <p className="text-ice/75 text-[13px] leading-relaxed mt-1.5">{dept.description}</p>
                </div>

                <div className="p-5 md:p-7">
                  <ul className="space-y-2.5">
                    {dept.scope.map((s) => (
                      <li key={s} className="flex items-start gap-2.5 text-[14px] text-ink leading-relaxed">
                        <Check className="w-4 h-4 text-orange-text shrink-0 mt-0.5" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>

                  {/* Kalau ada layanan terbit di departemen ini, tampilkan
                      tautan langsung ke halaman detailnya. */}
                  {items.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-ice-line space-y-2">
                      <p className="text-[11.5px] font-semibold text-slate-brand uppercase tracking-wider">
                        Sudah kami kerjakan
                      </p>
                      {items.map((item) => {
                        const img = gdriveToImg(item.image_url)
                        return (
                          <Link
                            key={item.id}
                            href={`/services/${item.slug}`}
                            className="group flex items-center gap-3.5 p-2 -mx-2 rounded-xl hover:bg-ice-dim transition-colors"
                          >
                            {/* Foto 1:1 di kiri, seperti di halaman layanan */}
                            <span className="relative w-12 h-12 rounded-lg overflow-hidden bg-ice-dim shrink-0">
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={img} alt="" loading="lazy" className="card-img-fill" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-brand">
                                  {item.title.charAt(0)}
                                </span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[14px] font-semibold text-navy group-hover:text-orange-text transition-colors line-clamp-1">
                                {item.title}
                              </span>
                              {item.category && (
                                <span className="block text-[11.5px] text-slate-brand line-clamp-1 mt-0.5">
                                  {item.category}
                                </span>
                              )}
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-brand group-hover:text-orange-text group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-ice-line">
          <p className="text-slate-brand text-[13.5px] text-center sm:text-left max-w-lg">
            Belum yakin lingkupnya? Kirim kebutuhan Anda, kami susun Kerangka Acuan Kerja
            beserta rincian biaya.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange text-navy text-[13.5px] font-bold hover:bg-orange-soft transition-colors shrink-0"
          >
            Minta penawaran
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

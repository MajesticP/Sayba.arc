import Link from "next/link"
import { isGambarContoh } from "@/lib/image-path"
import { ArrowRight, Check } from "lucide-react"
import { BoardSection } from "@/components/cutting-board-bg"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"

/**
 * Services: section Layanan di beranda.
 *
 * Layanan bersifat TERPUSAT: tidak ada paket, tidak ada tingkat harga.
 * Klien menghubungi kami, lingkup dan biaya disusun per proyek. Karena itu
 * tidak ada kartu harga di sini, hanya lingkup pekerjaan dan tautan ke detail.
 *
 * Setiap departemen dibungkus kartu tersendiri di dalam panel, jadi tidak ada
 * teks yang jatuh langsung di atas permukaan panel tanpa bingkai.
 */

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string | null {
  if (!url || isGambarContoh(url)) return null
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
    <BoardSection id="layanan" aria-labelledby="layanan-heading" panelClassName="panel-top-pad">
      <div className="px-5 sm:px-7 lg:px-10 pb-7 md:pb-12">

        <div className="mb-6 md:mb-10">
          <p className="text-[12px] font-bold text-orange-text mb-2">Layanan</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 id="layanan-heading" className="text-[22px] leading-tight md:text-[34px] font-bold text-navy">
                Dua Departemen, Satu Standar Kerja
              </h2>
              <p className="text-slate-brand text-[13.5px] md:text-[15px] mt-2 max-w-xl leading-relaxed">
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
              <div key={dept.value} className="bg-white rounded-2xl border border-ice-line overflow-hidden flex flex-col">
                <div className="bg-navy px-5 md:px-7 py-5 md:py-6">
                  <h3 className="text-[17px] md:text-[20px] font-bold text-ice">{dept.label}</h3>
                  <p className="text-ice/80 text-[13px] leading-relaxed mt-1.5">{dept.description}</p>
                </div>

                <div className="p-5 md:p-7 flex-1 flex flex-col">
                  <ul className="space-y-2.5">
                    {dept.scope.map((s) => (
                      <li key={s} className="flex items-start gap-2.5 text-[14px] text-ink leading-relaxed">
                        <Check className="w-4 h-4 text-orange-text shrink-0 mt-0.5" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>

                  {/* Kalau ada layanan terbit di departemen ini, tampilkan
                      tautan langsung ke halaman detailnya. Bagian ini ditaruh
                      di bawah (mt-auto) supaya kedua kartu tetap sejajar
                      walau jumlah lingkupnya berbeda. */}
                  {items.length > 0 ? (
                    <div className="mt-auto pt-6">
                      <div className="pt-5 border-t border-ice-line space-y-2">
                        <p className="text-[11.5px] font-bold text-slate-brand uppercase tracking-wider">
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
                    </div>
                  ) : (
                    /* Departemen belum punya layanan terbit: katakan apa adanya
                       dan beri satu tindakan, jangan biarkan kartu menggantung. */
                    <div className="mt-auto pt-6">
                      <div className="pt-5 border-t border-ice-line">
                        <p className="text-[12.5px] text-slate-brand leading-relaxed mb-3">
                          Lingkup di atas bisa langsung ditanyakan. Kami susun penawaran per proyek.
                        </p>
                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-orange-text hover:text-navy transition-colors group"
                        >
                          Tanyakan lingkup ini
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 md:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-ice-line">
          <p className="text-slate-brand text-[13.5px] text-center sm:text-left max-w-lg leading-relaxed">
            Belum yakin lingkupnya? Kirim kebutuhan Anda, kami susun Kerangka Acuan Kerja
            beserta rincian biaya.
          </p>
          <Link href="/contact" className="btn-solid w-full sm:w-auto shrink-0">
            Minta penawaran
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </BoardSection>
  )
}

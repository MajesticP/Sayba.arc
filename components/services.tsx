"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { isGambarContoh } from "@/lib/image-path"
import { BoardSection } from "@/components/cutting-board-bg"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"

/**
 * Services: section Layanan di beranda.
 *
 * Semua layanan yang terbit ditampilkan, bergulir sendiri ke atas seperti
 * papan pengumuman. Dua kartu terlihat sekaligus, di ponsel maupun desktop,
 * supaya jumlahnya sama dan tidak ada kejutan tata letak saat berpindah
 * perangkat.
 *
 * Cara gulirnya: daftar ditulis DUA KALI bersebelahan, lalu keduanya digeser
 * bersama dengan satu animasi CSS. Saat salinan pertama habis, salinan kedua
 * sudah berada tepat di posisi awalnya, jadi gulirannya tidak pernah terlihat
 * putus. Salinan kedua disembunyikan dari pembaca layar supaya tidak dibaca
 * dua kali.
 *
 * Berhenti saat kursor berhenti di atasnya, saat ada yang menekan Tab ke
 * dalamnya, dan saat pengguna memilih reduce motion (WCAG 2.2.2: gerakan
 * lebih dari 5 detik harus bisa dihentikan).
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

/** Tinggi satu kartu. Dipakai untuk menghitung tinggi jendela carousel. */
const KARTU_H = 108
const JARAK = 12

export default function Services({
  allLayanan,
  depts,
}: {
  allLayanan: Layanan[]
  depts: LayananDept[]
}) {
  const labelDept = (value: string) => depts.find((d) => d.value === value)?.label ?? value
  const warnaDept = (value: string) => depts.find((d) => d.value === value)?.color ?? "#5a5c62"

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

        {/* Lingkup kerja tiap departemen, sebagai rujukan cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-7 md:mb-9">
          {depts.map((dept) => (
            <div key={dept.value} className="rounded-2xl border border-ice-line bg-white p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: dept.color }}
                  aria-hidden="true"
                />
                <h3 className="text-[14.5px] md:text-[16px] font-bold text-navy">{dept.label}</h3>
              </div>
              <ul className="space-y-2">
                {(dept.scope ?? []).slice(0, 4).map((s) => (
                  <li key={s} className="flex items-start gap-2 text-[12.5px] md:text-[13.5px] text-ink leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-orange-text shrink-0 mt-0.5" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Carousel layanan ────────────────────────────────────────────── */}
        {allLayanan.length > 0 ? (
          <div className="relative">
            <p className="text-[11.5px] font-bold text-slate-brand uppercase tracking-wider mb-3">
              Sudah kami kerjakan
            </p>

            {/* Jendela: tingginya tepat dua kartu + satu jarak, jadi yang
                terlihat selalu dua, di layar sekecil apa pun. */}
            <div
              className="services-marquee overflow-hidden"
              style={{ height: KARTU_H * 2 + JARAK }}
            >
              <div className="services-track" style={{ ["--gap" as string]: `${JARAK}px` }}>
                {[0, 1].map((salinan) => (
                  <div
                    key={salinan}
                    className="services-group"
                    aria-hidden={salinan === 1 ? true : undefined}
                  >
                    {allLayanan.map((item) => {
                      const img = gdriveToImg(item.image_url)
                      return (
                        <Link
                          key={`${salinan}-${item.id}`}
                          href={`/services/${item.slug}`}
                          tabIndex={salinan === 1 ? -1 : undefined}
                          className="group flex items-center gap-3.5 rounded-2xl border border-ice-line bg-white px-3.5 md:px-4 hover:border-orange hover:bg-ice-dim/60 transition-colors"
                          style={{ height: KARTU_H, marginBottom: JARAK }}
                        >
                          {/* Foto 1:1 di kiri, sama seperti halaman layanan */}
                          <span className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-ice-dim shrink-0">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt="" loading="lazy" className="card-img-fill" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-[13px] font-bold text-slate-brand">
                                {item.title.charAt(0)}
                              </span>
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 mb-1">
                              <span
                                className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full text-navy shrink-0"
                                style={{
                                  backgroundColor: "rgba(255,255,255,0.94)",
                                  boxShadow: `inset 0 0 0 1.5px ${warnaDept(item.dept)}`,
                                }}
                              >
                                {labelDept(item.dept)}
                              </span>
                            </span>
                            <span className="block text-[14.5px] md:text-[15.5px] font-bold text-navy group-hover:text-orange-text transition-colors line-clamp-1">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="block text-[12px] md:text-[12.5px] text-slate-brand leading-snug line-clamp-1 mt-0.5">
                                {item.description}
                              </span>
                            )}
                          </span>

                          <ArrowRight
                            className="w-4 h-4 text-slate-brand group-hover:text-orange-text group-hover:translate-x-0.5 transition-all shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Gradasi atas-bawah: menandakan daftarnya bergulir, bukan
                terpotong. Warnanya mengikuti permukaan panel, bukan hitam. */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14"
              style={{ background: "linear-gradient(to top, var(--panel), transparent)" }}
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-ice-line bg-white p-5 md:p-6">
            <p className="text-[13.5px] text-slate-brand leading-relaxed mb-3">
              Daftar pekerjaan belum kami tampilkan di sini. Lingkup tiap departemen
              di atas bisa langsung ditanyakan.
            </p>
            <Link href="/contact" className="btn-solid">
              Tanyakan lingkup
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        )}

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

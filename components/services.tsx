"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BoardSection } from "@/components/cutting-board-bg"
import ServiceCard from "@/components/service-card"
import CarouselGulir from "@/components/carousel-gulir"
import { findDeptColor, findDeptLabel, type LayananDept } from "@/lib/layanan-config"
import type { Layanan } from "@/lib/database.types"

/**
 * Services: section Layanan di beranda.
 *
 * SATU carousel untuk semua layanan, bukan satu carousel per departemen.
 * Daftarnya adalah "layanan unggulan" yang dipilih admin lewat kolom
 * `featured_order` (angka 1, 2, 3 = tampil di beranda, kecil tampil lebih
 * dulu). Jadi admin menentukan sendiri mana yang naik ke beranda, dan
 * urutannya persis seperti yang diatur di Admin Dashboard.
 *
 * Kenapa tidak dipisah IT/Engineering lagi: pembaca beranda sedang menilai
 * "apa yang bisa dikerjakan vendor ini", bukan memilih departemen. Pemisahan
 * memaksa dua kolom dengan tinggi berbeda dan membuat daftar terlihat kosong
 * kalau salah satu departemen hanya punya satu layanan unggulan. Departemen
 * tetap terbaca dari lencana di tiap kartu.
 *
 * Gulirannya memakai CarouselGulir: kartunya benar-benar digulir (bukan
 * digeser satu langkah), bisa diseret manual, dan bergulir otomatis. Aktif
 * hanya kalau layanannya lebih dari dua.
 */
export default function Services({
  allLayanan,
  depts,
}: {
  allLayanan: Layanan[]
  depts: LayananDept[]
}) {
  // Beranda hanya menampilkan layanan unggulan. Bila admin belum menandai satu
  // pun, seluruh layanan yang terkirim tetap ditampilkan supaya section ini
  // tidak pernah kosong tanpa alasan.
  const unggulan = allLayanan.filter((l) => l.featured_order !== null)
  const items = unggulan.length > 0 ? unggulan : allLayanan

  return (
    <BoardSection id="layanan" labelledBy="layanan-heading" panelClassName="panel-top-pad">
      <div className="panel-pad">

        <div className="mb-6 md:mb-9">
          <p className="text-[12px] font-bold text-orange-text mb-2">Layanan</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 id="layanan-heading" className="text-[22px] leading-tight md:text-[34px] font-bold text-navy">
                Yang Bisa Kami Kerjakan
              </h2>
              <p className="text-slate-brand text-[13.5px] md:text-[15px] mt-2 max-w-xl leading-relaxed">
                Setiap pekerjaan disusun per proyek: lingkup, jadwal, dan biaya
                disepakati tertulis sebelum mulai.
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

        <CarouselLayanan items={items} depts={depts} />

        <div className="mt-7 md:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-ice-line">
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

/** Jumlah kartu yang terlihat sekaligus di jendela. */
const TERLIHAT = 2

function CarouselLayanan({ items, depts }: { items: Layanan[]; depts: LayananDept[] }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <h3 className="text-[15px] md:text-[17px] font-bold text-navy">Layanan unggulan</h3>
        <span className="text-[11px] font-bold text-slate-brand px-2 py-0.5 rounded-full bg-ice-dim tabular-nums">
          {items.length}
        </span>
      </div>

      {/* Dua kartu terlihat sekaligus; isinya digulir otomatis dan bisa
          diseret manual. Kalau layanan unggulan hanya dua atau kurang,
          semuanya tampil sekaligus dan tidak ada guliran sama sekali. */}
      <CarouselGulir jumlah={items.length} minItem={TERLIHAT} label="Layanan unggulan">
        {items.map((item) => (
          <div key={item.id} data-item>
            <ServiceCard
              item={item}
              accent={findDeptColor(depts, item.dept)}
              deptLabel={findDeptLabel(depts, item.dept)}
            />
          </div>
        ))}
      </CarouselGulir>
    </div>
  )
}

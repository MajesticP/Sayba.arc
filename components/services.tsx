"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { BoardSection } from "@/components/cutting-board-bg"
import ServiceCard from "@/components/service-card"
import { findDept, findDeptColor, findDeptLabel, type LayananDept } from "@/lib/layanan-config"
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
 * tetap terbaca dari lencana warna di tiap kartu, jadi informasinya tidak
 * hilang, hanya tidak lagi jadi pembatas kolom.
 *
 * Jendela carousel setinggi DUA kartu, jadi selalu tepat dua kartu terlihat,
 * di ponsel maupun desktop. Kartunya memakai komponen bersama
 * (components/service-card.tsx) dengan tinggi dari --kartu-h, jadi ukurannya
 * sama persis dengan kartu di halaman Layanan.
 *
 * Gerakannya bertingkat seperti banner promosi: satu langkah satu kartu, bisa
 * otomatis maupun manual. Arahnya ke atas. Kendalinya lengkap: tombol
 * naik/turun, usap di layar sentuh, tombol posisi, dan berhenti saat kursor
 * di atasnya.
 *
 * Cara gulirnya: daftar ditulis dua kali dan hanya maju terus. Saat langkah
 * terakhir salinan pertama tercapai, salinan kedua sudah berada tepat di posisi
 * yang sama dengan salinan pertama, jadi setelah animasinya selesai posisinya
 * bisa dilompatkan kembali ke awal tanpa terlihat. Lompatan itu terjadi SETELAH
 * animasi selesai, bukan sebelumnya: kalau sebelumnya, langkah terakhir akan
 * kehilangan animasinya.
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

/** Jeda antar langkah geser otomatis (ms). Satu langkah = satu kartu. */
const JEDA_MS = 3600
/** Kartu terlihat sekaligus di jendela. */
const TERLIHAT = 2
/** Samakan dengan durasi transisi di globals.css (.services-track). */
const DURASI_MS = 700

function CarouselLayanan({ items, depts }: { items: Layanan[]; depts: LayananDept[] }) {
  const [pos, setPos] = useState(0)
  const [lompat, setLompat] = useState(false)
  const [hover, setHover] = useState(false)
  const [fokus, setFokus] = useState(false)
  const [terlihat, setTerlihat] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [adaTetikus, setAdaTetikus] = useState(false)
  const touchY = useRef<number | null>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const jumlah = items.length
  const perluGulir = jumlah > TERLIHAT

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const up = () => setReduceMotion(mq.matches)
    up()
    mq.addEventListener("change", up)
    return () => mq.removeEventListener("change", up)
  }, [])

  // Hover hanya di perangkat berpenunjuk sungguhan. Di layar sentuh, browser
  // mengirim `mouseenter` palsu setelah ketukan, dan statusnya tetap "di atas"
  // sampai pengguna mengetuk tempat lain: geser otomatis akan berhenti
  // diam-diam di ponsel kalau hover dipercaya begitu saja.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const up = () => setAdaTetikus(mq.matches)
    up()
    mq.addEventListener("change", up)
    return () => mq.removeEventListener("change", up)
  }, [])

  // Berhenti saat carousel keluar layar: tidak ada gunanya berjalan di luar
  // pandangan, dan itu memakai baterai tanpa alasan.
  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setTerlihat(e.isIntersecting), { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Reset posisi SETELAH animasi langkah terakhir selesai. Pada posisi itu
  // salinan kedua tampil persis sama dengan salinan pertama, jadi lompatannya
  // tidak terlihat, dan langkah terakhir tetap punya animasi.
  useEffect(() => {
    if (pos < jumlah) return
    const id = window.setTimeout(() => {
      setLompat(true)
      setPos((p) => p - jumlah)
    }, DURASI_MS)
    return () => window.clearTimeout(id)
  }, [pos, jumlah])

  // Matikan animasi hanya untuk satu gambar, lalu hidupkan lagi. Tanpa ini,
  // lompatannya terlihat sebagai guliran cepat ke atas.
  useEffect(() => {
    if (!lompat) return
    const id = window.requestAnimationFrame(() => setLompat(false))
    return () => window.cancelAnimationFrame(id)
  }, [lompat])

  /**
   * Maju satu kartu, TIDAK lebih dari salinan kedua.
   *
   * Salinan kedua hanya dipakai untuk satu langkah, lalu dilompatkan kembali
   * ke salinan pertama. Tanpa batas ini, geser otomatis yang berjalan beberapa
   * kali berturut-turut (mis. saat tab kembali aktif) bisa melewati salinan
   * dan menyisakan jendela kosong.
   */
  const maju = useCallback(() => setPos((p) => Math.min(p + 1, jumlah)), [jumlah])
  const mundur = useCallback(() => setPos((p) => (p <= 0 ? jumlah - 1 : p - 1)), [jumlah])

  // Geser otomatis: berhenti saat hover, fokus papan ketik, tab tidak aktif,
  // keluar layar, atau saat pengguna minta reduce motion.
  const berhenti = hover || fokus || reduceMotion || !terlihat
  useEffect(() => {
    if (berhenti || !perluGulir) return
    const id = window.setInterval(maju, JEDA_MS)
    return () => window.clearInterval(id)
  }, [berhenti, perluGulir, maju])

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setTerlihat(false)
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  if (jumlah === 0) {
    return (
      <div className="rounded-2xl border border-ice-line bg-white p-5">
        <p className="text-[13px] text-slate-brand leading-relaxed mb-3">
          Lingkup pekerjaan bisa langsung ditanyakan. Kami susun penawaran per proyek.
        </p>
        <Link href="/contact" className="btn-quiet">
          Tanyakan lingkup
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Kepala daftar: jumlah layanan + kendali geser. Kendali hanya muncul
          kalau isinya memang melebihi jendela. */}
      <div className="flex items-center gap-2.5 mb-3">
        <h3 className="text-[15px] md:text-[17px] font-bold text-navy">Layanan unggulan</h3>
        <span className="text-[11px] font-bold text-slate-brand px-2 py-0.5 rounded-full bg-ice-dim tabular-nums">
          {jumlah}
        </span>

        {perluGulir && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="flex flex-col rounded-lg border border-ice-line overflow-hidden">
              <button
                type="button"
                onClick={mundur}
                aria-label="Kartu sebelumnya"
                className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors border-b border-ice-line"
              >
                <ChevronUp size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={maju}
                aria-label="Kartu berikutnya"
                className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors"
              >
                <ChevronDown size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jendela carousel: dua kartu terlihat, tepat. */}
      <div
        ref={viewRef}
        className="services-view relative"
        data-gulir={perluGulir ? "true" : "false"}
        onMouseEnter={() => adaTetikus && setHover(true)}
        onMouseLeave={() => adaTetikus && setHover(false)}
        onFocusCapture={(e) => setFokus(e.target.matches(":focus-visible"))}
        onBlurCapture={() => setFokus(false)}
        onTouchStart={(e) => {
          touchY.current = e.touches[0].clientY
        }}
        onTouchEnd={(e) => {
          const start = touchY.current
          touchY.current = null
          if (start === null || !perluGulir) return
          const delta = e.changedTouches[0].clientY - start
          // Geser ke atas = maju, geser ke bawah = mundur.
          if (Math.abs(delta) > 40) (delta < 0 ? maju : mundur)()
        }}
      >
        <div
          className="services-track"
          data-lompat={lompat ? "true" : "false"}
          style={{ ["--pos" as string]: pos }}
        >
          {/* Dua salinan. Salinan kedua memakai `inert`: isinya sama persis,
              jadi tidak boleh dijangkau Tab maupun pembaca layar. `aria-hidden`
              saja tidak cukup karena tautan di dalamnya tetap bisa di-Tab. */}
          {(perluGulir ? [0, 1] : [0]).map((salinan) => (
            <div key={salinan} inert={salinan === 1 ? true : undefined}>
              {items.map((item) => (
                <div key={`${salinan}-${item.id}`} className="services-kartu">
                  <ServiceCard
                    item={item}
                    accent={findDeptColor(depts, item.dept)}
                    deptLabel={findDeptLabel(depts, item.dept)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Petunjuk gulir: tipis, tidak menutupi kartu. */}
        {perluGulir && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
            style={{ background: "linear-gradient(to top, var(--panel), transparent)" }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Tombol posisi: satu titik per kartu. Di bawah, rata tengah. */}
      {perluGulir && (
        <div className="flex items-center justify-center gap-1 mt-3">
          {items.map((item, i) => {
            const aktif = pos % jumlah === i
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  // Kalau sedang di salinan kedua, samakan dulu ke salinan
                  // pertama tanpa animasi supaya tidak menggulir jauh.
                  if (pos >= jumlah) {
                    setLompat(true)
                    setPos(pos - jumlah)
                    window.requestAnimationFrame(() =>
                      window.requestAnimationFrame(() => {
                        setLompat(false)
                        setPos(i)
                      })
                    )
                  } else {
                    setPos(i)
                  }
                }}
                aria-label={`Ke ${item.title}`}
                aria-current={aktif}
                className="flex items-center justify-center w-6 h-6 min-h-0 shrink-0"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    aktif ? "w-4 bg-orange" : "w-1.5 bg-ice-line"
                  }`}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

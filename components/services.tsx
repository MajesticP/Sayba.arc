"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, ChevronDown, ChevronUp, Pause, Play } from "lucide-react"
import { BoardSection } from "@/components/cutting-board-bg"
import ServiceCard from "@/components/service-card"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"

/**
 * Services: section Layanan di beranda.
 *
 * SATU carousel per departemen, bukan satu daftar campur. Pembaca yang mencari
 * "IT" tidak perlu melewati layanan departemen lain, dan tiap departemen bisa
 * punya jumlah layanan berbeda tanpa saling mengganggu tinggi bloknya.
 *
 * Jendela carousel setinggi DUA kartu, jadi selalu tepat dua kartu terlihat,
 * di ponsel maupun desktop. Kartunya memakai komponen bersama
 * (components/service-card.tsx) dengan tinggi dari --kartu-h, jadi ukurannya
 * sama persis dengan kartu di halaman Layanan.
 *
 * Gerakannya bertingkat seperti banner promosi: satu langkah satu kartu, bisa
 * otomatis maupun manual. Arahnya ke atas. Kendalinya lengkap: tombol
 * naik/turun, usap di layar sentuh, tombol posisi, dan tombol jeda.
 *
 * Cara gulirnya: daftar ditulis dua kali dan hanya maju terus. Saat langkah
 * terakhir salinan pertama tercapai, salinan kedua sudah berada tepat di posisi
 * yang sama dengan salinan pertama, jadi setelah animasinya selesai posisinya
 * bisa dilompatkan kembali ke awal tanpa terlihat. Lompatan itu terjadi SETELAH
 * animasi selesai, bukan sebelumnya: kalau sebelumnya, langkah terakhir akan
 * kehilangan animasinya.
 *
 * Berhenti saat kursor berhenti di atasnya, saat Tab masuk, saat tab browser
 * tidak aktif, saat carousel keluar layar, saat tombol jeda ditekan, dan saat
 * pengguna memilih reduce motion (WCAG 2.2.2).
 */
export default function Services({
  allLayanan,
  depts,
}: {
  allLayanan: Layanan[]
  depts: LayananDept[]
}) {
  return (
    <BoardSection id="layanan" labelledBy="layanan-heading" panelClassName="panel-top-pad">
      <div className="panel-pad">

        <div className="mb-6 md:mb-9">
          <p className="text-[12px] font-bold text-orange-text mb-2">Layanan</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 id="layanan-heading" className="text-[22px] leading-tight md:text-[34px] font-bold text-navy">
                Dua Departemen, Satu Standar Kerja
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

        {/* Satu carousel per departemen, berdampingan di layar lebar. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
          {depts.map((dept) => (
            <CarouselDepartemen
              key={dept.value}
              dept={dept}
              items={allLayanan.filter((l) => l.dept === dept.value)}
            />
          ))}
        </div>

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

function CarouselDepartemen({ dept, items }: { dept: LayananDept; items: Layanan[] }) {
  const [pos, setPos] = useState(0)
  const [lompat, setLompat] = useState(false)
  const [jedaManual, setJedaManual] = useState(false)
  const [hover, setHover] = useState(false)
  const [fokus, setFokus] = useState(false)
  const [terlihat, setTerlihat] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
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

  const maju = useCallback(() => setPos((p) => p + 1), [])
  const mundur = useCallback(() => setPos((p) => (p <= 0 ? jumlah - 1 : p - 1)), [jumlah])

  // Geser otomatis: berhenti saat hover, fokus, tab tidak aktif, keluar layar,
  // tombol jeda ditekan, atau saat pengguna minta reduce motion.
  const berhenti = hover || fokus || jedaManual || reduceMotion || !terlihat
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
          Lingkup departemen ini bisa langsung ditanyakan. Kami susun penawaran per proyek.
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
      {/* Kepala departemen */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} aria-hidden="true" />
        <h3 className="text-[15px] md:text-[17px] font-bold text-navy">{dept.label}</h3>
        <span className="text-[11px] font-bold text-slate-brand px-2 py-0.5 rounded-full bg-ice-dim tabular-nums">
          {jumlah}
        </span>

        {/* Kendali: hanya muncul kalau isinya memang bergulir. */}
        {perluGulir && (
          <div className="ml-auto flex items-center gap-1.5">
            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setJedaManual((v) => !v)}
                aria-label={jedaManual ? `Lanjutkan gulir ${dept.label}` : `Jeda gulir ${dept.label}`}
                className="inline-flex items-center justify-center w-8 h-8 min-h-0 rounded-lg border border-ice-line text-slate-brand hover:text-navy hover:border-orange transition-colors"
              >
                {jedaManual ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
              </button>
            )}
            <div className="flex flex-col rounded-lg border border-ice-line overflow-hidden">
              <button
                type="button"
                onClick={mundur}
                aria-label={`Kartu sebelumnya, ${dept.label}`}
                className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors border-b border-ice-line"
              >
                <ChevronUp size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={maju}
                aria-label={`Kartu berikutnya, ${dept.label}`}
                className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors"
              >
                <ChevronDown size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lingkup kerja singkat */}
      {(dept.scope ?? []).length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          {(dept.scope ?? []).slice(0, 4).map((s) => (
            <li key={s} className="flex items-center gap-1.5 text-[12px] text-slate-brand">
              <Check className="w-3.5 h-3.5 text-orange-text shrink-0" aria-hidden="true" />
              {s}
            </li>
          ))}
        </ul>
      )}

      {/* Jendela carousel: dua kartu terlihat, tepat. */}
      <div
        ref={viewRef}
        className="services-view relative"
        data-gulir={perluGulir ? "true" : "false"}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocusCapture={() => setFokus(true)}
        onBlurCapture={() => setFokus(false)}
        onTouchStart={(e) => {
          setHover(true)
          touchY.current = e.touches[0].clientY
        }}
        onTouchEnd={(e) => {
          const start = touchY.current
          touchY.current = null
          setHover(false)
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
                  <ServiceCard item={item} accent={dept.color} />
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
                onClick={() => setPos(i)}
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

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown, ChevronUp, Clock, FileText } from "lucide-react"
import { BoardSection } from "@/components/cutting-board-bg"
import { useInView } from "@/hooks/use-in-view"
import type { Informasi } from "@/lib/database.types"
import type { KategoriItem } from "@/lib/kategori"
import { formatInformasiDate } from "@/lib/informasi-data"

/**
 * InformasiHighlight: section Informasi di beranda.
 *
 * Bentuknya carousel VERTIKAL: kartu dokumen bergerak dari bawah ke atas,
 * bisa diseret manual dan bergeser otomatis. Bentuk daftar (bukan kartu
 * bergambar) tetap dipertahankan karena dokumen teknis dibaca karena
 * judulnya, bukan karena fotonya.
 *
 * Kenapa carousel dan bukan daftar biasa: jumlah dokumen akan terus
 * bertambah, dan daftar biasa akan memanjangkan beranda tanpa batas. Dengan
 * jendela setinggi DUA kartu, section ini tingginya tetap sama berapa pun
 * jumlah dokumennya.
 *
 * Cara gulirnya sama dengan carousel layanan: daftar ditulis dua kali dan
 * hanya maju terus. Saat langkah terakhir salinan pertama tercapai, salinan
 * kedua sudah tepat di posisi yang sama, jadi posisinya bisa dilompatkan
 * kembali ke awal tanpa terlihat. Lompatan terjadi SETELAH animasi selesai,
 * bukan sebelumnya: kalau sebelumnya, langkah terakhir kehilangan animasinya.
 *
 * Berhenti saat kursor di atasnya, saat Tab masuk, saat tab browser tidak
 * aktif, saat keluar layar, dan saat pengguna memilih reduce motion.
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

        <CarouselInformasi articles={articles} kategori={kategori} />

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

/** Jeda antar langkah geser otomatis (ms). Satu langkah = satu kartu. */
const JEDA_MS = 4200
/** Kartu terlihat sekaligus di jendela. */
const TERLIHAT = 2
/** Samakan dengan durasi transisi di globals.css (.info-track). */
const DURASI_MS = 650
/** Jarak seret minimum (px) supaya dianggap geser, bukan klik. */
const AMBANG_MIN = 40
/** Jarak gerak minimum (px) sebelum tekanan dianggap seret. */
const AMBANG_SERET = 6

function CarouselInformasi({
  articles,
  kategori,
}: {
  articles: Informasi[]
  kategori: KategoriItem[]
}) {
  const [pos, setPos] = useState(0)
  const [lompat, setLompat] = useState(false)
  const [drag, setDrag] = useState(false)
  const [tahan, setTahan] = useState(false)
  const [dy, setDy] = useState(0)
  const [hover, setHover] = useState(false)
  const [fokus, setFokus] = useState(false)
  const [terlihat, setTerlihat] = useState(true)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [adaTetikus, setAdaTetikus] = useState(false)

  const viewRef = useRef<HTMLDivElement>(null)
  const mulaiY = useRef<number | null>(null)
  const idPointer = useRef<number | null>(null)
  const sudahSeret = useRef(false)
  const posRef = useRef(0)

  const jumlah = articles.length
  const perluGulir = jumlah > TERLIHAT

  const terapkan = useCallback((p: number) => {
    posRef.current = p
    setPos(p)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const up = () => setReduceMotion(mq.matches)
    up()
    mq.addEventListener("change", up)
    return () => mq.removeEventListener("change", up)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const up = () => setAdaTetikus(mq.matches)
    up()
    mq.addEventListener("change", up)
    return () => mq.removeEventListener("change", up)
  }, [])

  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setTerlihat(e.isIntersecting), { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /**
   * Ukur tinggi jendela dari DUA kartu pertama yang benar-benar dirender.
   *
   * Tinggi kartu dokumen mengikuti isinya (judul boleh dua baris, keterangan
   * boleh dua baris), jadi tinggi jendela tidak bisa dipatok angka di CSS.
   * Kalau dipatok, jendela akan terpotong saat kartunya lebih tinggi dari
   * perkiraan, dan menyisakan celah saat lebih pendek.
   *
   * Diukur ulang saat ukuran kartu berubah (ResizeObserver), jadi lebar layar
   * berubah atau teksnya membungkus tetap membuat jendela pas.
   */
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const grup = view.querySelector(".info-grup")
    if (!grup) return
    const kartu = Array.from(grup.querySelectorAll(".info-kartu")).slice(0, TERLIHAT)
    if (kartu.length === 0) return

    const ukur = () => {
      const tinggi = kartu.reduce((total, k) => {
        const r = k.getBoundingClientRect()
        const gaya = getComputedStyle(k)
        const bawah = parseFloat(gaya.marginBottom) || 0
        return total + r.height + bawah
      }, 0)
      if (tinggi > 0) view.style.height = `${Math.round(tinggi)}px`

      // Langkah satu kartu, dipakai transformasi track. Diambil dari kartu
      // PERTAMA saja (tinggi + jarak bawahnya), karena satu langkah hanya
      // bergeser satu kartu.
      const k0 = kartu[0].getBoundingClientRect()
      const g0 = getComputedStyle(kartu[0])
      const langkah = k0.height + (parseFloat(g0.marginBottom) || 0)
      if (langkah > 0) view.style.setProperty("--info-step", `${langkah}px`)
    }

    ukur()
    const ro = new ResizeObserver(ukur)
    kartu.forEach((k) => ro.observe(k))
    window.addEventListener("resize", ukur, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", ukur)
    }
  }, [articles.length])

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setTerlihat(false)
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  // Lompatan diam-diam setelah langkah terakhir selesai beranimasi.
  //
  // Yang dibaca `pos` (state), BUKAN `posRef`: kalau geser otomatis berjalan
  // beberapa langkah berturut-turut, `pos` bisa tertinggal satu langkah dari
  // `posRef`, dan memakai `posRef` di sini akan melompatkan lebih jauh dari
  // yang seharusnya sehingga kartunya keluar dari jendela.
  useEffect(() => {
    if (pos < jumlah) return
    const id = window.setTimeout(() => {
      setLompat(true)
      terapkan(pos - jumlah)
    }, DURASI_MS)
    return () => window.clearTimeout(id)
  }, [pos, jumlah, terapkan])

  useEffect(() => {
    if (!lompat) return
    const id = window.requestAnimationFrame(() => setLompat(false))
    return () => window.cancelAnimationFrame(id)
  }, [lompat])

  /**
   * Pindah ke posisi mentah `t`.
   *
   * Kalau posisi sekarang ada di salinan kedua (pos >= jumlah), posisi itu
   * disamakan dulu ke slide aslinya TANPA animasi, baru tujuan diterapkan pada
   * frame berikutnya. Tanpa langkah ini, menekan titik penanda saat salinan
   * masih tampil akan menggulir deretan panjang melintasi semua kartu.
   *
   * Dua requestAnimationFrame dipakai supaya browser sempat menggambar posisi
   * hasil penyamaan sebelum animasi ke tujuan dimulai; dengan satu frame,
   * kedua perubahan gaya bisa menyatu dan animasinya hilang.
   */
  const pindahKe = useCallback(
    (t: number) => {
      const p = posRef.current
      if (p >= jumlah) {
        setLompat(true)
        terapkan(p - jumlah)
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => {
            setLompat(false)
            terapkan(t)
          })
        )
        return
      }
      terapkan(t)
    },
    [jumlah, terapkan]
  )

  const maju = useCallback(() => {
    // Jangan lewat dari satu langkah di luar batas: salinan kedua hanya
    // dipakai untuk satu langkah, lalu dilompatkan kembali.
    terapkan(Math.min(posRef.current + 1, jumlah))
  }, [jumlah, terapkan])

  const mundur = useCallback(
    () => terapkan(posRef.current <= 0 ? jumlah - 1 : posRef.current - 1),
    [jumlah, terapkan]
  )

  const berhenti = hover || fokus || reduceMotion || !terlihat || drag || tahan
  useEffect(() => {
    if (berhenti || !perluGulir) return
    const id = window.setInterval(() => terapkan(Math.min(posRef.current + 1, jumlah)), JEDA_MS)
    return () => window.clearInterval(id)
  }, [berhenti, perluGulir, jumlah, terapkan])

  // ── Seret manual (vertikal) ──
  // Tekan belum berarti seret: `drag` baru menyala setelah jarinya benar-benar
  // bergerak. Tanpa itu, klik biasa pada tautan akan mematikan animasi.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!perluGulir) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    mulaiY.current = e.clientY
    idPointer.current = e.pointerId
    sudahSeret.current = false
    setTahan(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mulaiY.current === null || e.pointerId !== idPointer.current) return
    const d = e.clientY - mulaiY.current
    if (!sudahSeret.current) {
      if (Math.abs(d) < AMBANG_SERET) return
      sudahSeret.current = true
      setDrag(true)
      // Penangkap pointer baru dipasang setelah seretan benar-benar mulai,
      // supaya klik pendek tetap diteruskan ke tautan di bawahnya.
      viewRef.current?.setPointerCapture?.(e.pointerId)
    }
    setDy(d)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mulaiY.current === null || e.pointerId !== idPointer.current) return
    const d = e.clientY - mulaiY.current
    mulaiY.current = null
    idPointer.current = null
    setDrag(false)
    setTahan(false)
    // Geser ke atas = maju (isi naik), geser ke bawah = mundur.
    if (sudahSeret.current && Math.abs(d) >= AMBANG_MIN) {
      if (d < 0) maju()
      else mundur()
    }
    setDy(0)
  }

  const onPointerCancel = () => {
    mulaiY.current = null
    idPointer.current = null
    setDrag(false)
    setTahan(false)
    setDy(0)
  }

  // Seretan tidak boleh dianggap klik.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!sudahSeret.current) return
    e.preventDefault()
    e.stopPropagation()
    sudahSeret.current = false
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!perluGulir) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      maju()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      mundur()
    }
  }

  if (jumlah === 0) return null

  const labelOf = (slug: string) =>
    kategori.find((k) => k.slug.toLowerCase() === slug.toLowerCase())?.label ?? slug

  return (
    <div>
      {/* Kendali geser: hanya muncul kalau isinya memang melebihi jendela. */}
      {perluGulir && (
        <div className="flex items-center gap-2.5 mb-3">
          <h3 className="text-[15px] md:text-[17px] font-bold text-navy">Dokumen terbaru</h3>
          <span className="text-[11px] font-bold text-slate-brand px-2 py-0.5 rounded-full bg-ice-dim tabular-nums">
            {jumlah}
          </span>
          <div className="ml-auto flex flex-col rounded-lg border border-ice-line overflow-hidden">
            <button
              type="button"
              onClick={mundur}
              aria-label="Dokumen sebelumnya"
              className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors border-b border-ice-line"
            >
              <ChevronUp size={13} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={maju}
              aria-label="Dokumen berikutnya"
              className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors"
            >
              <ChevronDown size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Jendela carousel: dua kartu terlihat, tepat. */}
      <div
        ref={viewRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Dokumen informasi"
        className="info-view relative"
        data-seret={perluGulir ? "true" : "false"}
        data-drag={drag ? "true" : "false"}
        onMouseEnter={() => adaTetikus && setHover(true)}
        onMouseLeave={() => adaTetikus && setHover(false)}
        onFocusCapture={(e) => setFokus(e.target.matches(":focus-visible"))}
        onBlurCapture={() => setFokus(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className="info-track"
          data-lompat={lompat ? "true" : "false"}
          data-drag={drag ? "true" : "false"}
          // Satu langkah = tinggi satu kartu + jaraknya, dalam PIKSEl.
          // TIDAK boleh memakai persen: persen dihitung dari tinggi track
          // (seluruh salinan = 12 kartu), bukan dari tinggi jendela (2 kartu),
          // jadi -100% menggeser 12 kartu dan kartunya keluar jendela.
          style={{
            ["--pos" as string]: pos,
            transform: `translate3d(0, calc(var(--pos) * -1 * var(--info-step, 0px) + ${dy}px), 0)`,
          }}
        >
          {/* Dua salinan. Salinan kedua `inert`: isinya sama persis, jadi tidak
              boleh dijangkau Tab maupun pembaca layar. */}
          {(perluGulir ? [0, 1] : [0]).map((salinan) => (
            <div key={salinan} inert={salinan === 1 ? true : undefined} className="info-grup">
              {articles.map((article, i) => (
                <div key={`${salinan}-${article.id}`} className="info-kartu">
                  <Link
                    href={`/informasi/${article.slug}`}
                    onClickCapture={onClickCapture}
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

      {/* Tombol posisi: satu titik per dokumen. Di bawah, rata tengah. */}
      {perluGulir && (
        <div className="flex items-center justify-center gap-1 mt-3">
          {articles.map((article, i) => {
            const aktif = pos % jumlah === i
            return (
              <button
                key={article.id}
                type="button"
                onClick={() => pindahKe(i)}
                aria-label={`Ke ${article.title}`}
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

"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { ReactNode } from "react"

/**
 * CarouselGulir: jendela gulir VERTIKAL dengan geser otomatis.
 *
 * Beda dengan carousel per-kartu yang lama:
 *
 *  - Kartunya benar-benar DIGULIR (scroll), bukan digeser satu langkah
 *    dengan lompatan diam-diam. Karena itu tidak ada salinan daftar dan tidak
 *    ada "track" yang dipindahkan: isinya satu daftar saja, dan jendelanya
 *    yang menggulir. Untuk daftar yang bisa bertambah panjang, cara ini lebih
 *    sederhana dan tidak pernah menyisakan jendela kosong.
 *
 *  - Geser otomatis memakai guliran yang mulus (requestAnimationFrame),
 *    bukan lompatan per jeda. Saat mencapai ujung bawah, gulirannya kembali
 *    ke atas dengan lembut.
 *
 *  - Bisa diseret manual (tetikus, jari, pena), roda tetikus, dan tombol
 *    naik/turun. Saat pengguna menyentuh, guliran otomatis berhenti sejenak
 *    lalu lanjut lagi sendiri.
 *
 *  - Aktif HANYA kalau isinya lebih dari `minItem` (bawaan 2). Dengan dua
 *    item atau kurang, semuanya tampil sekaligus dan tidak ada guliran sama
 *    sekali: tidak ada gunanya menggulir sesuatu yang sudah kelihatan penuh.
 *
 * Tinggi jendela diukur dari item yang benar-benar dirender, bukan dipatok di
 * CSS, karena tinggi kartu mengikuti panjang judul dan ringkasannya.
 */

interface Props {
  children: ReactNode
  /** Jumlah item. Dipakai untuk memutuskan apakah perlu gulir. */
  jumlah: number
  /**
   * Berapa item yang terlihat sekaligus di jendela. Isi yang lebih banyak
   * dari ini akan digulir.
   */
  minItem?: number
  /** Jeda sebelum geser otomatis mulai lagi setelah pengguna menyentuh (ms). */
  jedaSetelahSentuh?: number
  /** Kelas untuk jendela (mis. sudut membulat). */
  className?: string
  /** Label untuk pembaca layar. */
  label: string
}

/** Kecepatan gulir otomatis (piksel per detik). */
const KECEPATAN = 28
/** Jeda di ujung sebelum kembali ke atas (ms). */
const JEDA_UJUNG = 1400
/** Lama diam setelah pengguna menyentuh, sebelum lanjut sendiri (ms). */
const JEDA_SENTUH_BAWAAN = 4000

export default function CarouselGulir({
  children,
  jumlah,
  minItem = 2,
  jedaSetelahSentuh = JEDA_SENTUH_BAWAAN,
  className = "",
  label,
}: Props) {
  const viewRef = useRef<HTMLDivElement>(null)
  const [perluGulir, setPerluGulir] = useState(false)
  const [hover, setHover] = useState(false)
  const [fokus, setFokus] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [adaTetikus, setAdaTetikus] = useState(false)
  const [tinggi, setTinggi] = useState<number | null>(null)

  // Jeda otomatis berhenti sementara setelah pengguna menyentuh.
  const tahanSampai = useRef(0)
  const [sedangTahan, setSedangTahan] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const up = () => setReduceMotion(mq.matches)
    up()
    mq.addEventListener("change", up)
    return () => mq.removeEventListener("change", up)
  }, [])

  // Hover hanya di perangkat berpenunjuk sungguhan. Di layar sentuh, browser
  // mengirim mouseenter palsu setelah ketukan, dan statusnya tetap "di atas"
  // sampai pengguna mengetuk tempat lain: guliran otomatis akan berhenti
  // diam-diam di ponsel kalau hover dipercaya begitu saja.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const up = () => setAdaTetikus(mq.matches)
    up()
    mq.addEventListener("change", up)
    return () => mq.removeEventListener("change", up)
  }, [])

  /**
   * Ukur tinggi jendela dari item yang benar-benar dirender.
   *
   * Diukur dari `minItem` item pertama, jadi jendela selalu pas berisi tepat
   * sekian item walau tingginya berbeda-beda karena panjang teks.
   */
  const ukur = useCallback(() => {
    const view = viewRef.current
    if (!view) return
    const item = Array.from(view.querySelectorAll<HTMLElement>("[data-item]")).slice(0, minItem)
    if (item.length === 0) return
    const total = item.reduce((t, el) => {
      const r = el.getBoundingClientRect()
      const gaya = getComputedStyle(el)
      return t + r.height + (parseFloat(gaya.marginBottom) || 0)
    }, 0)
    if (total > 0) setTinggi(Math.round(total))
  }, [minItem])

  // Dijalankan SETELAH DOM diperbarui (useLayoutEffect), dan bergantung pada
  // perluGulir supaya pengukuran terjadi lagi begitu jendelanya benar-benar
  // dirender. Tanpa itu, pengukuran pertama berjalan saat viewRef masih kosong.
  useLayoutEffect(() => {
    if (!perluGulir) return
    const view = viewRef.current
    if (!view) return
    ukur()
    const ro = new ResizeObserver(ukur)
    view.querySelectorAll("[data-item]").forEach((el) => ro.observe(el))
    window.addEventListener("resize", ukur, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", ukur)
    }
  }, [ukur, perluGulir, children])

  // Perlu gulir hanya kalau isinya lebih banyak dari yang muat di jendela.
  //
  // Dihitung saat render, bukan lewat state + effect: kalau lewat effect,
  // render pertama menghasilkan TANPA jendela (perluGulir masih false),
  // sehingga pengukuran pertama tidak menemukan elemen apa pun dan tinggi
  // jendela tidak pernah terisi. Akibatnya semua item tampil memanjang dan
  // tidak ada yang bisa digulir.
  const harusGulir = jumlah > minItem
  useEffect(() => {
    setPerluGulir(harusGulir)
  }, [harusGulir])

  /** Tandai bahwa pengguna baru menyentuh: tahan guliran otomatis sejenak. */
  const tahanSementara = useCallback(() => {
    tahanSampai.current = Date.now() + jedaSetelahSentuh
    setSedangTahan(true)
  }, [jedaSetelahSentuh])

  // ── Seret tetikus ──
  // Di layar sentuh, browser sudah menggulir sendiri saat jari digeser
  // (touch-action: pan-y). Di desktop, tetikus tidak menggulir apa pun saat
  // ditekan dan digeser, jadi itu ditangani di sini: menekan lalu menggeser
  // menggerakkan isinya, sama seperti menyentuh di ponsel.
  const mulaiY = useRef<number | null>(null)
  const mulaiScroll = useRef(0)
  const idPointer = useRef<number | null>(null)
  const sudahSeret = useRef(false)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    tahanSementara()
    if (e.pointerType !== "mouse" || e.button !== 0) return
    const view = viewRef.current
    if (!view) return
    mulaiY.current = e.clientY
    mulaiScroll.current = view.scrollTop
    idPointer.current = e.pointerId
    sudahSeret.current = false
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mulaiY.current === null || e.pointerId !== idPointer.current) return
    const view = viewRef.current
    if (!view) return
    const d = e.clientY - mulaiY.current
    if (!sudahSeret.current) {
      if (Math.abs(d) < 4) return
      sudahSeret.current = true
      view.style.cursor = "grabbing"
      // Penangkap pointer baru dipasang setelah seretan mulai, supaya klik
      // pendek pada kartu tetap diteruskan ke tautannya.
      view.setPointerCapture?.(e.pointerId)
    }
    view.scrollTop = mulaiScroll.current - d
  }

  const akhiriSeret = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== idPointer.current) return
    mulaiY.current = null
    idPointer.current = null
    const view = viewRef.current
    if (view) view.style.cursor = ""
    // Biarkan penanda seret hidup satu putaran lagi: klik yang menyusul
    // seretan harus dibatalkan, dan penanda itu dibaca di onClickCapture.
    if (sudahSeret.current) {
      window.requestAnimationFrame(() => { sudahSeret.current = false })
    }
  }

  // Seretan tidak boleh dianggap klik pada kartu.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!sudahSeret.current) return
    e.preventDefault()
    e.stopPropagation()
  }

  // Lepas tahanan setelah waktunya habis.
  useEffect(() => {
    if (!sedangTahan) return
    const sisa = Math.max(0, tahanSampai.current - Date.now())
    const id = window.setTimeout(() => {
      if (Date.now() >= tahanSampai.current) setSedangTahan(false)
    }, sisa + 50)
    return () => window.clearTimeout(id)
  }, [sedangTahan])

  /**
   * Guliran otomatis.
   *
   * Memakai requestAnimationFrame dengan langkah berbasis waktu, jadi
   * kecepatannya sama di layar 60 Hz maupun 120 Hz. Berhenti saat kursor di
   * atasnya, saat Tab masuk, saat pengguna baru menyentuh, saat tab browser
   * tidak aktif, dan saat pengguna memilih reduce motion.
   */
  const berhenti = hover || fokus || reduceMotion || sedangTahan || !perluGulir
  useEffect(() => {
    if (berhenti) return
    const view = viewRef.current
    if (!view) return

    let raf = 0
    let terakhir = 0
    let jedaSampai = 0

    /**
     * Posisi gulir disimpan di variabel ini, BUKAN dibaca dari `view.scrollTop`
     * tiap frame.
     *
     * Alasannya: kecepatannya 28 px per detik, jadi satu frame hanya menambah
     * sekitar 0,45 px. Browser membulatkan `scrollTop` ke bilangan bulat, jadi
     * menulis 0,45 lalu membacanya kembali menghasilkan 0 — dan penambahan
     * berikutnya selalu mulai dari 0 lagi. Hasilnya isinya tidak pernah
     * bergerak sama sekali. Dengan menyimpan posisinya sendiri, pecahan itu
     * menumpuk sampai cukup untuk menggeser satu piksel.
     */
    let posisi = view.scrollTop

    const langkah = (waktu: number) => {
      if (!terakhir) terakhir = waktu
      const dt = Math.min(waktu - terakhir, 64)
      terakhir = waktu

      if (document.hidden) {
        raf = window.requestAnimationFrame(langkah)
        return
      }

      // Di ujung bawah: berhenti sejenak, lalu kembali ke atas.
      if (waktu < jedaSampai) {
        raf = window.requestAnimationFrame(langkah)
        return
      }

      const maks = view.scrollHeight - view.clientHeight
      if (maks <= 1) {
        raf = window.requestAnimationFrame(langkah)
        return
      }

      posisi += (KECEPATAN * dt) / 1000

      if (posisi >= maks) {
        // Sudah di dasar: tunggu sejenak, lalu kembali ke atas.
        posisi = maks
        view.scrollTop = maks
        jedaSampai = waktu + JEDA_UJUNG
        // Kembali ke atas dilakukan SETELAH jeda, bukan sekarang, supaya
        // pembaca sempat melihat kartu terakhir.
        window.setTimeout(() => {
          view.scrollTo({ top: 0, behavior: "smooth" })
          posisi = 0
        }, JEDA_UJUNG)
        raf = window.requestAnimationFrame(langkah)
        return
      }

      view.scrollTop = posisi
      raf = window.requestAnimationFrame(langkah)
    }

    raf = window.requestAnimationFrame(langkah)
    return () => window.cancelAnimationFrame(raf)
  }, [berhenti])

  // Tombol naik/turun: satu kartu per tekanan.
  const geserSatuKartu = useCallback(
    (arah: 1 | -1) => {
      const view = viewRef.current
      if (!view) return
      tahanSementara()
      const item = view.querySelector<HTMLElement>("[data-item]")
      const tinggiItem = item
        ? item.getBoundingClientRect().height + (parseFloat(getComputedStyle(item).marginBottom) || 0)
        : view.clientHeight / minItem
      view.scrollBy({ top: arah * tinggiItem, behavior: "smooth" })
    },
    [minItem, tahanSementara]
  )

  // Kalau isinya tidak melebihi jendela, semuanya tampil tanpa pembungkus
  // gulir: tidak ada scrollbar, tidak ada kendali, tidak ada guliran.
  if (!perluGulir) {
    return <div className={className}>{children}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <div className="flex flex-col rounded-lg border border-ice-line overflow-hidden">
          <button
            type="button"
            onClick={() => geserSatuKartu(-1)}
            aria-label={`Gulir ${label} ke atas`}
            className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors border-b border-ice-line"
          >
            <ChevronUp size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => geserSatuKartu(1)}
            aria-label={`Gulir ${label} ke bawah`}
            className="inline-flex items-center justify-center w-8 h-5 min-h-0 text-slate-brand hover:text-navy hover:bg-ice-dim transition-colors"
          >
            <ChevronDown size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={viewRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          onMouseEnter={() => adaTetikus && setHover(true)}
          onMouseLeave={() => adaTetikus && setHover(false)}
          onFocusCapture={(e) => {
            // Hanya fokus dari papan ketik yang menjeda.
            if (e.target.matches(":focus-visible")) setFokus(true)
          }}
          onBlurCapture={() => setFokus(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={akhiriSeret}
          onPointerCancel={akhiriSeret}
          onClickCapture={onClickCapture}
          onWheel={tahanSementara}
          onTouchStart={tahanSementara}
          className={`carousel-gulir cursor-grab ${className}`}
          style={tinggi ? { height: `${tinggi}px` } : undefined}
        >
          {children}
        </div>

        {/* Petunjuk gulir: tipis, tidak menutupi kartu. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
          style={{ background: "linear-gradient(to top, var(--panel), transparent)" }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

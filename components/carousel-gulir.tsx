"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
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
 *  - Bisa diseret manual (tetikus, jari, pena) dan dengan roda tetikus. Saat
 *    pengguna menyentuh, guliran otomatis berhenti sejenak lalu lanjut lagi
 *    sendiri. Tombol naik/turun di layar sengaja TIDAK dipakai: gulirannya
 *    sudah otomatis dan isinya bisa diseret, jadi tombolnya hanya memakan
 *    ruang. Kendali tanpa tetikus tetap ada lewat tombol panah, Home, dan End
 *    di papan ketik.
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
  // Dipakai untuk memunculkan pudaran tepi hanya di sisi yang memang masih ada
  // isinya. Kalau selalu ditampilkan, kartu paling atas ikut memudar padahal
  // tidak ada apa pun di atasnya.
  const [adaDiAtas, setAdaDiAtas] = useState(false)
  const [adaDiBawah, setAdaDiBawah] = useState(false)

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
   * sekian item walau tingginya berbeda-beda karena panjang teks. Ruang tepi
   * jendela ditambahkan di akhir supaya isinya tidak terpotong padding.
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
    if (total <= 0) return

    // Ruang tepi jendela (lihat `.carousel-gulir` di globals.css) HARUS ikut
    // dihitung. `box-sizing: border-box` membuat padding mengurangi tinggi isi:
    // tanpa ditambahkan di sini, jendela setinggi dua kartu hanya menyisakan
    // ruang untuk satu kartu lebih sedikit, dan kartu kedua terpotong.
    const gayaView = getComputedStyle(view)
    const tepi =
      (parseFloat(gayaView.paddingTop) || 0) + (parseFloat(gayaView.paddingBottom) || 0)

    setTinggi(Math.round(total + tepi))
  }, [minItem])

  /**
   * Perbarui penanda tepi: adakah isi di atas, adakah isi di bawah.
   *
   * Dipanggil saat menggulir dan saat ukuran berubah. Ambangnya 2 px supaya
   * pembulatan piksel browser tidak membuat pudarannya berkedip di ujung.
   */
  const perbaruiTepi = useCallback(() => {
    const view = viewRef.current
    if (!view) return
    const maks = view.scrollHeight - view.clientHeight
    setAdaDiAtas(view.scrollTop > 2)
    setAdaDiBawah(view.scrollTop < maks - 2)
  }, [])

  // Dijalankan SETELAH DOM diperbarui (useLayoutEffect), dan bergantung pada
  // perluGulir supaya pengukuran terjadi lagi begitu jendelanya benar-benar
  // dirender. Tanpa itu, pengukuran pertama berjalan saat viewRef masih kosong.
  useLayoutEffect(() => {
    if (!perluGulir) return
    const view = viewRef.current
    if (!view) return
    ukur()
    perbaruiTepi()
    const ro = new ResizeObserver(() => {
      ukur()
      perbaruiTepi()
    })
    view.querySelectorAll("[data-item]").forEach((el) => ro.observe(el))
    const onResize = () => {
      ukur()
      perbaruiTepi()
    }
    window.addEventListener("resize", onResize, { passive: true })
    // Guliran manual (roda, seret, sentuh) dan guliran otomatis sama-sama
    // memicu ini, jadi penanda tepinya selalu ikut posisi yang sebenarnya.
    view.addEventListener("scroll", perbaruiTepi, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", onResize)
      view.removeEventListener("scroll", perbaruiTepi)
    }
  }, [ukur, perbaruiTepi, perluGulir, children])

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

  /**
   * Geser satu kartu, dipakai tombol panah atas/bawah di papan ketik.
   *
   * Tombol naik/turun di layar DIHAPUS: gulirannya sudah berjalan otomatis dan
   * isinya bisa diseret, jadi tombolnya hanya memakan ruang tanpa menambah
   * kemampuan. Untuk pengguna yang tidak memakai tetikus, kendalinya tetap ada
   * lewat tombol panah di papan ketik, jadi tidak ada yang kehilangan akses.
   */
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      geserSatuKartu(1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      geserSatuKartu(-1)
    } else if (e.key === "Home") {
      e.preventDefault()
      tahanSementara()
      viewRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    } else if (e.key === "End") {
      e.preventDefault()
      tahanSementara()
      const view = viewRef.current
      if (view) view.scrollTo({ top: view.scrollHeight, behavior: "smooth" })
    }
  }

  // Kalau isinya tidak melebihi jendela, semuanya tampil tanpa pembungkus
  // gulir: tidak ada scrollbar, tidak ada kendali, tidak ada guliran.
  if (!perluGulir) {
    return <div className={className}>{children}</div>
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={viewRef}
          role="region"
          aria-label={`${label}. Gunakan tombol panah atas dan bawah untuk menggulir.`}
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
          onKeyDown={onKeyDown}
          onWheel={tahanSementara}
          onTouchStart={tahanSementara}
          className={`carousel-gulir cursor-grab ${className}`}
          style={tinggi ? { height: `${tinggi}px` } : undefined}
        >
          {children}
        </div>

        {/* Petunjuk gulir: pudaran tipis di tepi yang masih ada isinya.
            Tanpa ini, kartu yang terpotong di tepi jendela terbaca seperti
            susunan yang rusak, bukan seperti daftar yang bisa digulir. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-5 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to bottom, var(--panel), transparent)",
            opacity: adaDiAtas ? 1 : 0,
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, var(--panel), transparent)",
            opacity: adaDiBawah ? 1 : 0,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

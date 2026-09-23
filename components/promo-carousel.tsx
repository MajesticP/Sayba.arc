"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { isGambarContoh } from "@/lib/image-path"
import { BoardSection } from "@/components/cutting-board-bg"
import type { PromoBanner } from "@/lib/database.types"

interface PromoCarouselProps {
  /** Baris tabel `promo_banner`: dikelola lewat Admin Dashboard */
  slides: PromoBanner[]
  /** Jeda geser otomatis (ms) */
  interval?: number
}

/** Jeda geser otomatis. Empat detik, seperti banner pada umumnya. */
const JEDA_MS = 4000
/** Durasi animasi geser (ms). Samakan dengan `.promo-track` di globals.css. */
const DURASI_MS = 650
/** Jarak geser minimum (px) supaya dianggap seret, bukan klik. */
const AMBANG_MIN = 44
/** Jarak gerak minimum (px) sebelum sebuah tekanan dianggap seret. */
const AMBANG_SERET = 6

/** Link Google Drive → proxy gambar lokal, sama seperti layanan/informasi */
function gdriveToImg(url: string): string {
  if (!url || isGambarContoh(url)) return ""
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

/**
 * PromoCarousel: banner promosi.
 *
 * Bentuknya polos: gambar utuh tanpa lapisan teks, tanpa tombol di bawahnya,
 * dan tanpa gradient penutup. Yang tampil hanya gambarnya.
 *
 * Tautan diambil dari kolom `cta_href` di admin. Kalau diisi, SELURUH gambar
 * jadi bisa diklik dan mengarah ke tautan itu (halaman dalam situs atau alamat
 * luar). Kalau dikosongkan, banner tetap tampil sebagai gambar saja.
 *
 * Rasio: 16:9 di ponsel, 3:1 di layar sedang ke atas (md). Banner 16:9 di
 * desktop terlalu tinggi dan mendorong isi halaman ke bawah; 3:1 membuatnya
 * terbaca sebagai banner, bukan hero kedua. Angka ini mengikuti acuan
 * nexshop.cloud (1216x405 = 3:1 di desktop, 16:9 di ponsel).
 *
 * Gambar yang rasionya berbeda dipotong tengah (object-cover) supaya tidak ada
 * bidang kosong; unggah 2400 x 800 (3:1) supaya tampil utuh di desktop, dan
 * bagian tengahnya tetap aman saat dipotong 16:9 di ponsel.
 *
 * Geser: bisa diseret manual (tetikus, jari, pena), digeser otomatis tiap
 * 4 detik, lewat tombol panah, titik penanda, atau tombol panah kiri/kanan di
 * papan ketik.
 *
 * Deretannya digambar dengan satu salinan di tiap ujung, jadi perpindahan
 * slide terakhir <-> pertama tetap punya animasi dan tidak melompat. Setelah
 * animasinya selesai, posisinya dipindahkan diam-diam ke slide aslinya.
 *
 * Geser otomatis berhenti saat kursor di atasnya, saat Tab masuk, saat tab
 * browser tidak aktif, saat banner keluar layar, dan saat banner sedang
 * diseret atau ditekan. Berhenti saat kursor di atas banner sekaligus jadi
 * kendali jeda yang bisa dipakai pengguna (WCAG 2.2.2), jadi tidak perlu
 * tombol pause terpisah yang menutupi gambar.
 */
export default function PromoCarousel({ slides, interval = JEDA_MS }: PromoCarouselProps) {
  // Banner tanpa gambar sah tidak ditampilkan: banner kosong lebih buruk
  // daripada tidak ada banner, dan berkas contoh sudah dihapus dari /public.
  const sah = useMemo(() => slides.filter((sl) => gdriveToImg(sl.image_url) !== ""), [slides])
  const count = sah.length

  // Posisi pada deretan yang tampil: 1..count = slide asli, 0 dan count+1 =
  // salinan di ujung. Salinan inilah yang membuat perpindahan ujung tidak
  // melompat. Banner berisi satu slide tidak memakai salinan: posisinya nol.
  const [pos, setPos] = useState(1)
  /**
   * Salinan posisi untuk penangan peristiwa. Penangan seret dan tombol harus
   * tahu posisi terkini tanpa menunggu render ulang, karena beberapa peristiwa
   * penunjuk bisa tiba dalam satu frame yang sama.
   */
  const posRef = useRef(1)

  /** Pergeseran jari/kursor saat menyeret (px). */
  const [dx, setDx] = useState(0)
  /** Seretan sudah melewati ambang. Selama ini animasi dimatikan supaya
   *  gambarnya menempel di jari, bukan tertinggal di belakang. */
  const [drag, setDrag] = useState(false)
  /** Jari/kursor sedang menekan banner. Geser otomatis berhenti selama ini. */
  const [tahan, setTahan] = useState(false)
  /** Sedang memindahkan posisi tanpa animasi (lompatan diam-diam). */
  const [lompat, setLompat] = useState(false)
  const [hover, setHover] = useState(false)
  /**
   * Fokus dari papan ketik (Tab), bukan dari klik tetikus.
   *
   * Bedanya penting: klik pada tombol panah meninggalkan fokus di tombol itu,
   * jadi kalau klik juga dianggap "sedang fokus", geser otomatis tidak akan
   * pernah lanjut lagi setelah pengguna menyentuh satu tombol. Yang boleh
   * menjeda hanya fokus yang terlihat (`:focus-visible`), yaitu fokus yang
   * memang dipakai berpindah dengan Tab.
   */
  const [fokus, setFokus] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [terlihat, setTerlihat] = useState(true)
  const [tabAktif, setTabAktif] = useState(true)
  /**
   * Perangkat ini punya penunjuk sungguhan (tetikus) atau tidak.
   *
   * Di layar sentuh, browser mengirim `mouseenter` palsu setelah sebuah
   * ketukan, dan sesudah itu statusnya tetap "di atas" sampai pengguna
   * mengetuk tempat lain. Kalau hover dipercaya begitu saja, geser otomatis
   * akan berhenti diam-diam di ponsel. Karena itu hover hanya dipakai di
   * perangkat berpenunjuk halus.
   */
  const [adaTetikus, setAdaTetikus] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const mulaiX = useRef<number | null>(null)
  const idPointer = useRef<number | null>(null)
  const sudahSeret = useRef(false)

  /** Terapkan posisi ke state dan ke salinannya, dalam satu tempat. */
  const terapkan = useCallback((target: number) => {
    posRef.current = target
    setPos(target)
  }, [])

  /**
   * Posisi mentah -> posisi slide asli. Dipakai untuk menghitung tujuan
   * berikutnya: saat berada di salinan ujung, tujuan dihitung dari slide asli
   * yang gambarnya sedang terlihat, bukan dari nomor salinannya.
   */
  const asliDari = useCallback(
    (p: number) => (p < 1 ? count : p > count ? 1 : p),
    [count]
  )

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
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setTerlihat(e.isIntersecting), { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onVis = () => setTabAktif(!document.hidden)
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  // Jumlah slide berubah (diubah dari admin): kembalikan ke slide pertama
  // supaya posisinya tidak menunjuk slide yang sudah tidak ada.
  useEffect(() => {
    terapkan(count > 1 ? 1 : 0)
  }, [count, terapkan])

  /**
   * Pindah ke posisi mentah `target` dengan animasi.
   *
   * Kalau posisi sekarang ada di salah satu salinan ujung, salinan itu
   * disamakan lebih dulu ke slide aslinya TANPA animasi, baru tujuan
   * diterapkan pada frame berikutnya. Tanpa langkah ini, menekan titik
   * penanda saat salinan ujung masih tampil akan menggulir deretan panjang
   * melintasi semua slide, bukan berpindah satu langkah.
   *
   * Dua requestAnimationFrame dipakai supaya browser sempat menggambar
   * posisi hasil penyamaan sebelum animasi ke tujuan dimulai; dengan satu
   * frame, kedua perubahan gaya bisa menyatu dan animasinya hilang.
   */
  const pindahKe = useCallback(
    (target: number) => {
      const p = posRef.current
      if (p < 1 || p > count) {
        const sama = p < 1 ? count : 1
        setLompat(true)
        terapkan(sama)
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => {
            setLompat(false)
            terapkan(target)
          })
        )
        return
      }
      terapkan(target)
    },
    [count, terapkan]
  )

  /** Pindah ke posisi slide asli tanpa animasi, lalu hidupkan animasi lagi.
   *  Dipakai saat deretan mencapai salinan di ujung. */
  const lompatDiam = useCallback(
    (sama: number) => {
      setLompat(true)
      terapkan(sama)
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setLompat(false)))
    },
    [terapkan]
  )

  // Ujung deretan: setelah animasi selesai, pindah diam-diam ke slide asli
  // yang gambarnya sama persis, jadi tidak ada yang terlihat berpindah.
  useEffect(() => {
    if (pos >= 1 && pos <= count) return
    const id = window.setTimeout(() => lompatDiam(pos < 1 ? count : 1), DURASI_MS)
    return () => window.clearTimeout(id)
  }, [pos, count, lompatDiam])

  const maju = useCallback(() => {
    if (count < 2) return
    pindahKe(Math.min(asliDari(posRef.current) + 1, count + 1))
  }, [count, asliDari, pindahKe])

  const mundur = useCallback(() => {
    if (count < 2) return
    pindahKe(Math.max(asliDari(posRef.current) - 1, 0))
  }, [count, asliDari, pindahKe])

  const keSlide = useCallback((i: number) => pindahKe(i + 1), [pindahKe])

  const berhenti = hover || fokus || reduceMotion || !terlihat || !tabAktif || drag || tahan
  useEffect(() => {
    if (berhenti || count < 2) return
    // setTimeout, bukan setInterval: jeda dihitung ulang dari perpindahan
    // terakhir, jadi geseran manual tidak langsung disusul geseran otomatis.
    const id = window.setTimeout(() => {
      pindahKe(Math.min(asliDari(posRef.current) + 1, count + 1))
    }, interval)
    return () => window.clearTimeout(id)
  }, [berhenti, count, interval, pos, asliDari, pindahKe])

  // ── Seret manual ──
  // Tekan belum berarti seret: `drag` baru menyala setelah jarinya benar-benar
  // bergerak melewati ambang kecil. Tanpa itu, klik biasa pada tautan akan
  // mematikan animasi dan membuat gambarnya tersentak.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (count < 2) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    mulaiX.current = e.clientX
    idPointer.current = e.pointerId
    sudahSeret.current = false
    setTahan(true)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mulaiX.current === null || e.pointerId !== idPointer.current) return
    const d = e.clientX - mulaiX.current
    if (!sudahSeret.current) {
      if (Math.abs(d) < AMBANG_SERET) return
      sudahSeret.current = true
      setDrag(true)
      // Penangkap pointer baru dipasang setelah seretan benar-benar mulai,
      // supaya klik pendek tetap diteruskan ke tautan di bawahnya.
      wrapRef.current?.setPointerCapture?.(e.pointerId)
    }
    setDx(d)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (mulaiX.current === null || e.pointerId !== idPointer.current) return
    const d = e.clientX - mulaiX.current
    const lebar = wrapRef.current?.getBoundingClientRect().width ?? 0
    const ambang = Math.max(AMBANG_MIN, lebar * 0.1)
    mulaiX.current = null
    idPointer.current = null
    setDrag(false)
    setTahan(false)
    if (sudahSeret.current && Math.abs(d) >= ambang) {
      if (d < 0) maju()
      else mundur()
    }
    setDx(0)
  }

  const onPointerCancel = () => {
    mulaiX.current = null
    idPointer.current = null
    setDrag(false)
    setTahan(false)
    setDx(0)
  }

  // Seretan tidak boleh dianggap klik: kalau gambar digeser lalu dilepas di
  // atas tautan, kliknya dibatalkan supaya tidak pindah halaman tanpa sengaja.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!sudahSeret.current) return
    e.preventDefault()
    e.stopPropagation()
    sudahSeret.current = false
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (count < 2) return
    if (e.key === "ArrowRight") {
      e.preventDefault()
      maju()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      mundur()
    }
  }

  if (!count) return null

  // Banner berisi satu slide tidak memakai salinan, jadi posisinya selalu nol.
  // Dihitung di sini, bukan hanya di efek, supaya frame pertama pun sudah
  // benar dan tidak ada satu frame yang menampilkan bidang kosong.
  const posTampil = count > 1 ? pos : 0
  const indeksAktif = ((posTampil - 1) + count) % count
  // Deretan yang digambar: [salinan terakhir, ...slide asli, salinan pertama]
  const tampil = count > 1 ? [sah[count - 1], ...sah, sah[0]] : sah

  return (
    <BoardSection id="promo" labelledBy="promo-heading" panelClassName="panel-top-pad">
      <h2 id="promo-heading" className="sr-only">
        Promosi SAYBA ARC
      </h2>

      <div className="panel-pad pt-0">
        <div
          ref={wrapRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Promosi SAYBA ARC"
          aria-live={berhenti ? "polite" : "off"}
          className="promo-view group relative aspect-[16/9] md:aspect-[3/1] w-full overflow-hidden rounded-2xl border border-ice-line bg-ice-dim"
          data-seret={count > 1 ? "true" : "false"}
          data-drag={drag ? "true" : "false"}
          data-lompat={lompat ? "true" : "false"}
          onMouseEnter={() => adaTetikus && setHover(true)}
          onMouseLeave={() => adaTetikus && setHover(false)}
          onFocusCapture={(e) => setFokus(e.target.matches(":focus-visible"))}
          onBlurCapture={() => setFokus(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onKeyDown={onKeyDown}
          // Tautan dan gambar di dalamnya bisa ditarik secara asli oleh
          // browser. Kalau itu terjadi, browser mengambil alih penunjuknya dan
          // mengirim pointercancel, sehingga seretan banner berhenti di tengah
          // jalan. Seretan mendatar banner yang dipakai di sini.
          onDragStart={(e) => e.preventDefault()}
        >
          <div
            className="promo-track flex h-full w-full"
            style={{ transform: `translate3d(calc(${-posTampil * 100}% + ${dx}px), 0, 0)` }}
          >
            {tampil.map((slide, i) => {
              const tautan = slide.cta_href?.trim() ?? ""
              const luar = /^https?:\/\//i.test(tautan)
              // Salinan di kedua ujung tidak boleh dijangkau Tab maupun pembaca
              // layar: isinya sama persis dengan slide aslinya.
              const salinan = count > 1 && (i === 0 || i === tampil.length - 1)

              const gambar = (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={gdriveToImg(slide.image_url)}
                  alt={slide.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i <= 1 ? "eager" : "lazy"}
                  fetchPriority={i === 1 ? "high" : "auto"}
                  draggable={false}
                />
              )

              return (
                <div
                  key={`${slide.id}-${i}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Banner ${((i - 1 + count) % count) + 1} dari ${count}`}
                  className="relative h-full w-full shrink-0"
                  inert={salinan ? true : undefined}
                  aria-hidden={salinan ? true : undefined}
                >
                  {tautan ? (
                    luar ? (
                      <a
                        href={tautan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full w-full"
                        draggable={false}
                        onClickCapture={onClickCapture}
                      >
                        {gambar}
                      </a>
                    ) : (
                      <Link href={tautan} className="block h-full w-full" draggable={false} onClickCapture={onClickCapture}>
                        {gambar}
                      </Link>
                    )
                  ) : (
                    <div className="block h-full w-full">{gambar}</div>
                  )}
                </div>
              )
            })}
          </div>

          {count > 1 && (
            <div className="pointer-events-none absolute inset-0">
              <button
                type="button"
                onClick={mundur}
                aria-label="Banner sebelumnya"
                className="pointer-events-auto absolute left-2 top-1/2 inline-flex h-9 w-9 min-h-0 -translate-y-1/2 items-center justify-center rounded-full border border-ice/20 bg-navy/55 text-ice/90 backdrop-blur-sm transition-all duration-200 hover:border-orange hover:bg-orange hover:text-navy focus-visible:opacity-100 md:left-4 md:h-11 md:w-11 md:border-ice/25 md:bg-navy/45 md:opacity-70 md:group-hover:opacity-100 md:hover:bg-orange"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={maju}
                aria-label="Banner berikutnya"
                className="pointer-events-auto absolute right-2 top-1/2 inline-flex h-9 w-9 min-h-0 -translate-y-1/2 items-center justify-center rounded-full border border-ice/20 bg-navy/55 text-ice/90 backdrop-blur-sm transition-all duration-200 hover:border-orange hover:bg-orange hover:text-navy focus-visible:opacity-100 md:right-4 md:h-11 md:w-11 md:border-ice/25 md:bg-navy/45 md:opacity-70 md:group-hover:opacity-100 md:hover:bg-orange"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="pointer-events-auto absolute inset-x-0 bottom-2 flex items-center justify-center gap-0.5">
                {sah.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => keSlide(i)}
                    aria-label={`Ke banner ${i + 1}`}
                    aria-current={i === indeksAktif}
                    className="inline-flex h-6 min-h-0 shrink-0 items-center justify-center px-1.5"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ${
                        i === indeksAktif ? "w-5 bg-orange" : "w-1.5 bg-ice/70"
                      }`}
                    />
                  </button>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </BoardSection>
  )
}

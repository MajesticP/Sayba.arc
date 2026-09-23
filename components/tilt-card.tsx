"use client"

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react"

/**
 * TiltCard: kartu yang miring mengikuti kursor, seperti kartu yang diangkat
 * dari meja.
 *
 * Diadaptasi dari komponen TiltedCard di React Bits (reactbits.dev). Versi asli
 * memakai pustaka `motion` untuk pegasnya; di sini pegasnya diganti transisi CSS
 * supaya tidak ada dependensi baru hanya untuk satu efek. Hasil geraknya sama:
 * kartu miring sedikit ke arah kursor, lalu kembali rata saat kursor pergi.
 *
 * CARA KERJANYA — posisi kursor ditulis ke dua variabel CSS di elemennya, lalu
 * CSS yang menghitung kemiringannya. React tidak pernah dirender ulang saat
 * kursor bergerak.
 *
 * Versi pertama komponen ini menyimpan kemiringan di `useState`, dan itu boros:
 * pointermove bisa datang jauh lebih sering daripada layar menggambar, dan
 * setiap perubahan state berarti React menyusun ulang seluruh isi kartu
 * (gambar, judul, lencana) padahal yang berubah cuma satu transform. Sekarang
 * yang berubah hanya dua variabel CSS.
 *
 * Transform 3D-nya juga hanya dipasang SAAT KURSOR DI ATAS KARTU (lewat
 * `:hover` di CSS, lihat `.tilt-card` di globals.css). Kalau dipasang permanen,
 * puluhan kartu sekaligus memaksa browser menyimpan lapisan komposit untuk
 * semuanya — boros memori, dan teks di dalamnya bisa ikut berubah halus
 * pinggirnya. Saat tidak disorot, kartunya kembali jadi elemen biasa.
 *
 * BATAS KEMIRINGAN: sudutnya dihitung ulang dari ukuran kartu supaya tepi yang
 * bergeser tidak melebihi ruang di sekitarnya. Kartu yang sangat lebar (kartu
 * layanan memanjang, ±1200 px) hanya butuh 2° untuk menggeser tepinya 20 px,
 * sedangkan kartu berita yang lebih kecil butuh 4° penuh. Kalau batas ini tidak
 * ada, kartu lebar akan terpotong jendela gulirnya sendiri.
 *
 * Efek ini hanya untuk perangkat berpenunjuk (mouse). Di layar sentuh tidak ada
 * kursor untuk diikuti, jadi efeknya dimatikan, bukan ditebak-tebak. Dimatikan
 * juga saat pengguna memilih reduce motion.
 */
export default function TiltCard({
  children,
  className = "",
  /** Kemiringan maksimum dalam derajat. */
  max = 6,
  /** Kedalaman angkat saat kursor di atas kartu, dalam piksel. */
  lift = 4,
}: {
  children: ReactNode
  className?: string
  max?: number
  lift?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Tidak memakai state: nilainya hidup di variabel CSS elemennya sendiri.
  const aktif = useRef(false)
  const raf = useRef<number | null>(null)
  const titik = useRef({ x: 0, y: 0 })

  // Hanya hidup di perangkat berpenunjuk halus (mouse/trackpad) dan saat
  // pengguna tidak meminta reduce motion.
  useEffect(() => {
    const halus = window.matchMedia("(hover: hover) and (pointer: fine)")
    const tenang = window.matchMedia("(prefers-reduced-motion: reduce)")
    const up = () => {
      aktif.current = halus.matches && !tenang.matches
    }
    up()
    halus.addEventListener("change", up)
    tenang.addEventListener("change", up)
    return () => {
      halus.removeEventListener("change", up)
      tenang.removeEventListener("change", up)
    }
  }, [])

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!aktif.current || !ref.current) return
      // Titiknya disimpan dulu; perhitungannya menyusul satu kali per gambar.
      titik.current = { x: e.clientX, y: e.clientY }
      if (raf.current !== null) return
      raf.current = window.requestAnimationFrame(() => {
        raf.current = null
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        // -0.5..0.5 dari tengah kartu ke tepinya.
        const px = (titik.current.x - r.left) / r.width - 0.5
        const py = (titik.current.y - r.top) / r.height - 0.5
        // Sudut dibatasi supaya tepi kartu tidak bergeser lebih jauh dari ruang
        // yang tersedia di sekelilingnya (lihat BATAS_GESER).
        const maxX = Math.min(max, sudutAman(r.height / 2))
        const maxY = Math.min(max, sudutAman(r.width / 2))
        el.style.setProperty("--tilt-x", `${(-py * maxX * 2).toFixed(2)}deg`)
        el.style.setProperty("--tilt-y", `${(px * maxY * 2).toFixed(2)}deg`)
      })
    },
    [max]
  )

  // Dikembalikan ke rata saat kursor pergi. Sebenarnya `:hover` di CSS sudah
  // cukup untuk membalikkan transformnya; ini hanya supaya saat kursor masuk
  // lagi, kemiringannya mulai dari rata, bukan dari sudut terakhir.
  const reset = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (raf.current !== null) {
      window.cancelAnimationFrame(raf.current)
      raf.current = null
    }
    el.style.setProperty("--tilt-x", "0deg")
    el.style.setProperty("--tilt-y", "0deg")
  }, [])

  useEffect(() => {
    return () => {
      if (raf.current !== null) window.cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`tilt-card ${className}`}
      // Angkatnya tetap: nilainya hanya berlaku saat `:hover` memasang
      // transformnya, jadi tidak perlu diurus JavaScript.
      style={{ "--tilt-lift": `-${lift}px` } as CSSProperties}
    >
      {children}
    </div>
  )
}

/**
 * Sudut kemiringan terbesar yang pergeseran tepinya masih muat di BATAS_GESER.
 *
 * Pergeseran tepi ≈ setengah ukuran × sin(sudut), jadi sudutnya dibalik dari
 * batas itu. Kartu yang sangat kecil bisa saja butuh lebih dari 90°, dan itu
 * tidak masuk akal; karena itu hasilnya dipagari di 90°.
 */
const BATAS_GESER = 13 // px — tidak boleh lebih besar dari padding `.carousel-gulir`
function sudutAman(setengahUkuran: number): number {
  if (setengahUkuran <= 0) return 0
  const rasio = Math.min(1, BATAS_GESER / setengahUkuran)
  return (Math.asin(rasio) * 180) / Math.PI
}

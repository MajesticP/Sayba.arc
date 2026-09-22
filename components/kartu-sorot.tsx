"use client"

import { useEffect } from "react"

/**
 * KartuSorot: mengisi posisi kursor ke variabel CSS kartu.
 *
 * Satu pemantau untuk seluruh halaman, bukan satu per kartu. Halaman daftar
 * bisa memuat puluhan kartu; memasang satu pemantau per kartu berarti puluhan
 * pemantau berjalan bersamaan untuk hal yang sama.
 *
 * Yang ditulis hanya dua variabel CSS pada elemen kartu yang sedang
 * disorot, jadi tidak ada render ulang React dan tidak ada state yang
 * berubah. CSS yang menggambar sorotannya.
 *
 * Perhitungannya dibatasi satu per gambar (requestAnimationFrame), karena
 * pointermove bisa datang jauh lebih sering daripada layar bisa menggambar.
 *
 * Tidak dipasang sama sekali di perangkat sentuh dan saat pengguna memilih
 * reduce motion.
 */
export default function KartuSorot() {
  useEffect(() => {
    const halus = window.matchMedia("(hover: hover) and (pointer: fine)")
    const tenang = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!halus.matches || tenang.matches) return

    let raf: number | null = null
    let terakhir: { el: HTMLElement; x: number; y: number } | null = null

    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      const kartu = target?.closest?.(".kartu-sorot") as HTMLElement | null
      if (!kartu) return

      terakhir = { el: kartu, x: e.clientX, y: e.clientY }
      if (raf !== null) return

      raf = window.requestAnimationFrame(() => {
        raf = null
        if (!terakhir) return
        const r = terakhir.el.getBoundingClientRect()
        // Persentase, bukan piksel: kartunya bisa berubah ukuran kapan saja
        // dan persentase tetap benar tanpa perlu dihitung ulang.
        terakhir.el.style.setProperty("--sx", `${((terakhir.x - r.left) / r.width) * 100}%`)
        terakhir.el.style.setProperty("--sy", `${((terakhir.y - r.top) / r.height) * 100}%`)
      })
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      if (raf !== null) window.cancelAnimationFrame(raf)
    }
  }, [])

  return null
}

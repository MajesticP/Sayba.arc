"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

/**
 * TiltCard: kartu yang miring mengikuti kursor, seperti kartu yang diangkat
 * dari meja.
 *
 * Diadaptasi dari komponen TiltedCard di React Bits (reactbits.dev). Versi asli
 * memakai pustaka `motion` untuk pegasnya; di sini pegasnya diganti transisi CSS
 * supaya tidak ada dependensi baru hanya untuk satu efek. Hasil geraknya sama:
 * kartu miring sedikit ke arah kursor, lalu kembali rata saat kursor pergi.
 *
 * Batas kemiringan sengaja kecil (6 derajat). Kartu ini berisi teks yang harus
 * tetap terbaca; kemiringan besar membuat teksnya kabur dan terasa seperti
 * gimmick, bukan seperti kertas yang diangkat.
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
  /** Kedalaman angkat saat kursor di atas kartu. */
  lift = 4,
}: {
  children: ReactNode
  className?: string
  max?: number
  lift?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [aktif, setAktif] = useState(false)
  const [miring, setMiring] = useState({ x: 0, y: 0 })
  const [angkat, setAngkat] = useState(false)
  const raf = useRef<number | null>(null)

  // Hanya hidup di perangkat berpenunjuk halus (mouse/trackpad) dan saat
  // pengguna tidak meminta reduce motion.
  useEffect(() => {
    const halus = window.matchMedia("(hover: hover) and (pointer: fine)")
    const tenang = window.matchMedia("(prefers-reduced-motion: reduce)")
    const up = () => setAktif(halus.matches && !tenang.matches)
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
      if (!aktif || !ref.current) return
      // Dibatasi satu perhitungan per gambar: pointermove bisa datang jauh
      // lebih sering daripada layar bisa menggambar.
      if (raf.current !== null) return
      raf.current = window.requestAnimationFrame(() => {
        raf.current = null
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        // -0.5..0.5 dari tengah kartu ke tepinya.
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        setMiring({ x: -py * max * 2, y: px * max * 2 })
      })
    },
    [aktif, max]
  )

  const reset = useCallback(() => {
    setMiring({ x: 0, y: 0 })
    setAngkat(false)
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
      onMouseEnter={() => aktif && setAngkat(true)}
      onMouseLeave={reset}
      className={`tilt-card ${className}`}
      style={{
        transform: `perspective(900px) rotateX(${miring.x}deg) rotateY(${miring.y}deg) translateY(${angkat ? -lift : 0}px)`,
      }}
    >
      {children}
    </div>
  )
}

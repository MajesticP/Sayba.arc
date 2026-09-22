"use client"

import { useEffect, useRef } from "react"

/**
 * MatCursorGrid: lapisan kursor-reaktif di atas meja potong.
 *
 * Terinspirasi pola "Dot Grid" dan "Cursor Grid" dari React Bits
 * (reactbits.dev). Versi itu memakai GSAP untuk menghitung inersia setiap
 * titik; di sini konsepnya diadaptasi memakai canvas biasa tanpa dependensi
 * tambahan, karena yang dibutuhkan hanya satu hal: garis ukur di sekitar
 * kursor menyala, lalu kembali redup saat kursor pergi.
 *
 * Kenapa bukan GSAP: situs ini hanya perlu satu efek, dan menambah satu
 * pustaka animasi penuh untuk itu memperbesar unduhan semua halaman. Canvas
 * biasa memberi hasil yang sama pada motif garis, dengan biaya jauh lebih
 * kecil.
 *
 * Prinsip kerja:
 *  - Digambar di canvas terpisah, di belakang konten, tidak menangkap klik.
 *  - Hanya garis yang dekat kursor yang terang; sisanya transparan, jadi
 *    tidak ada kisi kedua yang menumpuk di atas kisi CSS.
 *  - Menggambar hanya saat kursor bergerak atau saat nilai meredup, lalu
 *    berhenti. Tidak ada loop yang berjalan terus saat pengguna diam.
 *  - Dimatikan di perangkat sentuh (tidak ada kursor) dan saat pengguna
 *    memilih reduce motion.
 */
export default function MatCursorGrid() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    // Tidak ada kursor di perangkat sentuh: tidak ada gunanya menggambar.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const GAP = 14        // jarak antar garis, sama dengan kisi CSS
    const BOLD = 70       // garis tegas tiap 5 satuan
    const REACH = 190     // radius pengaruh kursor
    const LINE = "17, 42, 70" // navy dalam komponen rgb

    let w = 0, h = 0, dpr = 1
    let mouseX = -9999, mouseY = -9999
    let targetX = -9999, targetY = -9999
    let raf = 0
    let hidup = false

    const ukur = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const gambar = () => {
      ctx.clearRect(0, 0, w, h)

      if (mouseX < -1000) { hidup = false; return }

      const x0 = Math.max(0, Math.floor((mouseX - REACH) / GAP) * GAP)
      const x1 = Math.min(w, mouseX + REACH)
      const y0 = Math.max(0, Math.floor((mouseY - REACH) / GAP) * GAP)
      const y1 = Math.min(h, mouseY + REACH)

      // Garis vertikal
      for (let x = x0; x <= x1; x += GAP) {
        const jarak = Math.abs(x - mouseX)
        const dekat = Math.max(0, 1 - jarak / REACH)
        if (dekat <= 0) continue
        const tegas = x % BOLD === 0
        const alfa = (tegas ? 0.30 : 0.16) * dekat * dekat
        ctx.strokeStyle = `rgba(${LINE}, ${alfa})`
        ctx.lineWidth = tegas ? 1.2 : 1
        ctx.beginPath()
        ctx.moveTo(x + 0.5, y0)
        ctx.lineTo(x + 0.5, y1)
        ctx.stroke()
      }

      // Garis horizontal
      for (let y = y0; y <= y1; y += GAP) {
        const jarak = Math.abs(y - mouseY)
        const dekat = Math.max(0, 1 - jarak / REACH)
        if (dekat <= 0) continue
        const tegas = y % BOLD === 0
        const alfa = (tegas ? 0.30 : 0.16) * dekat * dekat
        ctx.strokeStyle = `rgba(${LINE}, ${alfa})`
        ctx.lineWidth = tegas ? 1.2 : 1
        ctx.beginPath()
        ctx.moveTo(x0, y + 0.5)
        ctx.lineTo(x1, y + 0.5)
        ctx.stroke()
      }

      // Titik potong terdekat: satu tanda kecil, menandai titik bidik.
      const snapX = Math.round(mouseX / GAP) * GAP
      const snapY = Math.round(mouseY / GAP) * GAP
      const dSnap = Math.hypot(snapX - mouseX, snapY - mouseY)
      if (dSnap < GAP) {
        const alfa = 0.55 * (1 - dSnap / GAP)
        ctx.fillStyle = `rgba(240, 122, 38, ${alfa})`
        ctx.beginPath()
        ctx.arc(snapX, snapY, 2.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const langkah = () => {
      // Kursor menyusul dengan halus, bukan melompat, supaya garis tidak
      // berkedip saat gerakan cepat.
      mouseX += (targetX - mouseX) * 0.18
      mouseY += (targetY - mouseY) * 0.18
      gambar()

      const diam = Math.abs(targetX - mouseX) < 0.4 && Math.abs(targetY - mouseY) < 0.4
      if (diam) {
        mouseX = targetX
        mouseY = targetY
        gambar()
        hidup = false
        return
      }
      raf = requestAnimationFrame(langkah)
    }

    const mulai = () => {
      if (hidup) return
      hidup = true
      raf = requestAnimationFrame(langkah)
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (mouseX < -1000) { mouseX = targetX; mouseY = targetY }
      mulai()
    }

    const onLeave = () => {
      targetX = -9999
      targetY = -9999
      mulai()
    }

    ukur()
    window.addEventListener("resize", ukur, { passive: true })
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerleave", onLeave, { passive: true })
    document.addEventListener("mouseleave", onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", ukur)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerleave", onLeave)
      document.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  )
}

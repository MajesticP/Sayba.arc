"use client"

import { useEffect, useRef } from "react"

/**
 * Globe: bola dunia rangka kawat yang dikendalikan kursor.
 *
 * Diadaptasi dari pola animasi React Bits (reactbits.dev) untuk komponen
 * bertema bola dunia, tetapi digambar sendiri di canvas 2D alih-alih memakai
 * three.js. Alasannya: three.js beserta @react-three/fiber menambah ratusan
 * kilobita ke bundel setiap halaman, sedangkan yang dibutuhkan di sini hanya
 * satu bola rangka kawat. Pada skala ini canvas 2D memberi hasil yang sama
 * dengan biaya jauh lebih kecil.
 *
 * Yang membuatnya bukan hiasan kosong: ada satu titik menyala di posisi
 * Pontianak, Kalimantan Barat. Itu lokasi kerja SAYBA ARC, jadi bolanya
 * membawa keterangan, bukan sekadar bergerak.
 *
 * Cara menggambar:
 *  - Lingkaran lintang dan garis bujur sebagai poli-garis, tiap titik
 *    diproyeksikan lewat putaran Y (spin) lalu X (kemiringan).
 *  - Belahan jauh digambar lebih dulu dengan alfa rendah, belahan dekat
 *    sesudahnya, sehingga bola terbaca padat tanpa shader.
 *  - Titik di belakang bola (z negatif) diredupkan, supaya rangka kawat tidak
 *    terlihat seperti kusut datar.
 *
 * Batas kerja: berhenti saat keluar layar, saat tab tidak aktif, dan saat
 * pengguna memilih reduce motion. Di perangkat sentuh bola berputar pelan
 * sendiri tanpa mengikuti kursor.
 */

/** Koordinat Pontianak, Kalimantan Barat. */
const PONTIANAK = { lat: -0.02, lon: 109.34 }

interface Props {
  className?: string
  /** Radius bola dalam persen dari sisi terpendek wadah. */
  scale?: number
  /** Kecepatan putar saat kursor diam, derajat per detik. */
  idleSpin?: number
}

export default function Globe({ className = "", scale = 0.40, idleSpin = 6 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    // Ada kursor sungguhan hanya di perangkat dengan penunjuk presisi.
    const adaKursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches

    let w = 0, h = 0, dpr = 1
    let raf = 0
    let hidup = false
    let terlihat = false
    let terakhir = 0

    // Keadaan bola
    let spin = 0            // derajat, berjalan terus
    let spinKursor = 0      // tambahan dari kursor, meredup kembali
    let tilt = -14          // derajat, kemiringan tetap + pengaruh kursor
    let tiltKursor = 0

    // Kursor dalam koordinat ternormalisasi (-1..1), dengan peredaman
    let mx = 0, my = 0, mxTarget = 0, myTarget = 0

    const LINTANG = [-60, -30, 0, 30, 60]
    const BUJUR = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

    const ukur = () => {
      const r = wrap.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(1, r.width)
      h = Math.max(1, r.height)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /** Putar titik bola lalu proyeksikan ke layar. */
    const proyeksi = (
      lat: number, lon: number, R: number, cx: number, cy: number,
      spinDeg: number, tiltDeg: number
    ) => {
      const la = (lat * Math.PI) / 180
      const lo = ((lon + spinDeg) * Math.PI) / 180

      // Bola satu satuan
      const x = Math.cos(la) * Math.sin(lo)
      const y = Math.sin(la)
      const z = Math.cos(la) * Math.cos(lo)

      // Miringkan pada sumbu X
      const t = (tiltDeg * Math.PI) / 180
      const y2 = y * Math.cos(t) - z * Math.sin(t)
      const z2 = y * Math.sin(t) + z * Math.cos(t)

      return { x: cx + x * R, y: cy + y2 * R, z: z2 }
    }

    const gambarBola = () => {
      ctx.clearRect(0, 0, w, h)

      const R = Math.min(w, h) * scale
      const cx = w / 2
      const cy = h / 2
      const spinTotal = spin + spinKursor
      const tiltTotal = tilt + tiltKursor

      // Warna dari palet situs, dinyatakan sebagai komponen rgb.
      const GARIS = "244, 246, 249"   // ice
      const AKSEN = "240, 122, 38"    // orange

      // ── Lingkaran lintang ────────────────────────────────────────────────
      for (const lat of LINTANG) {
        const titik: { x: number; y: number; z: number }[] = []
        for (let lon = 0; lon <= 360; lon += 6) {
          titik.push(proyeksi(lat, lon, R, cx, cy, spinTotal, tiltTotal))
        }
        // Gambar per segmen supaya alfa bisa mengikuti kedalaman.
        for (let i = 0; i < titik.length - 1; i++) {
          const a = titik[i], b = titik[i + 1]
          const zRata = (a.z + b.z) / 2
          const dekat = (zRata + 1) / 2              // 0 = jauh, 1 = dekat
          if (dekat < 0.12) continue                 // sembunyikan yang jauh
          const alfa = 0.05 + dekat * 0.16
          ctx.strokeStyle = `rgba(${GARIS}, ${alfa})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // ── Garis bujur ──────────────────────────────────────────────────────
      for (const lon of BUJUR) {
        const titik: { x: number; y: number; z: number }[] = []
        for (let lat = -90; lat <= 90; lat += 6) {
          titik.push(proyeksi(lat, lon, R, cx, cy, spinTotal, tiltTotal))
        }
        for (let i = 0; i < titik.length - 1; i++) {
          const a = titik[i], b = titik[i + 1]
          const zRata = (a.z + b.z) / 2
          const dekat = (zRata + 1) / 2
          if (dekat < 0.12) continue
          const alfa = 0.05 + dekat * 0.16
          ctx.strokeStyle = `rgba(${GARIS}, ${alfa})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // ── Lingkaran tepi bola ──────────────────────────────────────────────
      ctx.strokeStyle = `rgba(${GARIS}, 0.22)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()

      // ── Titik lokasi: Pontianak ──────────────────────────────────────────
      const p = proyeksi(PONTIANAK.lat, PONTIANAK.lon, R, cx, cy, spinTotal, tiltTotal)
      if (p.z > 0) {
        const dekat = p.z                      // 0..1
        const alfa = 0.35 + dekat * 0.65

        // Lingkaran luar: menandai posisi, bukan berdenyut.
        ctx.strokeStyle = `rgba(${AKSEN}, ${0.30 * alfa})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2)
        ctx.stroke()

        // Inti titik
        ctx.fillStyle = `rgba(${AKSEN}, ${alfa})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2)
        ctx.fill()

        // Garis bidik tipis ke tepi bola, seperti penanda peta.
        const dx = p.x - cx, dy = p.y - cy
        const len = Math.hypot(dx, dy) || 1
        const ux = dx / len, uy = dy / len
        ctx.strokeStyle = `rgba(${AKSEN}, ${0.22 * alfa})`
        ctx.beginPath()
        ctx.moveTo(p.x + ux * 10, p.y + uy * 10)
        ctx.lineTo(p.x + ux * (R + 14), p.y + uy * (R + 14))
        ctx.stroke()
      }
    }

    const langkah = (now: number) => {
      const dt = terakhir ? Math.min((now - terakhir) / 1000, 0.05) : 0
      terakhir = now

      // Kursor menyusul dengan halus
      mx += (mxTarget - mx) * 0.06
      my += (myTarget - my) * 0.06

      spin += idleSpin * dt
      spinKursor += (mx * 26 - spinKursor) * 0.045
      tiltKursor += (my * 16 - tiltKursor) * 0.045

      gambarBola()
      raf = requestAnimationFrame(langkah)
    }

    const mulai = () => {
      if (hidup) return
      hidup = true
      terakhir = 0
      raf = requestAnimationFrame(langkah)
    }

    const hentikan = () => {
      hidup = false
      cancelAnimationFrame(raf)
    }

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      mxTarget = ((e.clientX - r.left) / r.width) * 2 - 1
      myTarget = ((e.clientY - r.top) / r.height) * 2 - 1
      // Batasi supaya kemiringan tidak berlebihan
      mxTarget = Math.max(-1, Math.min(1, mxTarget))
      myTarget = Math.max(-1, Math.min(1, myTarget))
    }

    const onLeave = () => { mxTarget = 0; myTarget = 0 }

    ukur()
    gambarBola()

    // Reduce motion: gambar sekali, tidak berputar.
    if (reduceMotion) {
      window.addEventListener("resize", () => { ukur(); gambarBola() }, { passive: true })
      return () => window.removeEventListener("resize", ukur)
    }

    // Berhenti saat panel keluar layar atau tab tidak aktif.
    const obs = new IntersectionObserver(
      ([e]) => {
        terlihat = e.isIntersecting
        if (terlihat && !document.hidden) mulai()
        else hentikan()
      },
      { threshold: 0.05 }
    )
    obs.observe(wrap)

    const onVisibility = () => {
      if (document.hidden) hentikan()
      else if (terlihat) mulai()
    }
    document.addEventListener("visibilitychange", onVisibility)

    const onResize = () => { ukur(); gambarBola() }
    window.addEventListener("resize", onResize, { passive: true })

    if (adaKursor) {
      wrap.addEventListener("pointermove", onMove, { passive: true })
      wrap.addEventListener("pointerleave", onLeave, { passive: true })
    }

    return () => {
      hentikan()
      obs.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", onResize)
      wrap.removeEventListener("pointermove", onMove)
      wrap.removeEventListener("pointerleave", onLeave)
    }
  }, [scale, idleSpin])

  return (
    <div ref={wrapRef} className={`relative ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
    </div>
  )
}

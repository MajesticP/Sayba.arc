"use client"

import { useEffect, useRef } from "react"
import { globeMask, isDarat } from "@/lib/globe-mask"

/**
 * Globe: bola dunia dot-matrix yang berputar sendiri.
 *
 * Diadaptasi dari komponen globe di React Bits (reactbits.dev) lalu
 * disesuaikan dengan tema SAYBA ARC. Titik-titiknya mengikuti mask benua asli
 * (Natural Earth, lihat lib/globe-mask.ts), jadi yang terlihat memang bentuk
 * benua, bukan pola acak. Masknya 2,7 KB dan ikut bundel: tidak ada permintaan
 * jaringan sama sekali, dan tidak ada pustaka 3D yang perlu diunduh.
 *
 * Digambar di canvas 2D, bukan three.js. Satu bola rangka kawat tidak sepadan
 * dengan ratusan KB yang harus diunduh setiap pengunjung di setiap halaman.
 *
 * Warna diambil dari token CSS (--ice, --orange) supaya globe ikut berubah
 * sendiri kalau paletnya disesuaikan, tidak ada warna kedua yang harus dijaga.
 *
 * Performa:
 *   - Titik disusun sekali, disimpan di cache tingkat modul.
 *   - Titik digambar sebagai SATU jalur per warna, bukan satu per satu.
 *     Menggambar 2.500 titik satu per satu memakan sekitar 2.500 panggilan
 *     gambar per frame; dengan satu jalur jadi dua panggilan saja.
 *   - Berhenti saat globe keluar layar atau tab browser tidak aktif.
 *   - Resolusi dibatasi 2x, lebih dari itu tidak terlihat bedanya.
 *
 * Gerak: bola berputar pelan sendiri, tiga orbit melintas, dan satu titik
 * oranye menandai Pontianak. Tidak ada kendali kursor: bolanya memang latar,
 * bukan alat interaksi, dan tidak ada satu pun pendengar peristiwa penunjuk
 * yang perlu dipasang. Semua gerak berhenti saat pengguna memilih reduce
 * motion.
 */

type Titik = { lon: number; lat: number; darat: boolean }

/** Kemiringan tetap bola, dalam radian. Memberi kesan melihat dari sedikit
 *  atas, supaya kutub utara tidak sejajar dengan tepi layar. */
const KEMIRINGAN = -0.12
/** Kecepatan putar per frame (radian). Sekitar satu putaran per menit:
 *  cukup terlihat hidup, tidak cukup untuk menarik perhatian dari judul. */
const KECEPATAN_PUTAR = 0.0016

/**
 * Susun titik di permukaan bola.
 *
 * Di dekat kutub, lingkaran garis lintangnya mengecil, jadi jumlah titik di
 * sana dikurangi supaya kerapatannya tetap merata di seluruh permukaan.
 * Tanpa ini, kutubnya jadi gumpalan titik yang padat.
 */
function susunTitik(langkah: number): Titik[] {
  const mask = globeMask()
  const titik: Titik[] = []
  for (let lat = -88; lat <= 88; lat += langkah) {
    const kosinus = Math.cos((lat * Math.PI) / 180)
    const jumlahLon = Math.max(1, Math.round((360 / langkah) * kosinus))
    for (let i = 0; i < jumlahLon; i++) {
      const lon = (i / jumlahLon) * 360 - 180
      titik.push({ lon, lat, darat: isDarat(lon, lat, mask) })
    }
  }
  return titik
}

const cacheTitik = new Map<number, Titik[]>()
function titikUntuk(langkah: number): Titik[] {
  let t = cacheTitik.get(langkah)
  if (!t) {
    t = susunTitik(langkah)
    cacheTitik.set(langkah, t)
  }
  return t
}

/** Tambahkan alpha ke warna hex (#rrggbb -> rgba). */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "").trim()
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16)
  if (Number.isNaN(n)) return `rgba(255,255,255,${a})`
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

/** Titik lokasi kantor, dipakai untuk penanda di bola. */
const LOKASI = { lon: 109.33, lat: -0.02 }

export default function Globe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Disalin ke variabel bertipe tegas. Deklarasi fungsi di bawah diangkat
    // (hoisted) oleh JavaScript, dan TypeScript tidak bisa menjamin
    // penyempitan tipe di dalam fungsi yang diangkat. Salinan ini membuat
    // tipenya tegas tanpa perlu tanda seru di puluhan tempat.
    const cv: HTMLCanvasElement = canvas
    const box: HTMLDivElement = wrap
    const g: CanvasRenderingContext2D = ctx

    const tenang = window.matchMedia("(prefers-reduced-motion: reduce)")
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Di layar kecil, titiknya dibuat lebih jarang: bolanya juga lebih kecil,
    // jadi kerapatan lebih rendah tidak terlihat bedanya.
    let langkah = window.innerWidth < 768 ? 5 : 4
    let titik = titikUntuk(langkah)

    // Mulai dengan Indonesia menghadap pembaca, bukan Samudra Atlantik.
    // Bola lalu berputar pelan dari titik itu, jadi penanda Pontianak
    // terlihat sejak frame pertama.
    let spin = -Math.PI / 180 * 109.33
    let fase = 0
    let jalan = true
    let terlihat = true
    let raf = 0
    let sebelumnya = 0

    function ukur() {
      const r = box.getBoundingClientRect()
      const w = Math.max(1, Math.round(r.width))
      const h = Math.max(1, Math.round(r.height))
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      cv.style.width = w + "px"
      cv.style.height = h + "px"
    }
    ukur()

    // Warna dibaca SEKALI, bukan tiap frame. getComputedStyle memaksa
    // browser menghitung ulang seluruh gaya halaman; memanggilnya 60 kali
    // per detik membuat globe ini jadi beban terberat di halaman, padahal
    // nilainya tidak berubah.
    let WARNA = bacaWarna()
    function bacaWarna() {
      const gaya = getComputedStyle(document.documentElement)
      return {
        ice: gaya.getPropertyValue("--ice").trim() || "#F4F6F9",
        navy: gaya.getPropertyValue("--navy").trim() || "#112A46",
        orange: gaya.getPropertyValue("--orange").trim() || "#F07A26",
      }
    }

    const ro = new ResizeObserver(() => {
      ukur()
      const baru = window.innerWidth < 768 ? 5 : 4
      if (baru !== langkah) {
        langkah = baru
        titik = titikUntuk(baru)
      }
    })
    ro.observe(wrap)

    // Berhenti saat globe keluar layar.
    const io = new IntersectionObserver(([e]) => { terlihat = e.isIntersecting }, { threshold: 0.02 })
    io.observe(wrap)

    const onVis = () => {
      const harusJalan = !document.hidden && terlihat
      if (harusJalan && !jalan) {
        jalan = true
        raf = window.requestAnimationFrame(gambar)
      } else if (!harusJalan) {
        jalan = false
        window.cancelAnimationFrame(raf)
      }
    }
    document.addEventListener("visibilitychange", onVis)

    function gambar(waktu: number) {
      if (!jalan) return

      // Kalau tab tidak aktif atau globe di luar layar, jangan gambar apa pun
      // tapi tetap tunggu. Pemeriksaannya di sini, bukan hanya di event,
      // supaya tidak ada frame yang lolos.
      if (document.hidden || !terlihat) {
        raf = window.requestAnimationFrame(gambar)
        return
      }

      // Putaran dihitung dari selisih waktu, bukan dari jumlah frame. Di layar
      // 120 Hz bola tidak jadi dua kali lebih cepat daripada di layar 60 Hz,
      // dan saat frame-nya tersendat bolanya tidak tersentak.
      const dt = sebelumnya ? Math.min(waktu - sebelumnya, 64) : 16.7
      sebelumnya = waktu

      const W = cv.width
      const H = cv.height
      const cx = W / 2
      const cy = H / 2
      const R = Math.min(W, H) * 0.32

      const { ice, orange, navy } = WARNA

      g.clearRect(0, 0, W, H)

      const diam = tenang.matches
      if (!diam) {
        spin += KECEPATAN_PUTAR * (dt / 16.7)
        fase += 0.0035 * (dt / 16.7)
      }

      const rotY = spin
      const rotX = KEMIRINGAN
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)

      // Proyeksi ortografis: titik di belahan jauh (z kecil) dibuang.
      const proy: { x: number; y: number; z: number; darat: boolean }[] = []
      for (let i = 0; i < titik.length; i++) {
        const t = titik[i]
        const latR = (t.lat * Math.PI) / 180
        const lonR = (t.lon * Math.PI) / 180
        const x = Math.cos(latR) * Math.sin(lonR)
        const y = Math.sin(latR)
        const z = Math.cos(latR) * Math.cos(lonR)
        const x1 = x * cosY + z * sinY
        const z1 = -x * sinY + z * cosY
        const y2 = y * cosX - z1 * sinX
        const z2 = y * sinX + z1 * cosX
        if (z2 > 0.03) proy.push({ x: x1, y: y2, z: z2, darat: t.darat })
      }

      // ── Orbit ──
      // Digambar lebih dulu supaya titik bola tampak berada di depannya.
      g.lineWidth = Math.max(1, dpr)
      const orbit = [
        { rx: 1.3, ry: 0.32, miring: -0.42 },
        { rx: 1.18, ry: 0.46, miring: 0.55 },
        { rx: 1.36, ry: 0.24, miring: 0.14 },
      ]
      for (const o of orbit) {
        g.beginPath()
        const N = 96
        for (let i = 0; i <= N; i++) {
          const a = (i / N) * Math.PI * 2
          const ex = Math.cos(a) * R * o.rx
          const ey = Math.sin(a) * R * o.ry
          const px = ex * Math.cos(o.miring) - ey * Math.sin(o.miring)
          const py = ex * Math.sin(o.miring) + ey * Math.cos(o.miring)
          const px2 = px * (1 + cosY * 0.26)
          if (i === 0) g.moveTo(cx + px2, cy + py)
          else g.lineTo(cx + px2, cy + py)
        }
        g.strokeStyle = hexA(orange, 0.2)
        g.stroke()
      }

      // ── Titik bola ──
      // Dua jalur saja untuk ribuan titik: satu untuk daratan, satu untuk
      // lautan. Titik laut digambar sebagai kotak karena ukurannya di bawah
      // 1,5 px sehingga bentuknya tidak terlihat bedanya, dan kotak jauh
      // lebih ringan daripada busur.
      //
      // Titik daratan jauh lebih terang DAN lebih besar dari titik lautan;
      // keduanya yang membuat bentuk benua terbaca. Judul hero berada tepat
      // di atas bola, jadi kontrasnya diamankan oleh tabir elips di bawah ini,
      // bukan dengan meredupkan titiknya. Jangan naikkan alpha di sini tanpa
      // menghitung ulang kontras teks hero: angkanya sudah dihitung.
      const rDarat = Math.max(1.8, R * 0.016) * dpr
      const rLaut = Math.max(0.9, R * 0.0085) * dpr

      // Laut: satu jalur, satu kali gambar.
      g.beginPath()
      for (let i = 0; i < proy.length; i++) {
        const p = proy[i]
        if (p.darat) continue
        const tepi = 1 - p.z * 0.5
        const s = rLaut * tepi
        g.rect(cx + p.x * R - s, cy + p.y * R - s, s * 2, s * 2)
      }
      g.fillStyle = hexA(ice, 0.10)
      g.fill()

      // Darat: satu jalur, satu kali gambar. Titiknya lebih besar dan lebih
      // terang, dan itulah yang membuat bentuk benua terbaca.
      g.beginPath()
      for (let i = 0; i < proy.length; i++) {
        const p = proy[i]
        if (!p.darat) continue
        const tepi = 1 - p.z * 0.45
        const s = rDarat * tepi
        const x = cx + p.x * R
        const y = cy + p.y * R
        g.moveTo(x + s, y)
        g.arc(x, y, s, 0, Math.PI * 2)
      }
      g.fillStyle = hexA(ice, 0.58)
      g.fill()

      // ── Tabir elips di area teks ──
      // Judul hero berada tepat di atas bola, jadi titik-titik di area itu
      // harus diredam supaya teksnya tetap lolos kontras. Tabirnya ELIPS dan
      // hanya menutupi bagian tengah tempat teks berada, bukan seluruh bola:
      // bagian atas, bawah, dan tepi bola tetap memperlihatkan titik penuh,
      // dan di situlah bentuk benua paling terlihat.
      //
      // Bentuk elips dipilih karena area teks di hero memang melebar ke
      // samping, bukan bulat. Tabir bulat akan meredam lebih banyak bola
      // daripada yang perlu.
      g.save()
      g.translate(cx, cy)
      g.scale(1, 0.62)
      const tabir = g.createRadialGradient(0, 0, 0, 0, 0, R * 1.15)
      tabir.addColorStop(0, hexA(navy, 0.78))
      tabir.addColorStop(0.55, hexA(navy, 0.66))
      tabir.addColorStop(1, hexA(navy, 0))
      g.fillStyle = tabir
      g.beginPath()
      g.arc(0, 0, R * 1.15, 0, Math.PI * 2)
      g.fill()
      g.restore()

      // ── Penanda lokasi ──
      const latR = (LOKASI.lat * Math.PI) / 180
      const lonR = (LOKASI.lon * Math.PI) / 180
      const lx = Math.cos(latR) * Math.sin(lonR)
      const ly = Math.sin(latR)
      const lz = Math.cos(latR) * Math.cos(lonR)
      const lx1 = lx * cosY + lz * sinY
      const lz1 = -lx * sinY + lz * cosY
      const ly2 = ly * cosX - lz1 * sinX
      const lz2 = ly * sinX + lz1 * cosX

      if (lz2 > 0.03) {
        const px = cx + lx1 * R
        const py = cy + ly2 * R
        const denyut = diam ? 1 : 1 + Math.sin(fase * 4) * 0.2
        g.beginPath()
        g.arc(px, py, Math.max(3, R * 0.04) * denyut * dpr, 0, Math.PI * 2)
        g.fillStyle = orange
        g.fill()
        g.beginPath()
        g.arc(px, py, Math.max(6, R * 0.09) * denyut * dpr, 0, Math.PI * 2)
        g.strokeStyle = hexA(orange, 0.42)
        g.lineWidth = Math.max(1, dpr)
        g.stroke()
      }

      raf = window.requestAnimationFrame(gambar)
    }

    raf = window.requestAnimationFrame(gambar)

    return () => {
      jalan = false
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  return (
    <div ref={wrapRef} className={`globe-wrap ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}

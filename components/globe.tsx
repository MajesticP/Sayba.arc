"use client"

import { useEffect, useRef } from "react"
import { globeMask, isDarat } from "@/lib/globe-mask"

/**
 * Globe: bola dunia GARIS yang berputar sendiri.
 *
 * Digambar sebagai rangka garis, bukan kumpulan titik. Graticule (garis
 * lintang & bujur) membentuk bola, dan benua digambar sebagai potongan garis
 * lintang tepat di atas daratan. Hasilnya bentuk bola dan benua jauh lebih
 * tegas dibaca, dan tidak lagi berupa kabut titik.
 *
 * Titik mask benua (Natural Earth, lihat lib/globe-mask.ts) dipakai apa
 * adanya, jadi yang tergambar memang bentuk benua, bukan pola acak. Masknya
 * 2,7 KB dan ikut bundel: tidak ada permintaan jaringan sama sekali, dan tidak
 * ada pustaka 3D yang perlu diunduh.
 *
 * Digambar di canvas 2D, bukan three.js. Satu bola garis tidak sepadan dengan
 * ratusan KB yang harus diunduh setiap pengunjung di setiap halaman.
 *
 * Warna diambil dari token CSS (--ice, --orange) supaya globe ikut berubah
 * sendiri kalau paletnya disesuaikan, tidak ada warna kedua yang harus dijaga.
 *
 * Performa:
 *   - Titik pada bola satuan (unit sphere) dihitung SEKALI, disimpan di cache
 *     tingkat modul. Tiap frame hanya memutar titik itu, tanpa trigonometri
 *     baru dan tanpa membaca mask lagi.
 *   - Satu jalur (path) per garis, bukan satu panggilan gambar per titik.
 *   - Berhenti saat globe keluar layar atau tab browser tidak aktif.
 *   - Resolusi dibatasi 2x, lebih dari itu tidak terlihat bedanya.
 *
 * Gerak: bola berputar pelan sendiri dan tiga orbit melintas. Tidak ada
 * penanda lokasi dan tidak ada kendali kursor: bolanya memang latar, bukan
 * alat interaksi. Semua gerak berhenti saat pengguna memilih reduce motion.
 */

/** Kemiringan tetap bola (radian): melihat dari sedikit atas. */
const KEMIRINGAN = -0.12
/** Kecepatan putar per frame (radian). Sekitar satu putaran per menit. */
const KECEPATAN_PUTAR = 0.0016

/** Titik pada bola satuan (unit sphere). Dihitung sekali, bukan tiap frame. */
type Titik3 = { x: number; y: number; z: number }
/** Satu garis: deretan titik pada bola satuan. */
type Garis = Titik3[]

/** Ubah koordinat geografis menjadi titik pada bola satuan. */
function keBola(lon: number, lat: number): Titik3 {
  const latR = (lat * Math.PI) / 180
  const lonR = (lon * Math.PI) / 180
  const c = Math.cos(latR)
  return { x: c * Math.sin(lonR), y: Math.sin(latR), z: c * Math.cos(lonR) }
}

/**
 * Benua: untuk tiap baris lintang, ambil bagian bujur yang berupa daratan dan
 * jadikan satu garis. Hasilnya deretan garis lintang yang membentuk siluet
 * benua. Dihitung sekali dari mask, lalu dipakai tiap frame.
 *
 * Di dekat kutub lingkaran lintangnya mengecil; karena itu batasnya
 * dihentikan di 84 derajat, sama seperti batas masknya.
 */
const cacheBenua = new Map<number, Garis[]>()
function garisBenua(langkahLat: number): Garis[] {
  const tersimpan = cacheBenua.get(langkahLat)
  if (tersimpan) return tersimpan
  const mask = globeMask()
  const hasil: Garis[] = []
  for (let lat = -84; lat <= 84; lat += langkahLat) {
    let garis: Garis | null = null
    for (let lon = -180; lon <= 180; lon += 2) {
      if (isDarat(lon, lat, mask)) {
        if (!garis) {
          garis = []
          hasil.push(garis)
        }
        garis.push(keBola(lon, lat))
      } else {
        garis = null
      }
    }
  }
  cacheBenua.set(langkahLat, hasil)
  return hasil
}

/**
 * Graticule: garis lintang dan garis bujur yang membentuk bola.
 * Dihitung sekali juga.
 */
const cacheGraticule = new Map<number, Garis[]>()
function garisGraticule(langkah: number): Garis[] {
  const tersimpan = cacheGraticule.get(langkah)
  if (tersimpan) return tersimpan
  const hasil: Garis[] = []
  for (let lat = -80; lat <= 80; lat += langkah) {
    const g: Garis = []
    for (let lon = -180; lon <= 180; lon += 4) g.push(keBola(lon, lat))
    hasil.push(g)
  }
  for (let lon = -180; lon < 180; lon += langkah) {
    const g: Garis = []
    for (let lat = -90; lat <= 90; lat += 4) g.push(keBola(lon, lat))
    hasil.push(g)
  }
  cacheGraticule.set(langkah, hasil)
  return hasil
}

/** Tambahkan alpha ke warna hex (#rrggbb -> rgba). */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "").trim()
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16)
  if (Number.isNaN(n)) return `rgba(255,255,255,${a})`
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

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

    // Di layar kecil, garisnya dibuat lebih jarang: bolanya juga lebih kecil,
    // jadi kerapatan lebih rendah tidak terlihat bedanya.
    const kecil = window.innerWidth < 768
    let langkahBenua = kecil ? 4 : 3
    let langkahGraticule = kecil ? 30 : 20
    let benua = garisBenua(langkahBenua)
    let graticule = garisGraticule(langkahGraticule)

    // Mulai dengan Indonesia menghadap pembaca, bukan Samudra Atlantik.
    // Bola lalu berputar pelan dari titik itu, jadi penanda Pontianak
    // terlihat sejak frame pertama.
    let spin = (-Math.PI / 180) * 109.33
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
    const WARNA = bacaWarna()
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
      const k = window.innerWidth < 768
      const lb = k ? 4 : 3
      if (lb !== langkahBenua) {
        langkahBenua = lb
        benua = garisBenua(lb)
      }
      const lg = k ? 30 : 20
      if (lg !== langkahGraticule) {
        langkahGraticule = lg
        graticule = garisGraticule(lg)
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

      if (!tenang.matches) spin += KECEPATAN_PUTAR * (dt / 16.7)

      const rotY = spin
      const rotX = KEMIRINGAN
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)

      // Proyeksi ortografis satu titik: putar lalu buang belahan jauh.
      // Dihitung inline (tanpa objek per titik) supaya tidak ada sampah
      // alokasi ribuan objek per frame.
      let px = 0, py = 0, pz = 0
      const proy = (p: Titik3) => {
        const x1 = p.x * cosY + p.z * sinY
        const z1 = -p.x * sinY + p.z * cosY
        const y2 = p.y * cosX - z1 * sinX
        pz = p.y * sinX + z1 * cosX
        px = cx + x1 * R
        py = cy + y2 * R
      }

      // Gambar satu garis, diputus di titik yang berada di belakang bola.
      const lukis = (garis: Garis) => {
        g.beginPath()
        let mulai = false
        for (let i = 0; i < garis.length; i++) {
          proy(garis[i])
          if (pz <= 0.02) {
            mulai = false
            continue
          }
          if (!mulai) {
            g.moveTo(px, py)
            mulai = true
          } else {
            g.lineTo(px, py)
          }
        }
        g.stroke()
      }

      // ── Orbit ──
      // Digambar lebih dulu supaya garis bola tampak berada di depannya.
      g.lineWidth = Math.max(1.5, 1.6 * dpr)
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
          const ox = ex * Math.cos(o.miring) - ey * Math.sin(o.miring)
          const oy = ex * Math.sin(o.miring) + ey * Math.cos(o.miring)
          const ox2 = ox * (1 + cosY * 0.26)
          if (i === 0) g.moveTo(cx + ox2, cy + oy)
          else g.lineTo(cx + ox2, cy + oy)
        }
        g.strokeStyle = hexA(orange, 0.42)
        g.stroke()
      }

      // ── Tepi bola ──
      // Satu lingkaran tipis: menegaskan bentuk bola, terutama di sisi yang
      // tidak ditempati benua.
      g.beginPath()
      g.arc(cx, cy, R, 0, Math.PI * 2)
      g.strokeStyle = hexA(ice, 0.16)
      g.lineWidth = Math.max(1, dpr)
      g.stroke()

      // ── Graticule ──
      // Garis lintang & bujur: rangka bola. Dibuat tipis supaya benua tetap
      // yang paling terbaca.
      g.strokeStyle = hexA(ice, 0.13)
      g.lineWidth = Math.max(1, dpr)
      for (let i = 0; i < graticule.length; i++) lukis(graticule[i])

      // ── Benua ──
      // Satu jalur per garis daratan. Lebih tebal dan lebih terang dari
      // graticule: inilah yang membuat bentuk benua terbaca.
      g.strokeStyle = hexA(ice, 0.5)
      g.lineWidth = Math.max(1.4, R * 0.011) * dpr
      for (let i = 0; i < benua.length; i++) lukis(benua[i])

      // ── Tabir elips di area teks ──
      // Judul hero berada tepat di atas bola, jadi garis di area itu harus
      // diredam supaya teksnya tetap lolos kontras. Tabirnya ELIPS dan hanya
      // menutupi bagian tengah tempat teks berada, bukan seluruh bola:
      // bagian atas, bawah, dan tepi bola tetap memperlihatkan garis penuh,
      // dan di situlah bentuk benua paling terlihat.
      g.save()
      g.translate(cx, cy)
      g.scale(1, 0.62)
      const tabir = g.createRadialGradient(0, 0, 0, 0, 0, R * 1.15)
      tabir.addColorStop(0, hexA(navy, 0.72))
      tabir.addColorStop(0.55, hexA(navy, 0.58))
      tabir.addColorStop(1, hexA(navy, 0))
      g.fillStyle = tabir
      g.beginPath()
      g.arc(0, 0, R * 1.15, 0, Math.PI * 2)
      g.fill()
      g.restore()

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

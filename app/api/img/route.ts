import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/img?url=https://contoh.com/foto.png
 *
 * Proksi gambar umum: mengambil gambar dari domain mana pun lalu menyajikannya
 * dari domain situs ini sendiri.
 *
 * Kenapa perlu:
 * Kebijakan keamanan (CSP) situs ini membatasi `img-src` hanya ke domain yang
 * dikenal. Gambar yang tautannya di-paste dari situs lain — galeri, forum,
 * media sosial, penyimpanan awan — akan diblokir browser tanpa pesan apa pun
 * ke pengguna. Yang terlihat hanya bidang kosong. Dengan proksi ini, gambar
 * disajikan sebagai same-origin, jadi tidak ada lagi yang diblokir.
 *
 * Batasan yang dipasang sengaja, supaya ini tidak berubah jadi open proxy:
 *  - Hanya http dan https.
 *  - Alamat IP lokal/private ditolak (mencegah permintaan ke jaringan internal).
 *  - Hanya balasan ber-Content-Type `image/*` yang diteruskan.
 *  - Ukuran dibatasi 12 MB.
 *  - Waktu tunggu 10 detik.
 */

const MAX_BYTES = 12 * 1024 * 1024
const TIMEOUT_MS = 10_000

/** Blokir alamat internal: localhost, 127.x, 10.x, 192.168.x, 172.16-31.x, dan .local */
function alamatInternal(host: string): boolean {
  const h = host.toLowerCase()
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true
  // IPv6 loopback
  if (h === "[::1]" || h === "::1") return true

  const ip = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ip) return false

  const [a, b] = [Number(ip[1]), Number(ip[2])]
  if (a === 127 || a === 0 || a === 10) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 169 && b === 254) return true // link-local
  return false
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url")
  if (!target) {
    return new NextResponse("Parameter url wajib diisi", { status: 400 })
  }

  let alamat: URL
  try {
    alamat = new URL(target)
  } catch {
    return new NextResponse("Alamat tidak valid", { status: 400 })
  }

  if (alamat.protocol !== "http:" && alamat.protocol !== "https:") {
    return new NextResponse("Hanya http dan https yang didukung", { status: 400 })
  }

  if (alamatInternal(alamat.hostname)) {
    return new NextResponse("Alamat internal tidak diizinkan", { status: 403 })
  }

  // Batas waktu: tanpa ini, satu server yang tidak menjawab bisa menahan
  // fungsi ini sampai batas waktu platform tercapai.
  const kontrol = new AbortController()
  const jam = setTimeout(() => kontrol.abort(), TIMEOUT_MS)

  try {
    const upstream = await fetch(alamat.toString(), {
      signal: kontrol.signal,
      redirect: "follow",
      headers: {
        // Sebagian situs menolak permintaan tanpa User-Agent yang wajar.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    })

    if (!upstream.ok) {
      return new NextResponse(`Sumber menolak: ${upstream.status}`, { status: 502 })
    }

    const contentType = upstream.headers.get("content-type") ?? ""

    // Hanya gambar yang diteruskan. Ini yang membuat proksi tidak bisa dipakai
    // untuk mengambil halaman HTML atau berkas lain dari internet.
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Sumber bukan gambar", { status: 415 })
    }

    // Batas ukuran dari header Content-Length bila dikirim.
    const panjang = Number(upstream.headers.get("content-length") ?? 0)
    if (panjang > MAX_BYTES) {
      return new NextResponse("Gambar terlalu besar", { status: 413 })
    }

    const isi = await upstream.arrayBuffer()
    if (isi.byteLength > MAX_BYTES) {
      return new NextResponse("Gambar terlalu besar", { status: 413 })
    }

    return new NextResponse(isi, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Sehari di CDN & browser. Tautan gambar jarang berubah isinya.
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return new NextResponse("Sumber terlalu lama menjawab", { status: 504 })
    }
    console.error("[img] fetch error:", err)
    return new NextResponse("Gagal mengambil gambar", { status: 502 })
  } finally {
    clearTimeout(jam)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import sharp from "sharp"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// sharp adalah modul native, handler ini wajib berjalan di runtime Node.js,
// bukan Edge.
export const runtime = "nodejs"

// Mengompres file 4,5MB bisa memakan waktu beberapa detik, melewati batas
// default eksekusi function. Vercel akan memangkas nilai ini bila paket yang
// dipakai memberi jatah lebih kecil.
export const maxDuration = 60

// Ceiling for an incoming upload. This is NOT an arbitrary product choice:
// Vercel caps a serverless function's request body at 4.5 MB, so anything
// larger never reaches this handler, it fails at the platform with an opaque
// 413. We check just under that line so the admin gets a clear message
// explaining why, instead of a cryptic network error.
// To go beyond this the browser must upload straight to Supabase Storage via
// a signed URL, bypassing Vercel entirely.
const MAX_INPUT_SIZE = 4.5 * 1024 * 1024 // 4.5 MB

// Anggaran ukuran berkas akhir. Setiap gambar yang diunggah dikonversi ke WebP
// dan harus muat di bawah 100 KB.
const TARGET_SIZE = 100 * 1024 // 100 KB

const ALLOWED_FOLDERS = ["informasi", "layanan", "portfolio", "tim", "berita", "promo"]

// path = "<folder>/<sha256-of-contents>.<ext>". Unggahan baru SELALU ".webp",
// tetapi svg/png masih diterima di sini supaya berkas lama (dari sebelum
// konversi otomatis diberlakukan) tetap bisa dihapus lewat DELETE.
const MEDIA_PATH_RE = /^(informasi|layanan|portfolio|tim|berita|promo)\/[a-f0-9]{64}\.(svg|png|webp)$/

// Format masukan yang diterima. Format dideteksi dari isi berkas (bukan dari
// Content-Type atau ekstensi), sehingga foto dengan MIME type yang salah pun
// tetap tertangani.
const ALLOWED_INPUT_FORMATS = ["jpeg", "png", "webp", "svg", "gif"] as const

// Batas sisi terpanjang. Foto ponsel bisa 4000px+; membatasinya di sini jauh
// lebih efektif menekan ukuran berkas daripada sekadar menurunkan kualitas.
// Tidak ada bagian situs yang menampilkan gambar lebih lebar dari ini.
const MAX_DIMENSION = 2000

// Batas bawah pengecilan dimensi. Di bawah ini gambar sudah terlalu kecil untuk
// dipakai, jadi kualitas yang diturunkan (lihat FINAL_LADDER) sebagai gantinya.
const MIN_DIMENSION = 512

// Tangga kualitas untuk tiap dimensi: mulai dari yang paling tajam, turun
// bertahap hanya bila ukuran masih di atas anggaran.
const QUALITY_LADDER = [80, 60, 42]
// Upaya terakhir bila dimensi sudah di batas bawah namun masih terlalu besar:
// korbankan kualitas sampai muat, apa pun hasilnya.
const FINAL_LADDER = [34, 26, 20]
// Pengaman agar satu unggahan tidak pernah menghabiskan waktu function tanpa
// henti. Pada praktiknya kasus terburuk (foto noise 6MB) selesai di ~12 encode.
const MAX_ENCODES = 40

type CompressResult = {
  buffer: Buffer
  width: number
  height: number
  quality: number
  encodes: number
  // True bila gambar masih di atas anggaran meski semua langkah sudah dicoba.
  // Hanya mungkin untuk gambar yang sangat padat; tetap disimpan agar unggahan
  // tidak gagal, dengan ukuran sedekat mungkin ke anggaran.
  overBudget: boolean
}

/**
 * Konversi gambar apa pun (JPEG/PNG/WebP/GIF/SVG) menjadi WebP yang muat di
 * bawah `targetBytes` (bawaan 100 KB).
 *
 * Cara kerja:
 * 1. Dekode berkas sekali ke buffer mentah (sekaligus membakar orientasi EXIF
 *    agar foto ponsel tidak tampil miring).
 * 2. Untuk tiap dimensi dari terbesar ke terkecil, coba tangga kualitas. Berhenti
 *    pada percobaan pertama yang sudah muat di bawah anggaran, jadi gambar yang
 *    sudah kecil tetap tajam (satu encode kualitas 80), sedangkan foto raksasa
 *    diturunkan perlahan sampai muat.
 * 3. Bila dimensi sudah di batas bawah dan masih belum muat, kualitas diturunkan
 *    sampai batas akhir.
 *
 * Semua format keluaran adalah WebP; kanal alfa (transparansi) dipertahankan.
 */
async function compressToWebp(buffer: Buffer, targetBytes = TARGET_SIZE): Promise<CompressResult> {
  const meta = await sharp(buffer).metadata()
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0)

  // Dekode sekali; semua percobaan encode memakai buffer mentah yang sama
  // sehingga tidak ada dekode ulang (mahal) di tiap langkah.
  const { data, info } = await sharp(buffer).rotate().raw().toBuffer({ resolveWithObject: true })
  const fromRaw = () =>
    sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })

  // Daftar dimensi yang akan dicoba: dari ukuran asli (dibatasi MAX_DIMENSION)
  // mengecil bertahap sampai MIN_DIMENSION.
  const start = Math.min(MAX_DIMENSION, longest || MAX_DIMENSION)
  const steps: number[] = []
  for (let d = start; d > MIN_DIMENSION; d *= 0.75) steps.push(Math.max(MIN_DIMENSION, Math.round(d)))
  steps.push(MIN_DIMENSION)
  const dimensions = [...new Set(steps)]

  let best: Buffer | null = null
  let bestMeta: { width: number; height: number; quality: number } | null = null
  let encodes = 0

  const attempt = async (maxDim: number, quality: number) => {
    encodes++
    const { data: out, info: outInfo } = await fromRaw()
      .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true })
    if (!best || out.length < best.length) {
      best = out
      bestMeta = { width: outInfo.width, height: outInfo.height, quality }
    }
    return out.length <= targetBytes
  }

  for (const maxDim of dimensions) {
    for (const quality of QUALITY_LADDER) {
      if (encodes >= MAX_ENCODES) break
      if (await attempt(maxDim, quality)) {
        return { buffer: best!, width: bestMeta!.width, height: bestMeta!.height, quality: bestMeta!.quality, encodes, overBudget: false }
      }
    }
    if (encodes >= MAX_ENCODES) break
  }

  // Semua dimensi sudah dicoba. Turunkan kualitas di batas bawah sebagai upaya
  // terakhir supaya gambar pasti muat di bawah anggaran.
  for (const quality of FINAL_LADDER) {
    if (encodes >= MAX_ENCODES) break
    if (await attempt(MIN_DIMENSION, quality)) {
      return { buffer: best!, width: bestMeta!.width, height: bestMeta!.height, quality: bestMeta!.quality, encodes, overBudget: false }
    }
  }

  return { buffer: best!, width: bestMeta!.width, height: bestMeta!.height, quality: bestMeta!.quality, encodes, overBudget: true }
}

// POST /api/admin/upload: body: multipart/form-data { file, folder }
// Menerima gambar (JPEG/PNG/WebP/GIF/SVG), mengonversinya ke WebP maksimal
// 100 KB, lalu menyimpannya ke bucket Storage "media" dan mengembalikan URL
// publiknya.
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const form = await req.formData()
  const file = form.get("file")
  const folder = String(form.get("folder") ?? "")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 })
  }
  if (file.size > MAX_INPUT_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 4,5MB: batas request Vercel, bukan batas aplikasi" }, { status: 400 })
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer())

  // Deteksi format dari isi berkas, bukan dari MIME/ekstensi yang bisa salah.
  let meta: sharp.Metadata
  try {
    meta = await sharp(inputBuffer).metadata()
  } catch {
    return NextResponse.json({ error: "Berkas bukan gambar yang didukung" }, { status: 400 })
  }
  const format = meta.format ?? ""
  if (!ALLOWED_INPUT_FORMATS.includes(format as (typeof ALLOWED_INPUT_FORMATS)[number])) {
    return NextResponse.json(
      { error: "Hanya gambar JPG, PNG, WebP, GIF, atau SVG yang diizinkan" },
      { status: 400 },
    )
  }
  // GIF animasi akan kehilangan geraknya bila diratakan ke satu bingkai WebP: // tolak dengan jelas daripada diam-diam merusak animasinya.
  if (format === "gif" && (meta.pages ?? 1) > 1) {
    return NextResponse.json({ error: "GIF animasi belum didukung: unggah versi statis" }, { status: 400 })
  }

  const result = await compressToWebp(inputBuffer, TARGET_SIZE)

  // Content-hash filename: re-uploading identical bytes lands on the same
  // path instead of creating a new duplicate object every time.
  const hash = createHash("sha256").update(result.buffer).digest("hex")
  const path = `${folder}/${hash}.webp`

  const { error } = await supabaseAdmin.storage
    .from("media")
    // Supabase defaults new objects to "x-robots-tag: none", which tells
    // Google not to index them at all, override to "all" since the whole
    // point of this upload is to get these images into Google Images.
    .upload(path, result.buffer, { contentType: "image/webp", upsert: true, headers: { "x-robots-tag": "all" } })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from("media").getPublicUrl(path)

  return NextResponse.json(
    {
      url: data.publicUrl,
      path,
      // Info diagnostik supaya admin (dan log) tahu seberapa jauh kompresi
      // mendorong gambar agar muat di bawah anggaran.
      size: result.buffer.length,
      width: result.width,
      height: result.height,
      overBudget: result.overBudget,
    },
    { status: 201 },
  )
}

// DELETE /api/admin/upload?path=<folder>/<hash>.<ext>
// Removes an orphaned upload: called when the admin panel replaces or
// clears an image so old files don't pile up in the bucket.
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const path = req.nextUrl.searchParams.get("path") ?? ""
  if (!MEDIA_PATH_RE.test(path)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  const { error } = await supabaseAdmin.storage.from("media").remove([path])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}

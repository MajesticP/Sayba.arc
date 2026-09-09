import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import sharp from "sharp"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// Mengompres file 4,5MB bisa memakan waktu beberapa detik, melewati batas
// default eksekusi function. Vercel akan memangkas nilai ini bila paket yang
// dipakai memberi jatah lebih kecil.
export const maxDuration = 60

// Ceiling for an incoming upload. This is NOT an arbitrary product choice:
// Vercel caps a serverless function's request body at 4.5 MB, so anything
// larger never reaches this handler — it fails at the platform with an opaque
// 413. We check just under that line so the admin gets a clear message
// explaining why, instead of a cryptic network error.
// To go beyond this the browser must upload straight to Supabase Storage via
// a signed URL, bypassing Vercel entirely.
const MAX_INPUT_SIZE = 4.5 * 1024 * 1024 // 4.5 MB
// Size we try to compress down to before storing. Files already under this
// are stored untouched. Kept generous so photos and 1600px-wide banners stay
// sharp — the old 50 KB budget visibly softened large images.
const TARGET_SIZE = 500 * 1024 // 500 KB
const ALLOWED_FOLDERS = ["produk", "layanan", "portfolio", "tim", "berita", "promo"]
// path = "<folder>/<sha256-of-contents>.<ext>" — matches what POST generates below.
const MEDIA_PATH_RE = /^(produk|layanan|portfolio|tim|berita|promo)\/[a-f0-9]{64}\.(svg|png|webp)$/

type ImgKind = "svg" | "png" | "webp"

function detectKind(file: File): ImgKind | null {
  const name = file.name.toLowerCase()
  if (file.type === "image/svg+xml" || name.endsWith(".svg")) return "svg"
  if (file.type === "image/png" || name.endsWith(".png")) return "png"
  if (file.type === "image/webp" || name.endsWith(".webp")) return "webp"
  return null
}

const DATA_URI_RE = /data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)/g

// SVGs exported from design tools sometimes embed large base64 raster images
// (logos, textures) which can blow past the size budget. Progressively
// re-encode those embedded images at lower quality/dimensions — never below
// a floor that would make them illegible — until the whole SVG fits under
// targetBytes, or we run out of attempts.
async function compressEmbeddedImages(svgText: string, targetBytes: number): Promise<string> {
  if (Buffer.byteLength(svgText, "utf8") <= targetBytes) return svgText

  const matches = [...svgText.matchAll(DATA_URI_RE)]
  if (matches.length === 0) return svgText // pure vector — nothing we can compress

  let best = svgText
  let quality = 80
  let scale = 1

  for (let attempt = 0; attempt < 8; attempt++) {
    let working = svgText
    for (const [full, format, b64] of matches) {
      try {
        const inputBuf = Buffer.from(b64, "base64")
        let img = sharp(inputBuf)
        const meta = await img.metadata()
        if (scale < 1 && meta.width) {
          img = img.resize(Math.max(1, Math.round(meta.width * scale)))
        }
        const outBuf =
          format === "png"
            ? await img.png({ compressionLevel: 9, effort: 4 }).toBuffer()
            : format === "webp"
              ? await img.webp({ quality }).toBuffer()
              : await img.jpeg({ quality, mozjpeg: true }).toBuffer()
        const newDataUri = `data:image/${format};base64,${outBuf.toString("base64")}`
        working = working.replace(full, newDataUri)
      } catch {
        // If a specific embedded image fails to re-encode, leave it as-is
        // and let the overall size check decide whether more passes are needed.
      }
    }
    best = working
    if (Buffer.byteLength(working, "utf8") <= targetBytes) return working

    quality = Math.max(25, quality - 10)
    scale = Math.max(0.7, scale - 0.06)
  }

  return best // best effort — may still be above target for very dense images
}

// Standalone PNG/WebP uploads.
//
// Two things dominate the outcome here, both measured rather than assumed:
//
// 1. Pixel count, not encoder settings, drives the file size. A 3000x2000
//    photo cannot be squeezed under the budget by quality alone, but capping
//    it at MAX_DIMENSION gets it there immediately — and nothing on the site
//    displays wider than ~1600px anyway.
//
// 2. sharp's PNG encoder must not be used on photographs. Passing `quality`
//    triggers palette quantisation, which on a 5 MB photo took ~105 s across
//    four attempts and still returned ~2 MB. WebP did the same job in ~2.5 s
//    at 389 KB, alpha channel intact. So anything that actually needs
//    re-encoding is written out as WebP regardless of what came in.
//
// Files already small enough AND within the dimension cap are stored byte for
// byte, keeping their original format — so icons and logos are untouched.
const MAX_DIMENSION = 2000

async function compressRaster(
  buffer: Buffer,
  kind: "png" | "webp",
  targetBytes: number,
): Promise<{ buffer: Buffer; kind: "png" | "webp" }> {
  const meta = await sharp(buffer).metadata()
  const oversized = (meta.width ?? 0) > MAX_DIMENSION || (meta.height ?? 0) > MAX_DIMENSION

  if (buffer.length <= targetBytes && !oversized) return { buffer, kind }

  const encode = (quality: number) =>
    sharp(buffer)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()

  let quality = 82
  let out = await encode(quality)

  // A few gentle steps only. Quality never goes below 60 — past that the
  // artefacts show, and storing a slightly larger file is the better trade.
  while (out.length > targetBytes && quality > 60) {
    quality = Math.max(60, quality - 10)
    out = await encode(quality)
  }

  return { buffer: out, kind: "webp" }
}

// POST /api/admin/upload — body: multipart/form-data { file, folder }
// Uploads an SVG/PNG/WebP image to the public "media" Storage bucket and
// returns its public URL. Files over the size budget are auto-compressed first.
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
  const kind = detectKind(file)
  if (!kind) {
    return NextResponse.json({ error: "Hanya file SVG, PNG, atau WebP yang diizinkan" }, { status: 400 })
  }
  if (file.size > MAX_INPUT_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 4,5MB — batas request Vercel, bukan batas aplikasi" }, { status: 400 })
  }

  let buffer: Buffer
  let contentType: string
  // May differ from the uploaded kind: an oversized PNG is re-encoded as WebP
  // (see compressRaster), and the stored extension has to follow suit.
  let storedKind: ImgKind = kind

  if (kind === "svg") {
    const svgText = await file.text()
    const compressed = await compressEmbeddedImages(svgText, TARGET_SIZE)
    buffer = Buffer.from(compressed, "utf8")
    contentType = "image/svg+xml"
  } else {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const result = await compressRaster(inputBuffer, kind, TARGET_SIZE)
    buffer = result.buffer
    storedKind = result.kind
    contentType = storedKind === "png" ? "image/png" : "image/webp"
  }

  // Content-hash filename: re-uploading identical bytes lands on the same
  // path instead of creating a new duplicate object every time.
  const hash = createHash("sha256").update(buffer).digest("hex")
  const path = `${folder}/${hash}.${storedKind}`

  const { error } = await supabaseAdmin.storage
    .from("media")
    // Supabase defaults new objects to "x-robots-tag: none", which tells
    // Google not to index them at all — override to "all" since the whole
    // point of this upload is to get these images into Google Images.
    .upload(path, buffer, { contentType, upsert: true, headers: { "x-robots-tag": "all" } })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from("media").getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 })
}

// DELETE /api/admin/upload?path=<folder>/<hash>.<ext>
// Removes an orphaned upload — called when the admin panel replaces or
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

import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import sharp from "sharp"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// Hard reject above this — protects the function from oversized uploads
// (also roughly matches the request body limit on most serverless hosts).
const MAX_INPUT_SIZE = 4 * 1024 * 1024 // 4 MB
// What we try to compress the final file down to before storing.
const TARGET_SIZE = 50 * 1024 // 50 KB
const ALLOWED_FOLDERS = ["produk", "layanan", "portfolio", "tim"]
// path = "<folder>/<sha256-of-contents>.<ext>" — matches what POST generates below.
const MEDIA_PATH_RE = /^(produk|layanan|portfolio|tim)\/[a-f0-9]{64}\.(svg|png|webp)$/

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
            ? await img.png({ quality, palette: true, effort: 10 }).toBuffer()
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
    scale = Math.max(0.4, scale - 0.1)
  }

  return best // best effort — may still be above target for very dense images
}

// Standalone PNG/WebP uploads: progressively lower quality + dimensions until
// the file fits under targetBytes, or we run out of attempts. Never drops
// below a quality/scale floor that would make the image illegible.
async function compressRaster(buffer: Buffer, kind: "png" | "webp", targetBytes: number): Promise<Buffer> {
  if (buffer.length <= targetBytes) return buffer

  const meta = await sharp(buffer).metadata()
  const baseWidth = meta.width ?? 1600

  let best = buffer
  let quality = 80
  let scale = 1

  for (let attempt = 0; attempt < 8; attempt++) {
    let img = sharp(buffer)
    if (scale < 1) img = img.resize(Math.max(1, Math.round(baseWidth * scale)))

    const out =
      kind === "png"
        ? await img.png({ quality, palette: true, effort: 10 }).toBuffer()
        : await img.webp({ quality }).toBuffer()

    best = out
    if (out.length <= targetBytes) return out

    quality = Math.max(25, quality - 10)
    scale = Math.max(0.35, scale - 0.12)
  }

  return best // best effort — may still be above target for very dense images
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
    return NextResponse.json({ error: "Ukuran file maksimal 4MB" }, { status: 400 })
  }

  let buffer: Buffer
  let contentType: string

  if (kind === "svg") {
    const svgText = await file.text()
    const compressed = await compressEmbeddedImages(svgText, TARGET_SIZE)
    buffer = Buffer.from(compressed, "utf8")
    contentType = "image/svg+xml"
  } else {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    buffer = await compressRaster(inputBuffer, kind, TARGET_SIZE)
    contentType = kind === "png" ? "image/png" : "image/webp"
  }

  // Content-hash filename: re-uploading identical bytes lands on the same
  // path instead of creating a new duplicate object every time.
  const hash = createHash("sha256").update(buffer).digest("hex")
  const path = `${folder}/${hash}.${kind}`

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

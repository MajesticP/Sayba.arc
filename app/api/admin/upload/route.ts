import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

// Hard reject above this — protects the function from oversized uploads
// (also roughly matches the request body limit on most serverless hosts).
const MAX_INPUT_SIZE = 4 * 1024 * 1024 // 4 MB
// What we try to compress embedded raster images down to before storing.
const TARGET_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_FOLDERS = ["produk", "layanan"]

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

  for (let attempt = 0; attempt < 6; attempt++) {
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
            ? await img.png({ quality, compressionLevel: 9 }).toBuffer()
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

    quality = Math.max(40, quality - 12)
    scale = Math.max(0.6, scale - 0.1)
  }

  return best // best effort — may still be above target for very dense images
}

// POST /api/admin/upload — body: multipart/form-data { file, folder }
// Uploads an SVG image to the public "media" Storage bucket and returns its public URL.
// Embedded raster images over the size budget are auto-compressed first.
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
  const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")
  if (!isSvg) {
    return NextResponse.json({ error: "Hanya file SVG yang diizinkan" }, { status: 400 })
  }
  if (file.size > MAX_INPUT_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 4MB" }, { status: 400 })
  }

  const svgText = await file.text()
  const compressed = await compressEmbeddedImages(svgText, TARGET_SIZE)
  const buffer = Buffer.from(compressed, "utf8")

  const path = `${folder}/${crypto.randomUUID()}.svg`

  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, buffer, { contentType: "image/svg+xml", upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from("media").getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 })
}

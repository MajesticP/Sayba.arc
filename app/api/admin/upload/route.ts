import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_FOLDERS = ["produk", "layanan"]

// POST /api/admin/upload — body: multipart/form-data { file, folder }
// Uploads an SVG image to the public "media" Storage bucket and returns its public URL.
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
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 })
  }

  const path = `${folder}/${crypto.randomUUID()}.svg`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from("media")
    .upload(path, buffer, { contentType: "image/svg+xml", upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from("media").getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 })
}

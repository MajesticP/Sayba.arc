import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

/**
 * /api/admin/informasi-kategori — kategori untuk Pusat Informasi.
 *
 * Kategori tidak lagi dikunci di dalam kode (dulu `lib/informasi-data.ts`),
 * melainkan dikelola dari admin lewat tabel `informasi_kategori`. Dengan begitu
 * admin bisa menambah/menyunting kategori tanpa deploy.
 *
 * Bentuk baris yang dipakai UI:
 *   { slug, label, description, color, sort_order, status }
 *
 * Kolom `slug` adalah kunci unik — PUT dan DELETE memakai ?slug=<slug>,
 * bukan ?id, supaya cocok dengan nilai yang disimpan di kolom `category`
 * tabel `informasi`.
 */

// Supabase JS v2.104+ butuh PostgrestVersion pada tipe Database untuk inferensi
// penuh pada operasi tulis. Sampai skema diregenerasi lewat Supabase CLI, kita
// cast client-nya agar lolos batasan generik (pola sama dengan route lain).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

const SELECT = "slug, label, description, color, sort_order, status"

// GET /api/admin/informasi-kategori
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await supabaseAdmin
    .from("informasi_kategori")
    .select(SELECT)
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/admin/informasi-kategori
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const body = await req.json()
  if (!body.slug || !body.label) {
    return NextResponse.json({ error: "Slug dan label wajib diisi" }, { status: 400 })
  }

  const payload = {
    slug: String(body.slug).trim(),
    label: String(body.label).trim(),
    description: body.description || null,
    color: body.color || "#5e6572",
    sort_order: Number(body.sort_order) || 0,
    status: body.status === "draft" ? "draft" : "active",
  }

  const { data, error } = await db.from("informasi_kategori").insert(payload).select(SELECT).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/informasi-kategori?slug=<slug>
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })

  const body = await req.json()
  // `slug` sengaja tidak ikut diubah agar kategori yang sudah dipakai artikel
  // lama tidak kehilangan kaitannya. Kalau admin butuh ganti slug, hapus lalu
  // buat kategori baru.
  const payload = {
    label: String(body.label ?? "").trim(),
    description: body.description || null,
    color: body.color || "#5e6572",
    sort_order: Number(body.sort_order) || 0,
    status: body.status === "draft" ? "draft" : "active",
  }
  if (!payload.label) return NextResponse.json({ error: "Label wajib diisi" }, { status: 400 })

  const { data, error } = await db
    .from("informasi_kategori")
    .update(payload)
    .eq("slug", slug)
    .select(SELECT)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/admin/informasi-kategori?slug=<slug>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const slug = req.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 })

  const { error } = await supabaseAdmin.from("informasi_kategori").delete().eq("slug", slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

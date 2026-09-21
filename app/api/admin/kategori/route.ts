import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"

/**
 * /api/admin/kategori, kategori terpusat untuk Layanan, Berita, Informasi.
 *
 * Satu tabel melayani tiga modul lewat kolom `scope`, jadi admin mengelola
 * satu daftar. `slug` adalah kunci unik per scope; PUT dan DELETE memakai
 * ?scope=&slug= karena nilai itulah yang disimpan di kolom `category`
 * tabel layanan/berita/informasi.
 *
 * Supabase JS v2.104+ butuh PostgrestVersion pada tipe Database untuk inferensi
 * penuh pada operasi tulis. Sampai skema diregenerasi lewat Supabase CLI, kita
 * cast client-nya agar lolos batasan generik (pola sama dengan route lain).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

const SCOPES = ["layanan", "berita", "informasi"] as const
type Scope = (typeof SCOPES)[number]

const SELECT = "id, scope, slug, label, description, color, sort_order, status"

function isScope(v: string | null): v is Scope {
  return !!v && (SCOPES as readonly string[]).includes(v)
}

/** Ubah label menjadi slug: huruf kecil, spasi jadi tanda hubung. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// GET /api/admin/kategori?scope=berita
export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const scope = req.nextUrl.searchParams.get("scope")
  let query = db.from("kategori").select(SELECT).order("scope").order("sort_order", { ascending: true })
  if (isScope(scope)) query = query.eq("scope", scope)

  const { data, error } = await query
  if (error) {
    // Tabel belum dibuat: kembalikan daftar kosong supaya admin tetap bisa dibuka.
    console.error("Error fetching kategori:", error.message)
    return NextResponse.json([])
  }
  return NextResponse.json(data ?? [])
}

// POST /api/admin/kategori
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.label || !isScope(body.scope)) {
    return NextResponse.json(
      { error: "Label dan modul (layanan/berita/informasi) wajib diisi." },
      { status: 400 }
    )
  }

  const slug = body.slug ? slugify(String(body.slug)) : slugify(String(body.label))
  if (!slug) {
    return NextResponse.json({ error: "Slug tidak valid. Gunakan huruf dan angka." }, { status: 400 })
  }

  // Urutan otomatis di akhir daftar bila tidak ditentukan.
  let sortOrder = body.sort_order
  if (sortOrder === undefined || sortOrder === null || sortOrder === "") {
    const { data: last } = await db
      .from("kategori")
      .select("sort_order")
      .eq("scope", body.scope)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    sortOrder = (last?.sort_order ?? 0) + 1
  }

  const { data, error } = await db
    .from("kategori")
    .insert({
      scope: body.scope,
      slug,
      label: String(body.label).trim(),
      description: body.description ? String(body.description).trim() : null,
      color: body.color || "#5a5c62",
      sort_order: Number(sortOrder) || 0,
      status: body.status === "draft" ? "draft" : "active",
    })
    .select(SELECT)
    .maybeSingle()

  if (error) {
    const pesan =
      error.code === "23505"
        ? `Kategori dengan slug "${slug}" sudah ada di modul ini.`
        : error.message
    return NextResponse.json({ error: pesan }, { status: 400 })
  }
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/kategori?scope=berita&slug=teknologi
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const scope = req.nextUrl.searchParams.get("scope")
  const slug = req.nextUrl.searchParams.get("slug")
  if (!isScope(scope) || !slug) {
    return NextResponse.json({ error: "Parameter scope dan slug wajib diisi." }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 })

  const patch: Record<string, unknown> = {}
  if (body.label !== undefined) patch.label = String(body.label).trim()
  if (body.description !== undefined)
    patch.description = body.description ? String(body.description).trim() : null
  if (body.color !== undefined) patch.color = body.color || "#5a5c62"
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0
  if (body.status !== undefined) patch.status = body.status === "draft" ? "draft" : "active"

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 })
  }

  const { error } = await db.from("kategori").update(patch).eq("scope", scope).eq("slug", slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/kategori?scope=berita&slug=teknologi
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const scope = req.nextUrl.searchParams.get("scope")
  const slug = req.nextUrl.searchParams.get("slug")
  if (!isScope(scope) || !slug) {
    return NextResponse.json({ error: "Parameter scope dan slug wajib diisi." }, { status: 400 })
  }

  // Dokumen yang memakai kategori ini TIDAK ikut terhapus. Slug-nya tetap
  // tersimpan di kolom `category` dan ditampilkan apa adanya di halaman publik.
  const { error } = await db.from("kategori").delete().eq("scope", scope).eq("slug", slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

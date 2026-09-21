import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"

/**
 * /api/admin/tipe, daftar departemen layanan.
 *
 * SAYBA ARC hanya punya DUA departemen tetap (lihat lib/layanan-config.ts).
 * Endpoint ini mengembalikannya sebagai sumber kebenaran tunggal supaya admin
 * tidak pernah menampilkan departemen lama yang sudah dihapus (perkapalan dsb).
 *
 * Tabel `layanan_depts` di database tetap dipertahankan sebagai salinan
 * metadata (label, deskripsi, warna) agar bisa disesuaikan tanpa deploy.
 */

// Supabase JS v2.104+ butuh PostgrestVersion pada tipe Database untuk inferensi
// penuh pada operasi tulis. Sampai skema diregenerasi lewat Supabase CLI, kita
// cast client-nya agar lolos batasan generik (pola sama dengan route admin lain).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

function toClient(row: {
  value: string
  label: string
  description: string | null
  color: string | null
}) {
  return {
    value: row.value,
    label: row.label,
    description: row.description ?? "",
    color: row.color ?? "#5a5c62",
  }
}

/** Bentuk bawaan dari kode: dipakai bila tabel belum ada atau belum diisi. */
function fromConfig() {
  return LAYANAN_DEPTS.map((d) => ({
    value: d.value,
    label: d.label,
    description: d.description,
    color: d.color,
  }))
}

// GET /api/admin/tipe
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await db
    .from("layanan_depts")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    // Tabel belum dibuat: tetap layani dari konfigurasi kode.
    return NextResponse.json(fromConfig())
  }

  // Hanya tampilkan departemen yang masih ada di konfigurasi kode.
  const allowed = new Set(LAYANAN_DEPTS.map((d) => d.value))
  const rows = (data ?? []).filter((r: { value: string }) => allowed.has(r.value))

  if (rows.length === 0) return NextResponse.json(fromConfig())

  return NextResponse.json(rows.map(toClient))
}

// POST /api/admin/tipe: tidak dipakai lagi (departemen bersifat tetap)
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.value) {
    return NextResponse.json(
      { error: "Departemen bersifat tetap. Ubah daftarnya di lib/layanan-config.ts." },
      { status: 400 }
    )
  }

  const allowed = new Set(LAYANAN_DEPTS.map((d) => d.value))
  if (!allowed.has(body.value)) {
    return NextResponse.json(
      { error: `Departemen "${body.value}" tidak dikenal. Hanya ada: ${[...allowed].join(", ")}` },
      { status: 400 }
    )
  }

  const { data, error } = await db
    .from("layanan_depts")
    .upsert({
      value: body.value,
      label: body.label ?? body.value,
      description: body.description ?? null,
      color: body.color ?? "#5a5c62",
    })
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/admin/tipe?value=<slug>
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const value = req.nextUrl.searchParams.get("value")
  if (!value) return NextResponse.json({ error: "Missing value" }, { status: 400 })

  const allowed = new Set(LAYANAN_DEPTS.map((d) => d.value))
  if (!allowed.has(value)) {
    return NextResponse.json(
      { error: `Departemen "${value}" tidak dikenal dan tidak bisa diubah.` },
      { status: 400 }
    )
  }

  const body = await req.json()
  const { error } = await db
    .from("layanan_depts")
    .update({
      label: body.label,
      description: body.description ?? null,
      color: body.color ?? "#5a5c62",
    })
    .eq("value", value)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/tipe?value=<slug>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const value = req.nextUrl.searchParams.get("value")
  if (!value) return NextResponse.json({ error: "Missing value" }, { status: 400 })

  // Dua departemen inti tidak boleh dihapus, struktur navigasi bergantung padanya.
  return NextResponse.json(
    { error: `Departemen "${value}" bersifat tetap dan tidak dapat dihapus.` },
    { status: 400 }
  )
}

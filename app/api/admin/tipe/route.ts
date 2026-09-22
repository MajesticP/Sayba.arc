import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/admin-auth"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"

/**
 * /api/admin/tipe, departemen layanan.
 *
 * Departemen disimpan di tabel `layanan_depts`, bukan di tabel `kategori`.
 * Alasannya, kolom `layanan.dept` mengacu ke `layanan_depts.value` lewat
 * foreign key: departemen harus ada di tabel itu supaya layanan bisa memakai
 * value-nya. Kalau departemen disimpan di `kategori`, menambah departemen baru
 * akan ditolak database saat dipakai layanan.
 *
 * Dari sisi admin keduanya tetap satu tempat: tab Kategori punya sub-tab
 * Departemen, jadi Anda tidak perlu berpindah tab.
 */

// Supabase JS v2.104+ butuh PostgrestVersion pada tipe Database untuk inferensi
// penuh pada operasi tulis. Sampai skema diregenerasi lewat Supabase CLI, kita
// cast client-nya agar lolos batasan generik (pola sama dengan route admin lain).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any

type Row = {
  value: string
  label: string
  description: string | null
  color: string | null
  sub_categories: string[] | null
  sort_order: number | null
}

function toClient(row: Row) {
  return {
    value: row.value,
    label: row.label,
    description: row.description ?? "",
    color: row.color ?? "#5a5c62",
    scope: row.sub_categories ?? [],
    sort_order: row.sort_order ?? 0,
  }
}

/** Bentuk bawaan dari kode: dipakai bila tabel belum ada atau belum diisi. */
function fromConfig() {
  return LAYANAN_DEPTS.map((d, i) => ({
    value: d.value,
    label: d.label,
    description: d.description,
    color: d.color,
    scope: d.scope,
    sort_order: d.sort_order ?? i + 1,
  }))
}

/** Ubah label menjadi slug: huruf kecil, spasi jadi garis bawah. */
function toValue(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40)
}

/** Ubah apa pun menjadi larik teks yang bersih. */
function toScope(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean).slice(0, 12)
  if (typeof v === "string") {
    return v
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 12)
  }
  return []
}

// GET /api/admin/tipe
export async function GET() {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const { data, error } = await db
    .from("layanan_depts")
    .select("*")
    .order("sort_order", { ascending: true })

  // Tabel belum dibuat atau belum ada isinya: layani dari konfigurasi kode
  // supaya situs tetap tampil benar sebelum migrasi dijalankan.
  if (error) return NextResponse.json(fromConfig())

  const rows = (data ?? []) as Row[]
  if (rows.length === 0) return NextResponse.json(fromConfig())

  return NextResponse.json(rows.map(toClient))
}

// POST /api/admin/tipe, tambah departemen
export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const body = await req.json().catch(() => null)
  const label = String(body?.label ?? "").trim()
  if (!label) {
    return NextResponse.json({ error: "Nama departemen wajib diisi." }, { status: 400 })
  }

  // value boleh dikirim admin; kalau tidak, diturunkan dari label.
  const value = String(body?.value ?? "").trim() || toValue(label)
  if (!/^[a-z0-9_]{2,40}$/.test(value)) {
    return NextResponse.json(
      { error: "Kode departemen hanya boleh huruf kecil, angka, dan garis bawah (2-40 karakter)." },
      { status: 400 }
    )
  }

  const { data: sudahAda } = await db
    .from("layanan_depts")
    .select("value")
    .eq("value", value)
    .maybeSingle()
  if (sudahAda) {
    return NextResponse.json(
      { error: `Kode "${value}" sudah dipakai departemen lain.` },
      { status: 409 }
    )
  }

  // Urutan: taruh di belakang kalau tidak ditentukan.
  let sort = Number(body?.sort_order)
  if (!Number.isFinite(sort) || sort <= 0) {
    const { data: akhir } = await db
      .from("layanan_depts")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    sort = ((akhir?.sort_order as number | undefined) ?? 0) + 1
  }

  const { data, error } = await db
    .from("layanan_depts")
    .insert({
      value,
      label,
      description: body?.description ? String(body.description).trim() : null,
      color: body?.color ?? "#5a5c62",
      sub_categories: toScope(body?.scope),
      sort_order: sort,
    })
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toClient(data as Row), { status: 201 })
}

// PUT /api/admin/tipe?value=<kode>
export async function PUT(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const value = req.nextUrl.searchParams.get("value")
  if (!value) return NextResponse.json({ error: "Missing value" }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body?.label || !String(body.label).trim()) {
    return NextResponse.json({ error: "Nama departemen wajib diisi." }, { status: 400 })
  }

  // `value` sengaja TIDAK diubah: kolom `layanan.dept` menyimpan nilai ini,
  // jadi mengubahnya akan memutus kaitan dengan layanan yang sudah ada.
  const { error } = await db
    .from("layanan_depts")
    .update({
      label: String(body.label).trim(),
      description: body.description ? String(body.description).trim() : null,
      color: body.color ?? "#5a5c62",
      sub_categories: toScope(body.scope),
      sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    })
    .eq("value", value)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/tipe?value=<kode>
export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireAdmin()
  if (!user) return unauthorized()

  const value = req.nextUrl.searchParams.get("value")
  if (!value) return NextResponse.json({ error: "Missing value" }, { status: 400 })

  // Departemen yang masih dipakai layanan tidak boleh dihapus: menghapusnya
  // akan membuat layanan itu kehilangan departemen dan hilang dari halaman
  // publik. Pesannya menyebut jumlahnya supaya Anda tahu harus memindahkan
  // berapa layanan lebih dulu.
  const { count } = await db
    .from("layanan")
    .select("id", { count: "exact", head: true })
    .eq("dept", value)

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `Departemen ini masih dipakai ${count} layanan. Pindahkan layanan itu ke departemen lain dulu, lalu hapus.`,
      },
      { status: 409 }
    )
  }

  const { count: countPortfolio } = await db
    .from("portfolio")
    .select("id", { count: "exact", head: true })
    .eq("dept", value)

  if ((countPortfolio ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `Departemen ini masih dipakai ${countPortfolio} portofolio. Pindahkan portofolio itu ke departemen lain dulu, lalu hapus.`,
      },
      { status: 409 }
    )
  }

  const { error } = await db.from("layanan_depts").delete().eq("value", value)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

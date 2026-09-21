import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * POST /api/views
 * Body: { table: "informasi" | "berita", slug: string }
 *
 * Menaikkan penghitung tampilan sebanyak 1. Dipanggil dari komponen klien
 * saat halaman detail dibuka atau di-refresh.
 *
 * Sengaja tanpa autentikasi: ini penghitung tampilan publik. Yang dibatasi
 * adalah tabel dan kolomnya — fungsi database `increment_views` hanya boleh
 * menaikkan kolom `views`, tidak menyentuh kolom lain.
 */
const ALLOWED_TABLES = new Set(["informasi", "berita"])

export async function POST(req: NextRequest) {
  let body: { table?: string; slug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body harus JSON" }, { status: 400 })
  }

  const { table, slug } = body

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: "Tabel tidak diizinkan" }, { status: 400 })
  }
  if (!slug || typeof slug !== "string" || slug.length > 200) {
    return NextResponse.json({ error: "Slug tidak valid" }, { status: 400 })
  }

  // Panggil fungsi database yang hanya menaikkan kolom views.
  // Tanpa fungsi ini, klien anonim tidak punya izin UPDATE sama sekali.
  const { error } = await supabase.rpc("increment_views", { p_table: table, p_slug: slug })

  if (error) {
    // Jangan bikin halaman gagal hanya karena penghitung — cukup catat.
    console.error("Gagal menaikkan views:", error.message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}

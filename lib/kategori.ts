import type { KategoriScope } from "@/lib/database.types"
import { supabase } from "@/lib/supabase"

/**
 * ── KATEGORI TERPUSAT ────────────────────────────────────────────────────────
 *
 * Satu tabel `kategori` melayani tiga modul: Layanan, Berita, dan Informasi.
 * Kolom `scope` memisahkannya, jadi admin mengelola satu daftar saja dan
 * halaman publik menyaring sesuai modulnya.
 *
 * Nilai `slug` disimpan di kolom `category` pada tabel terkait (layanan,
 * berita, informasi). Kalau kategori dihapus, dokumen lama tetap menyimpan
 * slug-nya dan ditampilkan apa adanya lewat fallback di `resolveKategori`.
 */

/** Warna cadangan bila kategori belum punya warna. */
export const KATEGORI_FALLBACK_COLOR = "#5a5c62"

/** Bentuk ringkas yang dikirim ke komponen klien. */
export interface KategoriItem {
  slug: string
  label: string
  color: string
  description?: string | null
}

export function toKategoriItem(k: {
  slug: string
  label: string
  color: string | null
  description?: string | null
}): KategoriItem {
  return {
    slug: k.slug,
    label: k.label,
    color: k.color || KATEGORI_FALLBACK_COLOR,
    description: k.description,
  }
}

/**
 * Ambil kategori aktif untuk satu modul, urut sesuai sort_order.
 * Kalau tabel belum ada atau kosong, kembalikan array kosong supaya halaman
 * tetap tampil (dokumen ditampilkan dengan label slug apa adanya).
 */
export async function getKategori(scope: KategoriScope): Promise<KategoriItem[]> {
  const { data, error } = await supabase
    .from("kategori")
    .select("slug, label, color, description")
    .eq("scope", scope)
    .eq("status", "active")
    .order("sort_order", { ascending: true })

  if (error) {
    // Tabel `kategori` belum dibuat: halaman tetap jalan tanpa filter kategori.
    console.error(`Error fetching kategori (${scope}):`, error.message)
    return []
  }

  return (data ?? []).map((k: { slug: string; label: string; color: string | null; description: string | null }) =>
    toKategoriItem(k)
  )
}

/**
 * Bangun daftar kategori dari dokumen yang benar-benar ada, dipakai sebagai
 * cadangan ketika tabel `kategori` masih kosong. Label memakai slug apa adanya.
 */
export function kategoriDariDokumen(slugs: string[]): KategoriItem[] {
  return [...new Set(slugs.filter(Boolean))].map((slug) => ({
    slug,
    label: slug,
    color: KATEGORI_FALLBACK_COLOR,
  }))
}

/**
 * Cari kategori berdasarkan slug. Kalau tidak ketemu (mis. kategori sudah
 * dihapus tapi dokumen lama masih memakainya), tampilkan slug apa adanya.
 */
export function resolveKategori(slug: string, list: KategoriItem[]): KategoriItem {
  const found = list.find((k) => k.slug.toLowerCase() === slug.toLowerCase())
  return found ?? { slug, label: slug, color: KATEGORI_FALLBACK_COLOR }
}

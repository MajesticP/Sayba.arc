// ============================================================
// SAYBA ARC — Konfigurasi & Helper Berita
// ------------------------------------------------------------
// Isi artikel TIDAK lagi di file ini — sudah pindah ke tabel
// `berita` di Supabase dan dikelola lewat Admin Dashboard.
// File ini hanya menyimpan daftar kategori dan fungsi bantu.
//
// Menambah kategori: tambahkan satu baris di newsCategories,
// otomatis muncul di filter halaman /berita dan dropdown admin.
// ============================================================

export interface NewsCategory {
  /** disimpan di kolom `category` tabel berita */
  slug: string
  label: string
  color: string
}

export const newsCategories: NewsCategory[] = [
  { slug: "gis", label: "GIS & Pemetaan", color: "#ff914d" },
  { slug: "teknologi", label: "Teknologi", color: "#0a6e8a" },
  { slug: "proyek", label: "Cerita Proyek", color: "#7c5cff" },
  { slug: "engineering", label: "Engineering", color: "#111111" },
  { slug: "perusahaan", label: "Kabar Perusahaan", color: "#1f9d55" },
]

export function getCategory(slug: string): NewsCategory | undefined {
  return newsCategories.find((c) => c.slug === slug)
}

export function getCategoryLabel(slug: string): string {
  return getCategory(slug)?.label ?? slug
}

export function getCategoryColor(slug: string): string {
  return getCategory(slug)?.color ?? "#ff914d"
}

/** "2026-09-05" → "5 Sep 2026" */
export function formatNewsDate(iso: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Memecah isi artikel (Markdown ringan dari textarea admin) menjadi blok:
 * baris kosong memisah paragraf, awalan "## " menandai sub-judul.
 */
export function parseArticleBody(body: string | null): string[] {
  if (!body) return []
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
}

/** Ubah judul jadi slug URL — dipakai admin saat mengetik judul. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

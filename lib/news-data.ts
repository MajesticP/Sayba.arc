// ============================================================
// SAYBA ARC: Helper Berita
// ------------------------------------------------------------
// Kategori TIDAK lagi didefinisikan di sini. Semua kategori (Layanan,
// Berita, Informasi) dikelola dari satu tabel `kategori` di database dan
// diambil lewat lib/kategori.ts, sehingga admin bisa menambah atau
// menghapus kategori tanpa deploy.
// ============================================================

export function formatNewsDate(iso: string): string {
  if (!iso) return "-"
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return iso
  }
}

/** Perkiraan waktu baca dari isi artikel, minimal 1 menit. */
export function estimateReadMinutes(body: string | null): number {
  if (!body) return 1
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

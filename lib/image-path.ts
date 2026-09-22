/**
 * Penyaring path gambar contoh.
 *
 * Folder public/banners, public/berita, dan public/promo sudah dihapus. Sebagian
 * baris di database masih menyimpan path ke berkas-berkas itu dari versi lama,
 * dan path tersebut sekarang menunjuk ke berkas yang tidak ada lagi.
 *
 * Fungsi di sini menolaknya di satu tempat, jadi seluruh halaman publik
 * otomatis memperlakukannya sebagai "belum ada gambar": kartu menampilkan
 * bidang garis ukur, halaman detail tidak menampilkan blok gambar. Ini lebih
 * jujur daripada menampilkan foto contoh yang bukan milik konten itu.
 *
 * Ganti gambar dari admin (unggah ulang) dan path-nya akan lolos penyaring
 * ini seperti biasa.
 */

/** Path contoh dari versi lama. */
const CONTOH = [
  "/banners/",
  "/promo/",
  "/berita/berita-",
  "/berita/berita_",
]

/**
 * True bila URL menunjuk berkas contoh yang sudah dihapus.
 *
 * Hanya path lokal yang diperiksa. URL absolut (Supabase Storage, Google
 * Drive, atau domain lain) selalu dianggap sah.
 */
export function isGambarContoh(url: string | null | undefined): boolean {
  if (!url) return true
  if (/^https?:\/\//i.test(url)) return false
  if (url.startsWith("/api/")) return false
  return CONTOH.some((c) => url.startsWith(c))
}

/** Kembalikan URL bila sah, atau null bila itu path contoh. */
export function gambarSah(url: string | null | undefined): string | null {
  return isGambarContoh(url) ? null : (url as string)
}

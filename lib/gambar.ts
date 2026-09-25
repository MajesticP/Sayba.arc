/**
 * Gambar: memastikan setiap tautan gambar benar-benar bisa ditampilkan.
 *
 * Kenapa modul ini ada:
 *
 * 1. KEBIJAKAN KEAMANAN (CSP). Situs ini membatasi `img-src` hanya ke domain
 *    yang dikenal. Gambar yang tautannya ditempel dari situs lain — galeri,
 *    forum, penyimpanan awan — akan DIBLOKIR browser tanpa pesan apa pun.
 *    Yang terlihat hanya bidang kosong, dan penyebabnya sulit ditebak.
 *    Solusinya: tautan luar diarahkan ke `/api/img`, sehingga gambar disajikan
 *    dari domain situs ini sendiri.
 *
 * 2. GOOGLE DRIVE. Tautan Drive tidak bisa dipasang langsung sebagai `src`
 *    (butuh penanganan khusus), jadi diarahkan ke `/api/gdrive-img`.
 *
 * Sebelum ini, logika yang sama disalin ke empat berkas berbeda, dan setiap
 * salinan hanya menangani Drive. Akibatnya, gambar dari luar Drive tetap
 * diblokir di semua tempat. Sekarang hanya ada satu salinan.
 *
 * Fungsi ini murni (tidak mengimpor apa pun), jadi aman dipakai di komponen
 * klien maupun server.
 */

/** Deteksi tautan Google Drive dalam berbagai bentuk. */
function idDrive(url: string): string | null {
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return fileMatch[1]
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return idMatch[1]
  return null
}

/**
 * Ubah tautan gambar menjadi URL yang pasti bisa ditampilkan.
 *
 * - Tautan relatif (`/logo.png`, hasil unggahan) → dibiarkan.
 * - Google Drive → `/api/gdrive-img`.
 * - Tautan luar lain → `/api/img?url=...`.
 *
 * Mengembalikan `null` bila masukannya kosong, supaya rantai fallback gambar
 * bisa lanjut ke sumber berikutnya.
 */
export function gambarAman(url: string | null | undefined): string | null {
  if (!url) return null

  // Sudah relatif (termasuk tautan ke proksi): biarkan apa adanya.
  if (url.startsWith("/")) return url

  // Bukan tautan web (mis. data: URL): biarkan.
  if (!url.startsWith("http")) return url

  // Google Drive punya proksi sendiri karena tautannya tidak bisa dipasang
  // langsung sebagai src.
  const drive = idDrive(url)
  if (drive) return `/api/gdrive-img?id=${drive}`

  // Tautan luar: lewatkan proksi umum supaya tidak diblokir CSP.
  return `/api/img?url=${encodeURIComponent(url)}`
}

/**
 * Sama seperti `gambarAman`, tetapi selalu mengembalikan string.
 * Dipakai di tempat yang tidak menerima `null`.
 */
export function gambarAmanAtau(url: string | null | undefined, cadangan = ""): string {
  return gambarAman(url) ?? cadangan
}

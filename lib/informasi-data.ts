// ============================================================
// SAYBA ARC: Helper Pusat Informasi
// ------------------------------------------------------------
// Kategori informasi TIDAK lagi didefinisikan di file ini.
// Daftar kategori sekarang dikelola lewat tabel `informasi_kategori`
// di Supabase dan diatur dari Admin Dashboard, sehingga halaman
// publik bisa menambah/menghapus kategori tanpa mengubah kode.
//
// File ini hanya menyimpan fungsi bantu yang murni presentasional: format
// tanggal. Parser isi dokumen ada di lib/markdown.tsx, dipakai bersama oleh
// halaman Informasi dan Berita supaya aturan penulisannya cuma satu.
// ============================================================

/** "2026-09-05" → "5 September 2026". Mengembalikan input apa adanya bila tak valid. */
export function formatInformasiDate(iso: string): string {
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

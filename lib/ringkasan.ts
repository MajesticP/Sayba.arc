/**
 * Ringkasan otomatis dari isi artikel.
 *
 * Dipakai tombol "Ambil dari isi artikel" di kolom Ringkasan pada form admin.
 * Menulis ringkasan sendiri tetap lebih baik — mesin pencari lebih menyukai
 * ringkasan yang ditulis manusia — tetapi tombol ini jauh lebih cepat daripada
 * mengarang dari nol, dan hasilnya selalu masuk akal karena diambil dari
 * kalimat yang memang sudah ditulis penulisnya.
 *
 * Aturannya:
 *  - Paragraf pertama yang benar-benar berisi kalimat yang dipakai. Judul,
 *    butir daftar, kutipan, dan baris tabel dilewati, karena potongan seperti
 *    itu tidak enak dibaca sebagai ringkasan.
 *  - Penanda penulisan (**, *, `, tautan) dibuang supaya ringkasan tidak
 *    menampilkan tanda bintang ke pembaca.
 *  - Pemotongan dilakukan di batas kata terdekat, supaya tidak ada kata yang
 *    terbelah di tengah.
 */

/** Panjang ringkasan yang nyaman di kartu daftar dan di hasil pencarian. */
export const PANJANG_RINGKASAN = 165

/**
 * Blok yang DILEWATI saat mencari paragraf untuk ringkasan.
 *
 * Perhatikan: satu tanda `#` TIDAK ada di sini. Di situs ini, `#` menandai
 * paragraf pembuka (huruf lebih besar), bukan judul. Justru paragraf itulah
 * yang paling cocok jadi ringkasan, karena di situlah penulis menaruh
 * inti tulisannya. Yang dilewati adalah `##`/`###` (sub-judul sungguhan),
 * butir daftar, kutipan, dan baris tabel.
 *
 * Tanda `-` dan `*` hanya dianggap butir kalau diikuti spasi, supaya kalimat
 * yang kebetulan diawali huruf miring (mis. `*catatan* penting`) tidak ikut
 * terbuang.
 */
const BUKAN_PARAGRAF = /^(#{2,}\s|[>\-*]\s|\||\d+[.)]\s)/

export function ringkasDariIsi(body: string | null | undefined, maks = PANJANG_RINGKASAN): string {
  if (!body) return ""

  const paragraf = body
    .replace(/\r\n/g, "\n")
    .split("\n\n")
    .map((b) => b.trim())
    .find((b) => b && !BUKAN_PARAGRAF.test(b))

  if (!paragraf) return ""

  const bersih = paragraf
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/^#+\s*/, "")
    .replace(/\s+/g, " ")
    .trim()

  if (bersih.length <= maks) return bersih

  const potong = bersih.slice(0, maks)
  const spasiTerakhir = potong.lastIndexOf(" ")
  const rapi = spasiTerakhir > maks * 0.6 ? potong.slice(0, spasiTerakhir) : potong
  return rapi.trim() + "…"
}

// ============================================================
// SAYBA ARC: Parser & Perender Isi Artikel (Markdown Ringan)
// ------------------------------------------------------------
// Dipakai BERSAMA oleh halaman Informasi dan Berita, supaya
// penulisannya sama di kedua modul dan tidak ada dua aturan
// yang pelan-pelan berbeda.
//
// Sintaks yang didukung (lihat juga PANDUAN_TULIS di bawah):
//
//   # Paragraf        → paragraf pembuka (huruf lebih besar)
//   ## Sub-judul      → sub-judul bagian
//   ### Sub-sub       → sub-judul tingkat tiga
//   **tebal**         → huruf tebal
//   *miring*          → huruf miring
//   `kode`            → kode sebaris
//   [teks](url)       → tautan
//   - butir           → daftar berbutir
//   1. butir          → daftar bernomor
//   > kutipan         → kutipan
//   ---               → garis pemisah
//   ![alt](url)       → gambar di tengah
//   | a | b |         → tabel (baris pertama jadi kepala)
//   | --- | --- |     → baris pemisah tabel (WAJIB ada, penanda tabel)
//
// Prinsipnya: SATU tempat untuk aturan penulisan. Halaman
// Informasi dan Berita memanggil perender yang sama, jadi
// penulis tidak perlu menghafal dua cara.
// ============================================================

import type React from "react"

/** Satu blok isi setelah dipecah dari teks mentah. */
export type Blok =
  | { jenis: "paragraf"; teks: string; pembuka: boolean }
  | { jenis: "subjudul"; teks: string; tingkat: 2 | 3 }
  | { jenis: "daftar"; butir: string[]; bernomor: boolean }
  | { jenis: "kutipan"; teks: string }
  | { jenis: "garis" }
  | { jenis: "gambar"; alt: string; url: string }
  | { jenis: "tabel"; kepala: string[]; baris: string[][] }

/**
 * Pecah isi artikel menjadi blok-blok.
 *
 * Baris kosong memisah blok. Di dalam satu blok, baris yang berurutan
 * digabung jadi satu paragraf (kecuali daftar dan tabel, yang memang
 * baris per baris).
 */
export function parseIsi(body: string | null | undefined): Blok[] {
  if (!body) return []
  const baris = body.replace(/\r\n/g, "\n").split("\n")
  const blok: Blok[] = []
  let buffer: string[] = []

  const buangBuffer = () => {
    const teks = buffer.join("\n").trim()
    buffer = []
    if (!teks) return
    blok.push({ jenis: "paragraf", teks, pembuka: false })
  }

  for (let i = 0; i < baris.length; i++) {
    const b = baris[i]
    const t = b.trim()

    // ── Baris kosong: tutup blok yang sedang terkumpul ──
    if (!t) {
      buangBuffer()
      continue
    }

    // ── Garis pemisah ──
    if (/^-{3,}$/.test(t)) {
      buangBuffer()
      blok.push({ jenis: "garis" })
      continue
    }

    // ── Gambar: ![alt](url) ──
    const gambar = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (gambar) {
      buangBuffer()
      blok.push({ jenis: "gambar", alt: gambar[1], url: gambar[2] })
      continue
    }

    // ── Sub-judul: ## dan ### ──
    // Ditulis sebelum "#" supaya "##" tidak keburu dibaca sebagai paragraf.
    const sub3 = t.match(/^###\s+(.+)$/)
    if (sub3) {
      buangBuffer()
      blok.push({ jenis: "subjudul", teks: sub3[1].trim(), tingkat: 3 })
      continue
    }
    const sub2 = t.match(/^##\s+(.+)$/)
    if (sub2) {
      buangBuffer()
      blok.push({ jenis: "subjudul", teks: sub2[1].trim(), tingkat: 2 })
      continue
    }

    // ── Paragraf pembuka: # (satu pagar) ──
    // Dipakai untuk kalimat pembuka yang ditarik keluar dari paragraf biasa:
    // hurufnya lebih besar dan warnanya lebih gelap, seperti lead di majalah.
    const pembuka = t.match(/^#\s+(.+)$/)
    if (pembuka) {
      buangBuffer()
      blok.push({ jenis: "paragraf", teks: pembuka[1].trim(), pembuka: true })
      continue
    }

    // ── Tabel: | a | b | ──
    //
    // Bentuk yang dikenali:
    //     | Kepala 1 | Kepala 2 |
    //     | --- | --- |
    //     | isi | isi |
    //
    // Baris pemisah (---) WAJIB ada. Tanpa itu, baris berpipa diperlakukan
    // sebagai paragraf biasa — supaya tanda pipa yang kebetulan dipakai di
    // tengah kalimat tidak tiba-tiba berubah jadi tabel.
    if (t.startsWith("|") && t.endsWith("|") && t.length > 1) {
      const pisah = (baris: string) =>
        baris
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((sel) => sel.trim())

      const barisPemisah = i + 1 < baris.length ? baris[i + 1].trim() : ""
      const pemisahSah =
        barisPemisah.startsWith("|") &&
        barisPemisah.endsWith("|") &&
        /^\|[\s:|-]+\|$/.test(barisPemisah) &&
        barisPemisah.includes("-")

      if (pemisahSah) {
        buangBuffer()
        const kepala = pisah(t)
        const isiTabel: string[][] = []
        i += 2 // lewati baris kepala dan baris pemisah
        while (i < baris.length) {
          const lanjut = baris[i].trim()
          if (!lanjut.startsWith("|") || !lanjut.endsWith("|")) break
          isiTabel.push(pisah(lanjut))
          i++
        }
        i-- // mundur satu langkah: loop utama akan menaikkannya lagi
        blok.push({ jenis: "tabel", kepala, baris: isiTabel })
        continue
      }
    }

    // ── Kutipan: > ──
    if (t.startsWith(">")) {
      buangBuffer()
      const isi: string[] = [t.replace(/^>\s?/, "")]
      while (i + 1 < baris.length && baris[i + 1].trim().startsWith(">")) {
        i++
        isi.push(baris[i].trim().replace(/^>\s?/, ""))
      }
      blok.push({ jenis: "kutipan", teks: isi.join(" ").trim() })
      continue
    }

    // ── Daftar berbutir ──
    if (/^[-*]\s+/.test(t)) {
      buangBuffer()
      const butir: string[] = [t.replace(/^[-*]\s+/, "")]
      while (i + 1 < baris.length && /^[-*]\s+/.test(baris[i + 1].trim())) {
        i++
        butir.push(baris[i].trim().replace(/^[-*]\s+/, ""))
      }
      blok.push({ jenis: "daftar", butir, bernomor: false })
      continue
    }

    // ── Daftar bernomor ──
    if (/^\d+[.)]\s+/.test(t)) {
      buangBuffer()
      const butir: string[] = [t.replace(/^\d+[.)]\s+/, "")]
      while (i + 1 < baris.length && /^\d+[.)]\s+/.test(baris[i + 1].trim())) {
        i++
        butir.push(baris[i].trim().replace(/^\d+[.)]\s+/, ""))
      }
      blok.push({ jenis: "daftar", butir, bernomor: true })
      continue
    }

    // ── Baris biasa: kumpulkan jadi satu paragraf ──
    buffer.push(t)
  }

  buangBuffer()
  return blok
}

/**
 * Perender teks sebaris: **tebal**, *miring*, `kode`, dan [tautan](url).
 *
 * Ditulis sebagai fungsi yang mengembalikan ReactNode, BUKAN
 * dangerouslySetInnerHTML: isi artikel datang dari input admin, dan
 * menyisipkannya sebagai HTML mentah membuka celah XSS.
 */
export function renderSebaris(teks: string, warnaTebal?: string): React.ReactNode[] {
  const keluar: React.ReactNode[] = []
  // Urutan pola penting: tautan dan kode lebih dulu supaya tanda bintang di
  // dalamnya tidak keburu dibaca sebagai penekanan.
  const pola =
    /(\[[^\]]+\]\([^)]+\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g
  let akhir = 0
  let cocok: RegExpExecArray | null
  let kunci = 0

  while ((cocok = pola.exec(teks)) !== null) {
    if (cocok.index > akhir) keluar.push(teks.slice(akhir, cocok.index))
    const bagian = cocok[0]

    if (bagian.startsWith("[")) {
      const m = bagian.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (m) {
        const luar = /^https?:\/\//i.test(m[2])
        keluar.push(
          <a
            key={kunci++}
            href={m[2]}
            {...(luar ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="font-semibold text-orange-text underline decoration-orange/40 underline-offset-2 hover:decoration-orange transition-colors"
          >
            {m[1]}
          </a>
        )
      }
    } else if (bagian.startsWith("`")) {
      keluar.push(
        <code
          key={kunci++}
          className="px-1.5 py-0.5 rounded-md bg-ice-dim border border-ice-line text-[0.9em] font-mono text-navy"
        >
          {bagian.slice(1, -1)}
        </code>
      )
    } else if (bagian.startsWith("**")) {
      keluar.push(
        <strong key={kunci++} className="font-bold" style={warnaTebal ? { color: warnaTebal } : undefined}>
          {bagian.slice(2, -2)}
        </strong>
      )
    } else if (bagian.startsWith("*")) {
      keluar.push(
        <em key={kunci++} className="italic">
          {bagian.slice(1, -1)}
        </em>
      )
    }
    akhir = cocok.index + bagian.length
  }

  if (akhir < teks.length) keluar.push(teks.slice(akhir))
  return keluar
}

/**
 * Panduan penulisan yang ditampilkan di bawah isi artikel.
 * Satu sumber untuk Informasi dan Berita: kalau sintaksnya berubah,
 * panduannya ikut berubah di tempat yang sama.
 */
export const PANDUAN_TULIS: Array<{ sintaks: string; arti: string }> = [
  { sintaks: "# Paragraf", arti: "Paragraf pembuka (huruf lebih besar)" },
  { sintaks: "## Sub-judul", arti: "Judul bagian, masuk ke Daftar Isi" },
  { sintaks: "### Sub-sub", arti: "Judul bagian tingkat tiga" },
  { sintaks: "**tebal**", arti: "Huruf tebal" },
  { sintaks: "*miring*", arti: "Huruf miring" },
  { sintaks: "`kode`", arti: "Kode sebaris" },
  { sintaks: "[teks](https://…)", arti: "Tautan" },
  { sintaks: "- butir", arti: "Daftar berbutir" },
  { sintaks: "1. butir", arti: "Daftar bernomor" },
  { sintaks: "> kutipan", arti: "Kutipan" },
  { sintaks: "![alt](url)", arti: "Gambar di tengah isi" },
  { sintaks: "| a | b |", arti: "Tabel (baris pemisah | --- | wajib)" },
  { sintaks: "---", arti: "Garis pemisah" },
]

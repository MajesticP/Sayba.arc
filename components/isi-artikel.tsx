"use client"

import { useMemo } from "react"
import { Info } from "lucide-react"
import { parseIsi, renderSebaris, PANDUAN_TULIS } from "@/lib/markdown"

/**
 * IsiArtikel: perender isi artikel untuk halaman Informasi dan Berita.
 *
 * Satu komponen dipakai dua halaman, jadi tampilan isi artikel tidak mungkin
 * berbeda antara keduanya. Aturan sintaksnya ada di lib/markdown.tsx, dan
 * panduannya ditampilkan di bawah isi supaya penulis tidak perlu membuka
 * berkas kode untuk tahu cara menulis.
 *
 * Sub-judul diberi atribut `data-info-heading`. Halaman Informasi memakainya
 * untuk menyorot bagian yang sedang dibaca lewat IntersectionObserver yang
 * sudah ada di sana; halaman Berita tidak memakai daftar isi, jadi atribut itu
 * diabaikan begitu saja.
 */

interface Props {
  body: string | null
  /** Warna huruf tebal. Bawaannya navy. */
  warnaTebal?: string
  /** Warna teks paragraf. */
  warnaTeks?: string
  /** Warna aksen (butir daftar, garis kutipan, titik panduan). */
  aksen?: string
  /** Tampilkan panduan penulisan di bawah isi. */
  panduan?: boolean
}

export default function IsiArtikel({
  body,
  warnaTebal = "#112a46",
  warnaTeks = "#112a46",
  aksen = "#f07a26",
  panduan = false,
}: Props) {
  const blok = useMemo(() => parseIsi(body), [body])

  if (blok.length === 0) return null

  return (
    <div className="min-w-0">
      {blok.map((b, i) => {
        // ── Paragraf pembuka: huruf lebih besar, seperti lead di majalah ──
        if (b.jenis === "paragraf" && b.pembuka) {
          return (
            <p
              key={i}
              className="text-[16px] md:text-[19px] leading-[1.7] mb-5 max-w-[68ch] font-medium"
              style={{ color: warnaTeks }}
            >
              {renderSebaris(b.teks, warnaTebal)}
            </p>
          )
        }

        // ── Paragraf biasa ──
        if (b.jenis === "paragraf") {
          return (
            <p
              key={i}
              className="text-[15px] md:text-[16px] leading-[1.75] my-4 whitespace-pre-line max-w-[70ch]"
              style={{ color: warnaTeks }}
            >
              {renderSebaris(b.teks, warnaTebal)}
            </p>
          )
        }

        // ── Sub-judul: masuk ke daftar isi (halaman Informasi) ──
        if (b.jenis === "subjudul") {
          if (b.tingkat === 3) {
            return (
              <h3
                key={i}
                data-info-heading={b.teks}
                className="text-[15.5px] md:text-[18px] font-bold mt-7 mb-3 leading-snug scroll-mt-28"
                style={{ color: warnaTebal }}
              >
                {b.teks}
              </h3>
            )
          }
          return (
            <h2
              key={i}
              data-info-heading={b.teks}
              className="text-[18px] md:text-[24px] font-black mt-9 mb-4 pb-2.5 border-b flex items-start gap-2.5 scroll-mt-28 leading-snug"
              style={{ color: warnaTebal, borderColor: "#d8e0ea" }}
            >
              <span className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: aksen }} aria-hidden="true" />
              {b.teks}
            </h2>
          )
        }

        // ── Daftar berbutir / bernomor ──
        if (b.jenis === "daftar") {
          const Tag = b.bernomor ? "ol" : "ul"
          return (
            <Tag
              key={i}
              className={`my-5 space-y-2.5 pl-1 max-w-[70ch] ${b.bernomor ? "list-none" : ""}`}
            >
              {b.butir.map((butir, bi) => (
                <li
                  key={bi}
                  className="flex items-start gap-2.5 text-[15px] md:text-[16px] leading-[1.75]"
                  style={{ color: warnaTeks }}
                >
                  {b.bernomor ? (
                    <span
                      className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 tabular-nums"
                      style={{ backgroundColor: `${aksen}1f`, color: warnaTebal }}
                      aria-hidden="true"
                    >
                      {bi + 1}
                    </span>
                  ) : (
                    <span
                      className="mt-2.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: aksen }}
                      aria-hidden="true"
                    />
                  )}
                  <span>{renderSebaris(butir, warnaTebal)}</span>
                </li>
              ))}
            </Tag>
          )
        }

        // ── Kutipan ──
        if (b.jenis === "kutipan") {
          return (
            <blockquote
              key={i}
              className="my-6 pl-4 py-1 border-l-[3px] italic text-[15px] md:text-[16.5px] leading-[1.7] max-w-[68ch]"
              style={{ borderColor: aksen, color: warnaTeks }}
            >
              {renderSebaris(b.teks, warnaTebal)}
            </blockquote>
          )
        }

        // ── Garis pemisah ──
        if (b.jenis === "garis") {
          return (
            <hr key={i} className="my-8 border-0 h-px" style={{ backgroundColor: "#d8e0ea" }} aria-hidden="true" />
          )
        }

        // ── Gambar di tengah isi ──
        if (b.jenis === "gambar") {
          return (
            <figure key={i} className="my-7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.url}
                alt={b.alt}
                loading="lazy"
                className="w-full rounded-2xl border"
                style={{ borderColor: "#d8e0ea" }}
              />
              {b.alt && (
                <figcaption className="text-[12px] mt-2 text-center" style={{ color: "#5a5c62" }}>
                  {b.alt}
                </figcaption>
              )}
            </figure>
          )
        }

        return null
      })}

      {panduan && <PanduanPenulisan />}
    </div>
  )
}

/**
 * PanduanPenulisan: daftar sintaks yang bisa dipakai penulis.
 *
 * Ditampilkan di bawah isi artikel, bukan disembunyikan di dokumentasi kode,
 * karena yang menulis artikel adalah admin lewat dashboard. Bentuknya tabel
 * dua kolom: sintaks di kiri (font mono supaya tanda bintangnya terlihat apa
 * adanya), artinya di kanan.
 */
function PanduanPenulisan() {
  return (
    <aside
      className="mt-10 rounded-2xl border overflow-hidden"
      style={{ borderColor: "#d8e0ea", backgroundColor: "#f4f6f9" }}
      aria-label="Panduan penulisan"
    >
      <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor: "#d8e0ea" }}>
        <Info className="w-4 h-4 shrink-0" style={{ color: "#b45610" }} aria-hidden="true" />
        <h2 className="text-[13px] font-black" style={{ color: "#112a46" }}>
          Panduan Penulisan Isi
        </h2>
      </div>
      <div className="px-5 py-4">
        <p className="text-[12.5px] leading-relaxed mb-3.5" style={{ color: "#5a5c62" }}>
          Tulis isi artikel memakai penanda di bawah ini. Pisahkan setiap bagian
          dengan satu baris kosong.
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {PANDUAN_TULIS.map((p) => (
            <div key={p.sintaks} className="flex items-baseline gap-3">
              <dt
                className="text-[11.5px] font-mono font-bold shrink-0 px-1.5 py-0.5 rounded bg-white border"
                style={{ borderColor: "#d8e0ea", color: "#112a46", minWidth: "8.5rem" }}
              >
                {p.sintaks}
              </dt>
              <dd className="text-[12px] leading-snug" style={{ color: "#5a5c62" }}>
                {p.arti}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}

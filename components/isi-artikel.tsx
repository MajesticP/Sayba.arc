"use client"

import { useMemo } from "react"
import { parseIsi, renderSebaris } from "@/lib/markdown"

/**
 * IsiArtikel: perender isi artikel untuk halaman Informasi dan Berita.
 *
 * Satu komponen dipakai dua halaman, jadi tampilan isi artikel tidak mungkin
 * berbeda antara keduanya. Aturan sintaksnya ada di lib/markdown.tsx.
 *
 * Panduan penulisan TIDAK ditampilkan di halaman publik: pembaca tidak perlu
 * melihat cara menulis artikel. Panduannya ada di form admin, tempat penulis
 * benar-benar membutuhkannya.
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
}

export default function IsiArtikel({
  body,
  warnaTebal = "#112a46",
  warnaTeks = "#112a46",
  aksen = "#f07a26",
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
    </div>
  )
}

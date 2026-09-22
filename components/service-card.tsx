"use client"

import Link from "next/link"
import { ArrowRight, ImageIcon } from "lucide-react"
import { isGambarContoh } from "@/lib/image-path"
import type { Layanan } from "@/lib/database.types"

/**
 * ServiceCard: kartu layanan memanjang, dipakai BERSAMA oleh beranda dan
 * halaman Layanan.
 *
 * Ini satu-satunya definisi bentuk kartu layanan di seluruh situs. Sebelumnya
 * beranda dan halaman Layanan punya kartunya masing-masing, dan keduanya
 * pelan-pelan berbeda ukuran. Dengan satu komponen, perbedaan itu mustahil
 * terjadi lagi: ubah di sini, kedua halaman ikut berubah.
 *
 * Tinggi kartu diambil dari `--kartu-h` di globals.css, bukan angka di dalam
 * komponen. Carousel di beranda memakai variabel yang sama untuk menghitung
 * tinggi jendelanya, jadi jendela selalu pas berisi tepat dua kartu.
 *
 * Isi kartu sengaja ramping: gambar 1:1 di kiri, judul satu baris, keterangan
 * satu baris, panah di kanan. Konteks departemen atau kategori sudah dibawa
 * judul blok di atasnya, jadi tidak diulang di dalam kartu, dan tidak ada
 * baris tambahan yang membuat tinggi kartu berbeda-beda.
 */

/** Link Google Drive → proxy gambar lokal, sama seperti berita/informasi */
export function gdriveToImg(url: string | null): string | null {
  // Path gambar contoh dari versi lama diperlakukan sebagai "belum ada gambar".
  if (url && isGambarContoh(url)) return null
  if (!url) return null
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

export default function ServiceCard({
  item,
  /** Aksen warna departemen, dipakai sebagai garis tepi kiri. */
  accent,
}: {
  item: Layanan
  accent?: string
}) {
  const img = gdriveToImg(item.image_url)

  return (
    <Link
      href={`/services/${item.slug}`}
      className="kartu-sorot group flex flex-row items-stretch bg-white rounded-xl md:rounded-2xl border border-ice-line overflow-hidden hover:border-orange hover:shadow-md transition-all duration-200"
      style={{ height: "var(--kartu-h)" }}
    >
      {/* Garis aksen departemen di tepi kiri. Tipis saja: penanda, bukan hiasan. */}
      {accent && <span className="w-1 shrink-0" style={{ backgroundColor: accent }} aria-hidden="true" />}

      {/* Foto 1:1 di kiri, setinggi kartu. */}
      <div className="relative aspect-square shrink-0 self-stretch bg-ice-dim overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-brand" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Isi: judul + keterangan, masing-masing satu baris. */}
      <div className="flex flex-col justify-center flex-1 min-w-0 px-3.5 md:px-4 py-2.5">
        <h3 className="text-[14px] md:text-[15.5px] font-bold text-navy leading-snug group-hover:text-orange-text transition-colors line-clamp-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-[12px] md:text-[13px] text-slate-brand leading-snug line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}
      </div>

      <span className="flex items-center pr-3.5 md:pr-4 shrink-0">
        <ArrowRight
          className="w-4 h-4 text-slate-brand group-hover:text-orange-text group-hover:translate-x-0.5 transition-all"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}

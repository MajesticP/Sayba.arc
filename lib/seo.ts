// ============================================================
// SAYBA ARC: SEO Otomatis
// ------------------------------------------------------------
// Satu sumber kebenaran untuk metadata semua halaman konten
// (berita, informasi, portofolio, layanan).
//
// Prinsipnya: SEO diambil dari data yang SUDAH diisi admin,
// jadi tidak ada pengisian ganda. Urutan pengambilannya:
//
//   title       ← judul konten + nama situs
//   description ← excerpt → deskripsi → potongan isi → deskripsi situs
//   og:image    ← gambar utama konten → og-image.png bawaan situs
//   keywords    ← nama kategori + departemen + istilah tetap situs
//
// Kolom SEO manual (meta_title, meta_description, og_image,
// canonical_url) tetap dibaca bila ADA isinya, karena admin
// masih boleh menimpanya untuk kasus khusus. Tapi admin tidak
// perlu mengisinya: mengosongkan semuanya sudah menghasilkan
// metadata yang lengkap dan wajar.
//
// Keyword kini ikut diisi otomatis dari kategori, departemen,
// dan istilah tetap situs. Sebelumnya keyword hanya terisi bila
// admin mengetiknya manual, dan akibatnya hampir semua halaman
// tidak punya keyword sama sekali.
// ============================================================

import type { Metadata } from "next"
import { siteConfig, ogImage } from "@/lib/data"

/** Panjang maksimum meta description agar tidak terpotong di hasil pencarian. */
const MAX_DESCRIPTION = 160

/** Ubah path relatif jadi URL absolut: wajib untuk canonical & OG image. */
export function absoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return url.startsWith("http") ? url : `${siteConfig.url}${url}`
}

/**
 * Link Google Drive → proxy gambar lokal (/api/gdrive-img).
 * Mengembalikan `null` bila kosong, supaya rantai fallback gambar
 * bisa lanjut ke sumber berikutnya.
 */
export function gdriveToProxy(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

/** Potong deskripsi di batas kata agar rapi di hasil pencarian. */
function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= MAX_DESCRIPTION) return clean
  const cut = clean.slice(0, MAX_DESCRIPTION)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

export interface SeoInput {
  /** Judul konten mentah: jadi basis meta title & og:title. */
  title: string
  /** Judul meta manual (kolom `meta_title`). */
  metaTitle?: string | null
  /** Ringkasan singkat konten (kolom `excerpt`). */
  excerpt?: string | null
  /** Deskripsi panjang konten (mis. `description` layanan/portofolio). */
  description?: string | null
  /** Deskripsi meta manual (kolom `meta_description`). */
  metaDescription?: string | null
  /** Keyword manual (kolom `meta_keywords`), tanpa fallback otomatis. */
  metaKeywords?: string[] | null
  /** Gambar utama konten (kolom `image_url`). */
  image?: string | null
  /** OG image manual (kolom `og_image`). */
  ogImage?: string | null
  /** Path halaman, mis. "/berita/judul-artikel". */
  path: string
  /** URL canonical manual (kolom `canonical_url`). */
  canonicalUrl?: string | null
  /** Tipe Open Graph. */
  type?: "article" | "website"
  /** Tanggal terbit: hanya untuk `type: "article"`. */
  publishedTime?: string | null
  /**
   * Label kategori konten (mis. "Panduan", "Pemetaan"). Ikut jadi keyword
   * otomatis dan disisipkan ke description bila description masih kosong.
   */
  kategori?: string | null
  /**
   * Label departemen/bidang (mis. "Engineering Consultant"). Ikut jadi keyword
   * otomatis.
   */
  departemen?: string | null
}

/**
 * Bangun metadata Next.js dari kolom konten + kolom SEO dengan
 * rantai fallback. Kolom SEO yang kosong otomatis memakai data konten.
 */
/**
 * Istilah tetap situs yang selalu relevan untuk halaman konten.
 * Ditaruh di satu tempat supaya tidak tersebar di puluhan halaman.
 */
const KEYWORD_SITUS = [
  "SAYBA ARC",
  "konsultan IT Pontianak",
  "konsultan engineering Pontianak",
  "Kalimantan Barat",
]

/**
 * Susun daftar keyword otomatis dari data konten.
 *
 * Urutannya: keyword manual (bila ada) dulu, lalu kategori, departemen,
 * judul, dan istilah tetap situs. Duplikat dibuang tanpa peduli huruf besar
 * kecil, dan jumlahnya dibatasi supaya tidak jadi daftar panjang tanpa guna.
 */
function susunKeyword(input: SeoInput): string[] | undefined {
  const kandidat = [
    ...(input.metaKeywords ?? []),
    input.kategori,
    input.departemen,
    input.title,
    ...KEYWORD_SITUS,
  ]

  const dilihat = new Set<string>()
  const hasil: string[] = []
  for (const k of kandidat) {
    const bersih = (k ?? "").trim()
    if (!bersih) continue
    const kunci = bersih.toLowerCase()
    if (dilihat.has(kunci)) continue
    dilihat.add(kunci)
    hasil.push(bersih)
    if (hasil.length >= 12) break
  }
  return hasil.length > 0 ? hasil : undefined
}

export function buildSeoMetadata(input: SeoInput): Metadata {
  const url = `${siteConfig.url}${input.path}`

  // ── Pengambilan otomatis, dengan penimpa manual bila ada ──
  const metaTitle = input.metaTitle?.trim()
  const title = metaTitle || `${input.title}, ${siteConfig.name}`

  const description = clampDescription(
    input.metaDescription?.trim() ||
      input.excerpt?.trim() ||
      input.description?.trim() ||
      siteConfig.description
  )

  const image = absoluteUrl(input.ogImage || input.image) || ogImage.url

  // Keyword: manual bila ada, sisanya disusun otomatis dari data konten.
  const keywords = susunKeyword(input)

  return {
    title,
    description,
    keywords,
    alternates: { canonical: input.canonicalUrl || url },
    openGraph: {
      title: metaTitle || input.title,
      description,
      url,
      type: input.type ?? "article",
      ...(input.type === "article" && input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle || input.title,
      description,
      images: [image],
    },
  }
}

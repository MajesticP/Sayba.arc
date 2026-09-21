// ============================================================
// SAYBA ARC: SEO Dinamis (Fallback Berantai)
// ------------------------------------------------------------
// Satu sumber kebenaran untuk metadata halaman slug (berita,
// informasi, portofolio, layanan). Urutan fallback:
//
//   meta_title       ← meta_title → "Judul: SAYBA ARC"
//   meta_description ← meta_description → excerpt → description → deskripsi situs
//   OG image         ← og_image → image → og-image.png bawaan situs
//   keyword          ← meta_keywords SAJA (manual, tanpa fallback)
//
// Tujuan: admin cukup mengisi kolom konten biasa; kolom SEO
// hanya perlu diisi bila ingin menimpa hasil otomatis.
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
}

/**
 * Bangun metadata Next.js dari kolom konten + kolom SEO dengan
 * rantai fallback. Kolom SEO yang kosong otomatis memakai data konten.
 */
export function buildSeoMetadata(input: SeoInput): Metadata {
  const url = `${siteConfig.url}${input.path}`

  // ── Fallback berantai ──────────────────────────────────────
  const metaTitle = input.metaTitle?.trim()
  const title = metaTitle || `${input.title}, ${siteConfig.name}`

  const description = clampDescription(
    input.metaDescription?.trim() ||
      input.excerpt?.trim() ||
      input.description?.trim() ||
      siteConfig.description
  )

  const image = absoluteUrl(input.ogImage || input.image) || ogImage.url

  // Keyword sengaja TIDAK diisi otomatis: hanya dari input manual.
  const keywords = input.metaKeywords?.filter((k) => k.trim().length > 0)

  return {
    title,
    description,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
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

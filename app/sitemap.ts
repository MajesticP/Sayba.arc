import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/data"
import { supabase } from "@/lib/supabase"

// Always fetch fresh from the database — a cached sitemap would keep
// pointing at stale slugs/images after admins add or edit records.
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url
  const now = new Date()

  const staticPages = [
    { url: base, lastModified: now, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/berita`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 },
  ]

  const [{ data: layananItems }, { data: produkItems }, { data: portfolioItems }, { data: beritaItems }] = await Promise.all([
    supabase.from("layanan").select("slug, created_at, image_url, og_image").eq("status", "active"),
    supabase.from("produk").select("slug, created_at, image_url, og_image").eq("status", "active"),
    supabase.from("portfolio").select("slug, created_at, image_url, og_image").eq("status", "active"),
    supabase.from("berita").select("slug, published_at, image_url, og_image").eq("status", "active"),
  ])

  type ItemRow = { slug: string; created_at: string; image_url: string | null; og_image: string | null }

  const toPages = (items: ItemRow[] | null, segment: string, priority: number) =>
    (items ?? []).map((item) => {
      const images = [...new Set([item.image_url, item.og_image].filter((u): u is string => !!u))]
      return {
        url: `${base}/${segment}/${item.slug}`,
        lastModified: new Date(item.created_at),
        changeFrequency: "monthly" as const,
        priority,
        ...(images.length > 0 ? { images } : {}),
      }
    })

  type BeritaRow = { slug: string; published_at: string; image_url: string | null; og_image: string | null }

  const newsPages = ((beritaItems ?? []) as BeritaRow[]).map((a) => {
    const images = [...new Set([a.image_url, a.og_image].filter((u): u is string => !!u))]
      .map((u) => (u.startsWith("http") ? u : `${base}${u}`))
    return {
      url: `${base}/berita/${a.slug}`,
      lastModified: new Date(a.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      ...(images.length > 0 ? { images } : {}),
    }
  })

  return [
    ...staticPages,
    ...newsPages,
    ...toPages(layananItems, "services", 0.7),
    ...toPages(produkItems, "products", 0.7),
    ...toPages(portfolioItems, "portfolio", 0.6),
  ]
}

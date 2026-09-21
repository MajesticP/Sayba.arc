import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/data"
import { supabase } from "@/lib/supabase"

// Selalu ambil data segar: sitemap yang ter-cache akan menunjuk slug lama
// setelah admin menambah atau mengubah konten.
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/informasi`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/berita`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
  ]

  const [layananRes, informasiRes, portfolioRes, beritaRes] = await Promise.all([
    supabase.from("layanan").select("slug, created_at, image_url, og_image").eq("status", "active"),
    supabase.from("informasi").select("slug, created_at, image_url, og_image").eq("status", "active"),
    supabase.from("portfolio").select("slug, created_at, image_url, og_image").eq("status", "active"),
    supabase.from("berita").select("slug, published_at, image_url, og_image").eq("status", "active"),
  ])

  type ItemRow = {
    slug: string
    created_at: string
    image_url: string | null
    og_image: string | null
  }

  const toPages = (
    items: ItemRow[] | null,
    segment: string,
    priority: number
  ): MetadataRoute.Sitemap =>
    (items ?? []).map((item) => {
      const images = [...new Set([item.image_url, item.og_image].filter((u): u is string => !!u))].map(
        (u) => (u.startsWith("http") ? u : `${base}${u}`)
      )
      return {
        url: `${base}/${segment}/${item.slug}`,
        lastModified: new Date(item.created_at),
        changeFrequency: "monthly" as const,
        priority,
        ...(images.length > 0 ? { images } : {}),
      }
    })

  type BeritaRow = {
    slug: string
    published_at: string
    image_url: string | null
    og_image: string | null
  }

  const newsPages: MetadataRoute.Sitemap = ((beritaRes.data ?? []) as BeritaRow[]).map((a) => {
    const images = [...new Set([a.image_url, a.og_image].filter((u): u is string => !!u))].map((u) =>
      u.startsWith("http") ? u : `${base}${u}`
    )
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
    ...toPages(layananRes.data as ItemRow[] | null, "services", 0.8),
    ...toPages(portfolioRes.data as ItemRow[] | null, "portfolio", 0.7),
    ...toPages(informasiRes.data as ItemRow[] | null, "informasi", 0.6),
    ...newsPages,
  ]
}

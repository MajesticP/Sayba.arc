import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/data"
import { supabase } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url
  const now = new Date()

  const staticPages = [
    { url: base, lastModified: now, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 },
  ]

  const [{ data: layananItems }, { data: produkItems }, { data: portfolioItems }] = await Promise.all([
    supabase.from("layanan").select("slug, created_at").eq("status", "active"),
    supabase.from("produk").select("slug, created_at").eq("status", "active"),
    supabase.from("portfolio").select("slug, created_at").eq("status", "active"),
  ])

  const toPages = (
    items: { slug: string; created_at: string }[] | null,
    segment: string,
    priority: number,
  ) =>
    (items ?? []).map((item) => ({
      url: `${base}/${segment}/${item.slug}`,
      lastModified: new Date(item.created_at),
      changeFrequency: "monthly" as const,
      priority,
    }))

  return [
    ...staticPages,
    ...toPages(layananItems, "services", 0.7),
    ...toPages(produkItems, "products", 0.7),
    ...toPages(portfolioItems, "portfolio", 0.6),
  ]
}

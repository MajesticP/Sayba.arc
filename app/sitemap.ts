import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/data"
import { supabase } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url

  const staticPages = [
    { url: base, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/services`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/portfolio`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly" as const, priority: 0.7 },
  ]

  const { data: layananItems } = await supabase
    .from("layanan")
    .select("slug")
    .eq("status", "active")

  const servicePages = (layananItems ?? []).map((s) => ({
    url: `${base}/services/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...servicePages]
}

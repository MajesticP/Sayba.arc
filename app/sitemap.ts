import type { MetadataRoute } from "next"
import { siteConfig, services } from "@/lib/data"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url

  const staticPages = [
    { url: base, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/services`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/portfolio`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly" as const, priority: 0.7 },
  ]

  const servicePages = services.map((s) => ({
    url: `${base}${s.href}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...servicePages]
}

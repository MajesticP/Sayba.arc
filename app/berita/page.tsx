import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsList from "@/components/news-list"
import { supabase } from "@/lib/supabase"
import type { Berita } from "@/lib/database.types"

const description =
  "Catatan proyek, panduan teknis, dan kabar terbaru dari SAYBA ARC — konsultan IT dan engineering di Pontianak, Kalimantan Barat."

export const metadata: Metadata = {
  title: `Berita — ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/berita` },
  openGraph: {
    title: `Berita — ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/berita`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function BeritaPage() {
  const { data, error } = await supabase
    .from("berita")
    .select("*")
    .eq("status", "active")
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching berita:", error)
  }

  const articles: Berita[] = data ?? []
  const featured = articles.find((a) => a.featured) ?? null

  return (
    <main className="min-h-screen flex flex-col bg-platinum">
      <Header navItems={navItems} />

      <NewsList articles={articles} featured={featured} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

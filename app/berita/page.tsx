import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import NewsList from "@/components/news-list"
import { supabase } from "@/lib/supabase"
import type { Berita } from "@/lib/database.types"

const description =
  "Kabar terbaru, catatan proyek, dan artikel teknis dari SAYBA ARC seputar GIS & pemetaan, pengembangan digital, serta rancang teknik."

export const metadata: Metadata = {
  title: `Berita & Artikel — ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/berita` },
  openGraph: {
    title: `Berita & Artikel — ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/berita`,
    type: "website",
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
  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />

      <PageHero
        image="/banners/berita-1920x600.png"
        eyebrow="Ruang Baca"
        title="Berita & Artikel"
        subtitle="Catatan proyek, panduan teknis, dan kabar terbaru dari tim SAYBA ARC — ditulis dari pengalaman lapangan."
      />

      <NewsList articles={articles} featured={featured} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

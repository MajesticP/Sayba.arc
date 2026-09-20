import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import NewsList from "@/components/news-list"
import { supabase } from "@/lib/supabase"
import type { Informasi } from "@/lib/database.types"

const description =
  "Informasi terkini, pengumuman layanan, dan panduan seputar IT & Engineering Konsulting dari SAYBA ARC."

export const metadata: Metadata = {
  title: `Informasi — ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/informasi` },
  openGraph: {
    title: `Informasi — ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/informasi`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function InformasiPage() {
  const { data, error } = await supabase
    .from("informasi")
    .select("*")
    .eq("status", "active")
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching informasi:", error)
  }

  // Cast to `any` and then to `Informasi` since NewsList expects Berita but they have identical shapes.
  const articles: any[] = data ?? []
  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />

      <PageHero
        image="/banners/products-1920x600.webp"
        imageMobile="/banners/products-mobile-900x450.webp"
        eyebrow="Pusat Informasi"
        title="Informasi Layanan"
        subtitle="Temukan detail pengumuman, panduan layanan, serta informasi terkini dari layanan IT & Engineering kami."
      />

      <NewsList articles={articles} featured={featured} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

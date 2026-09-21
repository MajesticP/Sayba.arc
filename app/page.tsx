import type { Metadata } from "next"
import { siteConfig, hero, features, about, cta, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Hero from "@/components/hero"
import PromoCarousel from "@/components/promo-carousel"
import NewsHighlight from "@/components/news-highlight"
import Services from "@/components/services"
import Features from "@/components/features"
import About from "@/components/about"
import CTA from "@/components/cta"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan, PromoBanner, Berita } from "@/lib/database.types"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import { generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
    images: [ogImage],
  },
}

export default async function Home() {
  // Tiga layanan unggulan untuk section Layanan di beranda
  const { data: layananItems, error } = await supabase
    .from("layanan")
    .select("*")
    .eq("status", "active")
    .not("featured_order", "is", null)
    .order("featured_order", { ascending: true })
    .limit(3)

  if (error) {
    console.error("Error fetching layanan:", error)
  }

  const allLayanan: Layanan[] = layananItems ?? []

  const { data: promoData } = await supabase
    .from("promo_banner")
    .select("*")
    .eq("status", "active")
    .order("sort_order", { ascending: true })

  const promoBanners: PromoBanner[] = promoData ?? []

  const { data: beritaData } = await supabase
    .from("berita")
    .select("id, title, slug, excerpt, category, image_url, published_at, read_minutes, views")
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(3)

  const beritaTerbaru = (beritaData ?? []) as Berita[]

  const organizationSchema = generateOrganizationSchema()
  const localBusinessSchema = generateLocalBusinessSchema()

  return (
    <main className="min-h-screen flex flex-col bg-platinum">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <Header navItems={navItems} />
      <Hero data={hero} />
      <PromoCarousel slides={promoBanners} interval={6000} />
      <Services allLayanan={allLayanan} depts={LAYANAN_DEPTS} />
      <Features
        title="Cara Kami Bekerja"
        subtitle="Hal yang bisa Anda harapkan saat mengerjakan proyek bersama kami."
        items={features}
      />
      <NewsHighlight articles={beritaTerbaru} />
      <About data={about} />
      <CTA data={cta} />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

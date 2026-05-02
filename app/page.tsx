import type { Metadata } from "next"
import { siteConfig, hero, features, about, cta, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Hero from "@/components/hero"
import Services from "@/components/services"
import Features from "@/components/features"
import About from "@/components/about"
import CTA from "@/components/cta"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan } from "@/lib/database.types"

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
  },
}

export default async function Home() {
  const { data: layananItems, error } = await supabase
    .from("layanan")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching layanan:", error)
  }

  const allLayanan: Layanan[] = layananItems ?? []

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />
      <Hero data={hero} />
      <Services allLayanan={allLayanan} />
      <Features
        title="Mengapa Memilih SAYBA ARC"
        subtitle="Yang membedakan kami dari agensi biasa"
        items={features}
      />
      <About data={about} />
      <CTA data={cta} />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

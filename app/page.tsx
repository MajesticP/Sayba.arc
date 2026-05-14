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
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"

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
    .not("featured_order", "is", null)
    .order("featured_order", { ascending: true })
    .limit(3)

  if (error) {
    console.error("Error fetching layanan:", error)
  }

  const allLayanan: Layanan[] = layananItems ?? []

  const { data: deptsData } = await supabaseAdmin.from("layanan_depts").select("*").order("sort_order", { ascending: true })
  const depts: LayananDept[] = deptsData && deptsData.length > 0
    ? deptsData.map((r: any) => ({ value: r.value, label: r.label, description: r.description ?? "", badgeClass: r.badge_class, color: r.color, subCategories: r.sub_categories ?? [] }))
    : LAYANAN_DEPTS

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />
      <Hero data={hero} />
      <Services allLayanan={allLayanan} depts={depts} />
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

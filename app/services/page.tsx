import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import ServicesClient from "./services-client"

export const metadata: Metadata = {
  title: `Layanan — ${siteConfig.name}`,
  description: "Layanan digital dan engineering end-to-end dari SAYBA ARC — GIS, web, ML, desain kapal, dan lebih.",
  alternates: { canonical: `${siteConfig.url}/services` },
  openGraph: {
    title: `Layanan — ${siteConfig.name}`,
    description: "Layanan digital dan engineering end-to-end dari SAYBA ARC — GIS, web, ML, desain kapal, dan lebih.",
    url: `${siteConfig.url}/services`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function ServicesPage() {
  const [{ data: layananItems, error }, { data: deptsData }] = await Promise.all([
    supabase
      .from("layanan")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true }),
    supabaseAdmin.from("layanan_depts").select("*").order("sort_order", { ascending: true }),
  ])

  if (error) {
    console.error("Error fetching layanan:", error)
  }

  const allLayanan: Layanan[] = layananItems ?? []

  const depts: LayananDept[] = deptsData && deptsData.length > 0
    ? deptsData.map((r: any) => ({ value: r.value, label: r.label, description: r.description ?? "", badgeClass: r.badge_class, color: r.color, subCategories: r.sub_categories ?? [] }))
    : LAYANAN_DEPTS

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />

      {/* Hero */}
      <PageHero
        image="/banners/services-1920x600.png"
        eyebrow="Yang Kami Tawarkan"
        title="Layanan Kami"
        subtitle="Semua layanan kami dikerjakan langsung oleh tim — tidak ada subkontrak, tidak ada hand-off ke pihak ketiga yang tidak Anda kenal."
      />

      <ServicesClient allLayanan={allLayanan} allDepts={depts} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

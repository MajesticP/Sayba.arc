import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Produk } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import ProductsClient from "./products-client"

export const metadata: Metadata = {
  title: `Produk — ${siteConfig.name}`,
  description: "Dokumen dan produk siap pakai dari SAYBA ARC — gambar teknis, template, dan deliverable digital lainnya.",
  alternates: { canonical: `${siteConfig.url}/products` },
  openGraph: {
    title: `Produk — ${siteConfig.name}`,
    description: "Dokumen dan produk siap pakai dari SAYBA ARC — gambar teknis, template, dan deliverable digital lainnya.",
    url: `${siteConfig.url}/products`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function ProductsPage() {
  const [{ data: produkItems, error }, { data: deptsData }] = await Promise.all([
    supabase
      .from("produk")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true }),
    supabaseAdmin.from("layanan_depts").select("*").order("sort_order", { ascending: true }),
  ])

  if (error) {
    console.error("Error fetching produk:", error)
  }

  const allProduk: Produk[] = produkItems ?? []

  const depts: LayananDept[] = deptsData && deptsData.length > 0
    ? deptsData.map((r: any) => ({ value: r.value, label: r.label, description: r.description ?? "", badgeClass: r.badge_class, color: r.color, subCategories: r.sub_categories ?? [] }))
    : LAYANAN_DEPTS

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />

      {/* Hero */}
      <PageHero
        image="/banners/products-1920x600.webp"
        imageMobile="/banners/products-mobile-900x450.webp"
        eyebrow="Dokumen Siap Pakai"
        title="Produk Kami"
        subtitle="Dokumen, template, dan deliverable siap pakai yang bisa langsung Anda gunakan — tanpa menunggu proses pengerjaan kustom."
      />

      <ProductsClient allProduk={allProduk} allDepts={depts} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

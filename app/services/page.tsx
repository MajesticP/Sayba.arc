import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan } from "@/lib/database.types"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import { getKategori, kategoriDariDokumen } from "@/lib/kategori"
import ServicesClient from "./services-client"

const description =
  "Dua departemen layanan SAYBA ARC: IT Consultant untuk pengembangan perangkat lunak dan sistem informasi, Engineering Consultant untuk pemetaan spasial dan dokumen rancang bangun."

export const metadata: Metadata = {
  title: `Layanan: ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/services` },
  openGraph: {
    title: `Layanan: ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/services`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function ServicesPage() {
  const [layananRes, kategoriDb] = await Promise.all([
    supabase
      .from("layanan")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true }),
    getKategori("layanan"),
  ])

  if (layananRes.error) console.error("Error fetching layanan:", layananRes.error.message)

  const allLayanan: Layanan[] = layananRes.data ?? []

  // Kategori dari tabel `kategori`; kalau masih kosong, susun dari layanan
  // yang benar-benar ada supaya labelnya tetap tampil.
  const kategori =
    kategoriDb.length > 0
      ? kategoriDb
      : kategoriDariDokumen(allLayanan.map((l) => l.category ?? "").filter(Boolean))

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />
      <ServicesClient allLayanan={allLayanan} depts={LAYANAN_DEPTS} kategori={kategori} />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

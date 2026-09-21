import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Informasi } from "@/lib/database.types"
import { FALLBACK_INFORMASI } from "@/lib/informasi-data"
import InformasiClient from "./informasi-client"

const description =
  "Pusat informasi resmi SAYBA ARC — panduan layanan, standar teknis CAD & geospasial, dokumentasi rilis, serta pengumuman operasional untuk klien dan mitra."

export const metadata: Metadata = {
  title: `Informasi & Dokumen Teknis — ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/informasi` },
  openGraph: {
    title: `Informasi & Dokumen Teknis — ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/informasi`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function InformasiPage() {
  let articles: Informasi[] = []

  try {
    const { data, error } = await supabase
      .from("informasi")
      .select("*")
      .eq("status", "active")
      .order("published_at", { ascending: false })

    if (error) console.error("Error fetching informasi:", error)

    articles = data && data.length > 0 ? data : FALLBACK_INFORMASI
  } catch (err) {
    console.error("Error fetching informasi from Supabase:", err)
    articles = FALLBACK_INFORMASI
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header navItems={navItems} />

      <PageHero
              eyebrow="Pusat Informasi"
              title="Informasi Layanan"
              subtitle="Temukan detail pengumuman, panduan layanan, serta informasi terkini dari layanan IT & Engineering kami."
            />

      <NewsList articles={articles} featured={featured} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

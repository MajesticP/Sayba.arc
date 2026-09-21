import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan } from "@/lib/database.types"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import ServicesClient from "./services-client"

const description =
  "Dua departemen layanan SAYBA ARC: IT Consultant untuk pengembangan perangkat lunak dan sistem informasi, Engineering Consultant untuk pemetaan spasial dan dokumen rancang bangun."

export const metadata: Metadata = {
  title: `Layanan — ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/services` },
  openGraph: {
    title: `Layanan — ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/services`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function ServicesPage() {
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
    <main className="min-h-screen flex flex-col bg-platinum">
      <Header navItems={navItems} />

      <ServicesClient allLayanan={allLayanan} depts={LAYANAN_DEPTS} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

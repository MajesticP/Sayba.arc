import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan } from "@/lib/database.types"
import ServicesClient from "./services-client"

export const metadata: Metadata = {
  title: `Layanan — ${siteConfig.name}`,
  description: "Layanan ArcGIS dan IT end-to-end dari SAYBA ARC.",
}

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
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      {/* Hero */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-4">Yang Kami Tawarkan</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Layanan Kami</h1>
          <p className="text-white/45 text-lg max-w-2xl mx-auto">
            Departemen spesialis siap memberikan solusi terbaik untuk kebutuhan organisasi Anda.
          </p>
        </div>
      </section>

      <ServicesClient allLayanan={allLayanan} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

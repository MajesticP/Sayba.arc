import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import ServicesClient from "./services-client"

export const metadata: Metadata = {
  title: `Layanan — ${siteConfig.name}`,
  description: "Layanan digital dan engineering end-to-end dari SAYBA ARC — GIS, web, ML, desain kapal, dan lebih.",
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

  const { data: deptsData } = await supabaseAdmin.from("layanan_depts").select("*").order("sort_order", { ascending: true })
  const depts: LayananDept[] = deptsData && deptsData.length > 0
    ? deptsData.map((r: any) => ({ value: r.value, label: r.label, description: r.description ?? "", badgeClass: r.badge_class, color: r.color, subCategories: r.sub_categories ?? [] }))
    : LAYANAN_DEPTS

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />

      {/* Hero */}
      <section className="bg-black py-8 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-[10px] font-bold text-[#ff914d] uppercase tracking-widest mb-2">Yang Kami Tawarkan</span>
          <h1 className="text-[22px] md:text-5xl font-bold text-white mb-2">Layanan Kami</h1>
          <p className="text-white/45 text-[13px] md:text-lg max-w-2xl mx-auto">
            Semua layanan kami dikerjakan langsung oleh tim — tidak ada subkontrak, tidak ada hand-off ke pihak ketiga yang tidak Anda kenal.
          </p>
        </div>
      </section>

      <ServicesClient allLayanan={allLayanan} allDepts={depts} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

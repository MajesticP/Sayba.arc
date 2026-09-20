import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import FAQSection from "@/components/faq-section"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import ServicesClient from "./services-client"
import { generateBreadcrumbSchema } from "@/lib/structured-data"
import type { FAQSection as FAQSectionType } from "@/lib/faq-types"

const desc = "Jasa IT Konsulting dan Engineering Konsulting dari SAYBA ARC — pengembangan web, aplikasi, machine learning, GIS, IoT, dan solusi digital end-to-end di Indonesia."

export const metadata: Metadata = {
  title: `Layanan IT & Engineering Konsulting — ${siteConfig.name}`,
  description: desc,
  keywords: ["IT Konsulting", "Engineering Konsulting", "Jasa Web Development Indonesia", "Machine Learning", "GIS Pemetaan", "IoT", "SAYBA ARC", "Pontianak"],
  alternates: { canonical: `${siteConfig.url}/services` },
  openGraph: {
    title: `Layanan IT & Engineering Konsulting — ${siteConfig.name}`,
    description: desc,
    url: `${siteConfig.url}/services`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

const servicesFAQ: FAQSectionType = {
  title: "Pertanyaan Umum Seputar Layanan",
  description: "Hal-hal yang sering ditanyakan klien sebelum bekerja sama dengan SAYBA ARC.",
  items: [
    {
      question: "Apa saja yang termasuk layanan IT Konsulting?",
      answer: "Layanan IT Konsulting kami mencakup pengembangan website, aplikasi mobile, sistem informasi terintegrasi, machine learning, data analytics, serta konsultasi arsitektur dan infrastruktur teknologi.",
    },
    {
      question: "Apa perbedaan IT Konsulting dan Engineering Konsulting?",
      answer: "IT Konsulting berfokus pada solusi perangkat lunak dan digital — website, aplikasi, ML, dan analitik data. Engineering Konsulting berfokus pada rekayasa teknik seperti pemetaan GIS, pengembangan IoT, firmware engineering, dan perencanaan teknis.",
    },
    {
      question: "Berapa lama proses pengerjaan proyek?",
      answer: "Timeline bervariasi sesuai skala proyek. Website company profile umumnya 2-4 minggu, aplikasi custom 1-3 bulan, dan proyek GIS/pemetaan tergantung luas area. Kami memberikan estimasi yang jelas di awal sebelum pekerjaan dimulai.",
    },
    {
      question: "Apakah ada konsultasi awal gratis?",
      answer: "Ya. Kami menyediakan sesi konsultasi awal tanpa biaya untuk memahami kebutuhan Anda, menilai kelayakan teknis, dan memberikan rekomendasi solusi yang tepat sebelum kontrak dimulai.",
    },
    {
      question: "Bagaimana sistem pembayaran proyeknya?",
      answer: "Umumnya terbagi menjadi beberapa termin: down payment di awal, pembayaran bertahap sesuai progres, dan pelunasan saat serah terima. Detail pembayaran disepakati bersama sebelum proyek dimulai.",
    },
    {
      question: "Apakah tersedia dukungan teknis setelah proyek selesai?",
      answer: "Ya. Setiap proyek mendapat masa garansi maintenance. Setelahnya, kami menawarkan paket dukungan teknis berkelanjutan sesuai kebutuhan Anda.",
    },
  ],
}

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

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Beranda", url: siteConfig.url },
    { name: "Layanan", url: `${siteConfig.url}/services` },
  ])

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: servicesFAQ.items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }

  return (
    <main className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header navItems={navItems} />

      <PageHero
        image="/banners/services-1920x600.webp"
        imageMobile="/banners/services-mobile-900x450.webp"
        eyebrow="IT & Engineering Konsulting"
        title="Layanan Kami"
        subtitle="Dikerjakan langsung oleh tim internal — tanpa subkontrak, tanpa hand-off ke pihak ketiga."
      />

      <ServicesClient allLayanan={allLayanan} allDepts={depts} />

      <FAQSection faq={servicesFAQ} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

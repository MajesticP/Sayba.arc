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

const desc = "SAYBA ARC — Solusi terintegrasi Engineering Consultant (Desain Rancang Bangun, Pemetaan, AutoCAD 2D/3D) dan IT Consultant (Website, Desktop, Mobile, Machine Learning) dari Pontianak."

export const metadata: Metadata = {
  title: `Layanan IT & Engineering Konsulting — ${siteConfig.name}`,
  description: desc,
  keywords: ["Engineering Consultant", "IT Consultant", "Desain Rancang Bangun", "Pemetaan", "AutoCAD 3D", "Website", "Machine Learning", "Pontianak", "SAYBA ARC"],
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
      question: "Apa saja ruang lingkup Engineering Consultant?",
      answer: "Layanan Engineering Consultant kami mencakup perancangan desain teknik (Rancang Bangun), Pemetaan (GIS & Spatial Analysis), Gambar Kerja 2D dan 3D (AutoCAD, dsb), serta perencanaan strategis bidang teknik. Fokus kami mengubah data lapangan menjadi rancangan akurat.",
    },
    {
      question: "Apa yang membedakan IT Consultant di SAYBA ARC?",
      answer: "Layanan IT Consultant kami difokuskan pada pengembangan perangkat lunak (Website, Desktop App, Mobile App) dan penerapan AI/Machine Learning. Kami bekerja end-to-end dari analisis arsitektur hingga deployment produksi yang andal.",
    },
    {
      question: "Apakah memungkinkan proyek menggabungkan IT dan Engineering?",
      answer: "Sangat bisa. Kami memiliki tim multidisiplin. Contohnya, pembuatan dashboard web (IT) yang menampilkan peta digital interaktif hasil survei pemetaan (Engineering) dalam satu platform terintegrasi.",
    },
    {
      question: "Berapa lama proses pengerjaan proyek?",
      answer: "Bergantung pada kompleksitas. Proyek pembuatan website umumnya memakan waktu 2-4 minggu. Proyek pemetaan atau rancang bangun bisa bervariasi dari hitungan minggu hingga bulan sesuai skala. Jadwal disepakati transparan di awal.",
    },
    {
      question: "Bagaimana sistem komunikasi selama proyek berlangsung?",
      answer: "Kami menggunakan pendekatan transparan dengan laporan berkala (mingguan) dan meeting evaluasi. Kami memastikan setiap perubahan dan progres selalu Anda ketahui tanpa ada istilah teknis yang disembunyikan.",
    },
  ],
}

export default async function ServicesPage() {
  const [{ data: layananItems, error }, { data: deptsData }] = await Promise.all([
      supabase
        .from("layanan")
        .select("id, title, slug, dept, category, description, image_url, prices, status, featured_order, og_image")
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(100),
      supabaseAdmin.from("layanan_depts").select("value, label, description, badge_class, color, sub_categories, sort_order").order("sort_order", { ascending: true }),
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
        eyebrow="Engineering & IT Consultant"
        title="Layanan Kami"
        subtitle="Dari Desain Rancang Bangun hingga Pengembangan Software — dikerjakan langsung oleh tim internal tanpa subkontrak."
      />

      <ServicesClient allLayanan={allLayanan} allDepts={depts} />

      <FAQSection faq={servicesFAQ} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan } from "@/lib/database.types"
import { getDepts, findDept } from "@/lib/layanan-config"
import { getKategori, resolveKategori } from "@/lib/kategori"
import { buildSeoMetadata, gdriveToProxy } from "@/lib/seo"
import ServiceDetailClient from "./service-detail-client"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

async function getService(slug: string): Promise<Layanan | null> {
  const { data, error } = await supabase
    .from("layanan")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle()

  if (error) console.error("Error fetching layanan detail:", error)
  return data ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return { title: `Layanan: ${siteConfig.name}` }

  return buildSeoMetadata({
    title: service.title,
    metaTitle: service.meta_title,
    description: service.description,
    metaDescription: service.meta_description,
    metaKeywords: service.meta_keywords,
    image: gdriveToProxy(service.og_image) || gdriveToProxy(service.image_url),
    path: `/services/${service.slug}`,
    canonicalUrl: service.canonical_url,
    type: "website",
  })
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const dept = findDept(await getDepts(), service.dept)

  // Label kategori dari tabel `kategori`. Kalau kategori sudah dihapus tapi
  // layanan lama masih memakainya, `resolveKategori` menampilkan slug apa
  // adanya supaya tidak ada label kosong di halaman.
  const kategoriLayanan = await getKategori("layanan")
  const kategoriLabel = service.category
    ? resolveKategori(service.category, kategoriLayanan).label
    : null

  // Layanan lain di departemen yang sama
  const { data: othersData } = await supabase
    .from("layanan")
    .select("id, title, slug, description, image_url, dept")
    .eq("status", "active")
    .eq("dept", service.dept)
    .neq("slug", service.slug)
    .limit(3)

  const others = othersData ?? []

  // Data terstruktur untuk mesin pencari
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.meta_description || service.description || undefined,
    url: `${siteConfig.url}/services/${service.slug}`,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Kalimantan Barat, Indonesia",
    },
    serviceType: dept?.label ?? service.dept,
  }

  const faqSchema =
    service.faqs && service.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: service.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Layanan", item: `${siteConfig.url}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `${siteConfig.url}/services/${service.slug}`,
      },
    ],
  }

  return (
    <main className="board-area min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Header navItems={navItems} />

      <ServiceDetailClient
        service={service}
        deptLabel={dept?.label ?? service.dept}
        categoryLabel={kategoriLabel}
        others={others}
      />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

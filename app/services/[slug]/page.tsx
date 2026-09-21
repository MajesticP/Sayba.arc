import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan } from "@/lib/database.types"
import { getDept } from "@/lib/layanan-config"
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
  if (!service) return { title: `Layanan — ${siteConfig.name}` }

  const url = `${siteConfig.url}/services/${service.slug}`
  const description =
    service.meta_description || service.description || siteConfig.description

  return {
    title: service.meta_title || `${service.title} — ${siteConfig.name}`,
    description,
    keywords: service.meta_keywords ?? undefined,
    alternates: { canonical: service.canonical_url || url },
    openGraph: {
      title: service.meta_title || service.title,
      description,
      url,
      type: "website",
      images: service.og_image || service.image_url
        ? [{ url: service.og_image || service.image_url || "", alt: service.title }]
        : undefined,
    },
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const dept = getDept(service.dept)

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
    <main className="min-h-screen flex flex-col bg-platinum">
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

      <ServiceDetailClient service={service} deptLabel={dept?.label ?? service.dept} others={others} />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

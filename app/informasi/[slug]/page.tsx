import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { generateBreadcrumbSchema } from "@/lib/structured-data"
import { supabase } from "@/lib/supabase"
import type { Informasi } from "@/lib/database.types"
import {
  FALLBACK_INFORMASI,
  parseInformasiBody,
} from "@/lib/informasi-data"
import InformasiDetailClient from "./informasi-detail-client"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${siteConfig.url}${url}`
}

async function getArticle(slug: string): Promise<Informasi | null> {
  try {
    const { data, error } = await supabase
      .from("informasi")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle()

    if (error) console.error("Error fetching informasi detail:", error)
    if (data) return data
  } catch (err) {
    console.error("Supabase error:", err)
  }

  // Fallback ke data lokal bila tabel kosong / tidak tersedia
  return FALLBACK_INFORMASI.find((a) => a.slug === slug) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: `Informasi — ${siteConfig.name}` }

  const url = `${siteConfig.url}/informasi/${article.slug}`

  return {
    title: article.meta_title || `${article.title} — ${siteConfig.name}`,
    description: article.meta_description || article.excerpt || undefined,
    keywords: article.meta_keywords ?? undefined,
    alternates: { canonical: article.canonical_url || url },
    openGraph: {
      title: article.title,
      description: article.meta_description || article.excerpt || undefined,
      url,
      type: "article",
      publishedTime: article.published_at,
      images: article.image_url ? [{ url: absoluteUrl(article.image_url), alt: article.title }] : undefined,
    },
  }
}

export default async function InformasiDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const blocks = parseInformasiBody(article.body)

  // Dokumen terkait: kategori sama lebih dulu
  let others: Informasi[] = []
  try {
    const { data } = await supabase
      .from("informasi")
      .select("*")
      .eq("status", "active")
      .neq("slug", article.slug)
      .order("published_at", { ascending: false })
      .limit(12)
    if (data && data.length > 0) others = data
  } catch {
    others = []
  }
  if (others.length === 0) {
    others = FALLBACK_INFORMASI.filter((a) => a.slug !== article.slug)
  }

  const related = [
    ...others.filter((a) => a.category === article.category),
    ...others.filter((a) => a.category !== article.category),
  ].slice(0, 3)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.published_at,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` },
    },
    mainEntityOfPage: `${siteConfig.url}/informasi/${article.slug}`,
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Beranda", url: siteConfig.url },
    { name: "Informasi", url: `${siteConfig.url}/informasi` },
    { name: article.title, url: `${siteConfig.url}/informasi/${article.slug}` },
  ])

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Header navItems={navItems} />

      <InformasiDetailClient
        article={article}
        blocks={blocks}
        related={related}
        heroImg={gdriveToImg(article.image_url)}
      />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

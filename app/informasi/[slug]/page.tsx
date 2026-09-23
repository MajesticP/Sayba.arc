import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ViewCounter from "@/components/view-counter"
import { generateBreadcrumbSchema } from "@/lib/structured-data"
import { buildSeoMetadata, gdriveToProxy } from "@/lib/seo"
import { supabase } from "@/lib/supabase"
import type { Informasi } from "@/lib/database.types"
import { getKategori, resolveKategori } from "@/lib/kategori"
import InformasiDetailClient from "./informasi-detail-client"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string | null {
  return gdriveToProxy(url)
}

async function getArticle(slug: string): Promise<Informasi | null> {
  const { data, error } = await supabase
    .from("informasi")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle()

  if (error) console.error("Error fetching informasi detail:", error)
  // Tidak ada data contoh: kalau tidak ada di database, halaman 404.
  return data ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: `Informasi: ${siteConfig.name}` }

  // Label kategori ikut dikirim supaya masuk ke keyword otomatis.
  const kategori = await getKategori("informasi")
  const label = resolveKategori(article.category, kategori).label

  return buildSeoMetadata({
    title: article.title,
    metaTitle: article.meta_title,
    excerpt: article.excerpt,
    description: article.body,
    metaDescription: article.meta_description,
    metaKeywords: article.meta_keywords,
    image: gdriveToProxy(article.og_image) || gdriveToProxy(article.image_url),
    path: `/informasi/${article.slug}`,
    canonicalUrl: article.canonical_url,
    type: "article",
    publishedTime: article.published_at,
    kategori: label,
  })
}

export default async function InformasiDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  // Kategori dari tabel `kategori` (scope "informasi") untuk label & warna chip.
  const kategori = await getKategori("informasi")

  // Dokumen terkait: kategori sama lebih dulu
  const { data: othersData } = await supabase
    .from("informasi")
    .select("id, title, slug, category, published_at, read_minutes")
    .eq("status", "active")
    .neq("slug", article.slug)
    .order("published_at", { ascending: false })
    .limit(12)

  const others = (othersData ?? []) as Array<{
    id: string
    title: string
    slug: string
    category: string
    published_at: string
    read_minutes: number
  }>
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
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo-256.png` },
    },
    mainEntityOfPage: `${siteConfig.url}/informasi/${article.slug}`,
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Beranda", url: siteConfig.url },
    { name: "Informasi", url: `${siteConfig.url}/informasi` },
    { name: article.title, url: `${siteConfig.url}/informasi/${article.slug}` },
  ])

  return (
    <main className="board-area min-h-screen flex flex-col bg-ice">
      {/* Penghitung tampilan: naik saat halaman dibuka atau di-refresh */}
      <ViewCounter table="informasi" slug={article.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header navItems={navItems} />

      <InformasiDetailClient
        article={article}
        related={related as unknown as Informasi[]}
        heroImg={gdriveToImg(article.image_url)}
        categories={kategori}
      />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

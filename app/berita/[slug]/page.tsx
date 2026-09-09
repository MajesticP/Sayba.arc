import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import {
  formatNewsDate,
  getCategoryColor,
  getCategoryLabel,
  parseArticleBody,
} from "@/lib/news-data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import { generateBreadcrumbSchema } from "@/lib/structured-data"
import { supabase } from "@/lib/supabase"
import type { Berita } from "@/lib/database.types"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

const FALLBACK_IMG = "/berita/berita-1-800x500.png"

/** Link Google Drive → proxy gambar lokal, sama seperti layanan/produk */
function gdriveToImg(url: string | null): string {
  if (!url) return FALLBACK_IMG
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

/** Jadikan URL relatif menjadi absolut untuk metadata & JSON-LD */
function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${siteConfig.url}${url}`
}

async function getArticle(slug: string): Promise<Berita | null> {
  const { data, error } = await supabase
    .from("berita")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle()

  if (error) console.error("Error fetching berita detail:", error)
  return data ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: `Berita — ${siteConfig.name}` }

  const url = `${siteConfig.url}/berita/${article.slug}`
  const image = absoluteUrl(article.og_image || article.image_url || FALLBACK_IMG)

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
      images: [{ url: image, alt: article.title }],
    },
  }
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const color = getCategoryColor(article.category)
  const heroImg = gdriveToImg(article.image_url)
  const blocks = parseArticleBody(article.body)

  // Artikel lain: kategori sama lebih dulu, lalu sisanya
  const { data: othersData } = await supabase
    .from("berita")
    .select("*")
    .eq("status", "active")
    .neq("slug", article.slug)
    .order("published_at", { ascending: false })
    .limit(12)

  const others: Berita[] = othersData ?? []
  const related = [
    ...others.filter((a) => a.category === article.category),
    ...others.filter((a) => a.category !== article.category),
  ].slice(0, 3)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: absoluteUrl(article.og_image || article.image_url || FALLBACK_IMG),
    datePublished: article.published_at,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` },
    },
    mainEntityOfPage: `${siteConfig.url}/berita/${article.slug}`,
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Beranda", url: siteConfig.url },
    { name: "Berita", url: `${siteConfig.url}/berita` },
    { name: article.title, url: `${siteConfig.url}/berita/${article.slug}` },
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Header navItems={navItems} />

      {/* Hero artikel */}
      <section className="relative bg-black overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/80 to-black/95" />

        <div className="relative z-10 pt-[88px] pb-10 md:pt-32 md:pb-20">
          <PageTransition>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-1.5 text-[11px] text-white/40 mb-5" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
                <span aria-hidden="true">/</span>
                <Link href="/berita" className="hover:text-white transition-colors">Berita</Link>
                <span aria-hidden="true">/</span>
                <span className="text-white/60 truncate">{getCategoryLabel(article.category)}</span>
              </nav>

              <span
                className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-3"
                style={{ backgroundColor: color }}
              >
                {getCategoryLabel(article.category)}
              </span>

              <h1 className="text-[22px] md:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight mb-3">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-white/55 text-[13px] md:text-lg leading-relaxed mb-6">{article.excerpt}</p>
              )}

              <div className="flex items-center flex-wrap gap-x-3 gap-y-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ff914d]/20 border border-[#ff914d]/30 flex items-center justify-center text-[#ff914d] text-[13px] font-black">
                    {article.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-[13px] font-semibold">{article.author}</div>
                    <div className="text-white/35 text-[11px]">{formatNewsDate(article.published_at)}</div>
                  </div>
                </div>
                <span className="text-white/30" aria-hidden="true">·</span>
                <span className="text-white/45 text-[11px]">{article.read_minutes} menit baca</span>
                <span className="text-white/30" aria-hidden="true">·</span>
                <span className="text-white/45 text-[11px]">{article.views.toLocaleString("id-ID")} dibaca</span>
              </div>
            </div>
          </PageTransition>
        </div>
      </section>

      {/* Isi artikel */}
      <article className="bg-white py-8 md:py-16 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <figure className="relative aspect-[16/9] rounded-xl md:rounded-2xl overflow-hidden border border-black/10 mb-7 md:mb-12 -mt-14 md:-mt-24 shadow-2xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
          </figure>

          <div className="space-y-4">
            {blocks.map((block, i) =>
              block.startsWith("## ") ? (
                <h2 key={i} className="text-[18px] md:text-2xl font-black text-black pt-3 leading-snug">
                  {block.slice(3)}
                </h2>
              ) : (
                <p key={i} className="text-black/65 text-[14px] md:text-base leading-[1.85] whitespace-pre-line">
                  {block}
                </p>
              ),
            )}
          </div>

          {article.tags?.length ? (
            <div className="flex flex-wrap gap-2 mt-8 pt-5 border-t border-black/8">
              {article.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-black/[0.04] border border-black/8 text-[11px] font-semibold text-black/50">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 rounded-xl md:rounded-2xl bg-black p-5 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff914d]" />
            <h3 className="text-[17px] md:text-xl font-black text-white mb-1.5">Punya kebutuhan serupa?</h3>
            <p className="text-white/50 text-[13px] leading-relaxed mb-4 max-w-lg">
              Ceritakan proyek Anda — tim kami akan bantu petakan langkah pertamanya tanpa biaya konsultasi awal.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff914d] text-white text-[13px] font-semibold hover:bg-[#e8823e] transition-colors"
            >
              Hubungi Kami
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>

      {/* Artikel terkait */}
      {related.length > 0 && (
        <section className="bg-[#f7f7f7] py-10 md:py-16 border-t border-black/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[19px] md:text-2xl font-black text-black">Artikel Lainnya</h2>
              <Link href="/berita" className="text-[13px] font-semibold text-black/50 hover:text-black transition-colors">
                Lihat semua
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group flex flex-col items-stretch justify-start rounded-xl md:rounded-2xl overflow-hidden border border-black/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative w-full aspect-[8/5] overflow-hidden bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gdriveToImg(item.image_url)}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow"
                      style={{ backgroundColor: getCategoryColor(item.category) }}
                    >
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[15px] font-black text-black leading-snug line-clamp-2 mb-1.5 group-hover:text-[#ff914d] transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-[11px] text-black/40">
                      {formatNewsDate(item.published_at)} · {item.read_minutes} mnt baca
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import FeatureTabs from "@/components/portfolio-feature-tabs"
import { ArrowLeft, ExternalLink, Globe, Map, ChevronRight } from "lucide-react"
import { generatePortfolioDetailMetadata, generatePortfolioSchema, generateBreadcrumbSchema } from "@/lib/structured-data"

function resolveThumbnail(url: string | null): string | null {
  return !url || url === "-" ? null : url
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from("portfolio")
    .select("title, description, meta_title, meta_description, meta_keywords, image_url, og_image, canonical_url")
    .eq("slug", slug)
    .single()

  if (!data) return { title: `Portofolio — ${siteConfig.name}` }

  const meta = generatePortfolioDetailMetadata({
    title: data.meta_title || `${data.title} — ${siteConfig.name}`,
    description: data.meta_description || data.description || siteConfig.description,
    slug,
    portfolioTitle: data.title,
    keywords: data.meta_keywords ?? undefined,
    ogImage: data.og_image || data.image_url || undefined,
    canonicalUrl: data.canonical_url || undefined,
  })

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
    twitter: meta.twitter,
  }
}

export default async function PortfolioSlugPage({ params }: Props) {
  const { slug } = await params
  const { data: item, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (error || !item) notFound()

  const portfolioSchema = generatePortfolioSchema({
    name: item.title,
    description: item.description ?? siteConfig.description,
    url: `${siteConfig.url}/portfolio/${slug}`,
    image: (item as any).og_image || item.image_url || undefined,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Beranda", url: siteConfig.url },
    { name: "Portofolio", url: `${siteConfig.url}/portfolio` },
    { name: item.title, url: `${siteConfig.url}/portfolio/${slug}` },
  ])

  const thumbnail = resolveThumbnail(item.image_url)
  const isArcgis = item.dept === "arcgis"
  const accent = isArcgis ? "#ff914d" : "#1a1a1a"
  const features: string[] = item.features ?? []
  const techStack: string[] = item.tech_stack ?? []

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header navItems={navItems} />

      <div className="flex-1 pt-[72px] md:pt-20">
        {/* Breadcrumb */}
        <div className="border-b border-black/6 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center gap-1.5 text-sm text-black/40">
              <Link href="/" className="hover:text-black transition-colors">Beranda</Link>
              <ChevronRight size={13} />
              <Link href="/portfolio" className="hover:text-black transition-colors">Portofolio</Link>
              <ChevronRight size={13} />
              <span className="text-black/70 font-medium truncate max-w-[200px]">{item.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section - two column */}
        <section className="py-10 md:py-20">
          <PageTransition>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                {/* Left: Content */}
                <div>
                  <div
                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    {isArcgis
                      ? <Map size={20} style={{ color: accent }} />
                      : <Globe size={20} style={{ color: accent }} />
                    }
                  </div>

                  <h1 className="text-2xl md:text-4xl font-bold text-black mb-1.5 md:mb-2 leading-tight">
                    {item.title}
                  </h1>

                  {item.category && (
                    <p className="text-sm font-semibold mb-3 md:mb-5" style={{ color: accent }}>
                      {item.category}
                    </p>
                  )}

                  <p className="text-black/55 text-sm md:text-base leading-relaxed mb-5 md:mb-8">
                    {item.description ?? "Detail proyek tidak tersedia."}
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
                    {item.result_url && item.result_url !== "-" && (
                      <a
                        href={item.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 hover:scale-105 hover:shadow-lg"
                        style={{ backgroundColor: accent }}
                      >
                        Lihat Hasil Proyek
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl font-semibold border-2 border-black/10 text-black/70 text-sm hover:border-black hover:text-black transition-all duration-200"
                    >
                      Diskusikan Proyek Serupa
                    </Link>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <Link
                      href="/portfolio"
                      className="inline-flex items-center gap-2 text-xs text-black/30 hover:text-black transition-colors group"
                    >
                      <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                      Kembali ke Portofolio
                    </Link>
                  </div>
                </div>

                {/* Right: Thumbnail */}
                <div className="order-first lg:order-last">
                  <div
                    className="relative w-full rounded-2xl overflow-hidden"
                    style={{
                      aspectRatio: "16/9",
                      border: `2px solid ${accent}`,
                      boxShadow: `0 24px 64px ${accent}22`
                    }}
                  >
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center gap-3"
                        style={{ backgroundColor: `${accent}08` }}
                      >
                        {isArcgis
                          ? <Map size={40} style={{ color: accent, opacity: 0.25 }} />
                          : <Globe size={40} style={{ color: accent, opacity: 0.25 }} />
                        }
                        <span className="text-sm text-black/25">Belum ada gambar</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </PageTransition>
        </section>

        {/* Feature + Tech Tabs */}
        {(features.length > 0 || techStack.length > 0) && (
          <section className="pb-12 md:pb-20">
            <PageTransition delay={150}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <FeatureTabs features={features} techStack={techStack} accent={accent} />
              </div>
            </PageTransition>
          </section>
        )}
      </div>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

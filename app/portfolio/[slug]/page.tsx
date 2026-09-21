import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import FeatureTabs from "@/components/portfolio-feature-tabs"
import ThreeCard from "@/components/three-card"
import { ArrowLeft, ExternalLink, Globe, Map, ChevronRight } from "lucide-react"
import { generatePortfolioDetailMetadata, generatePortfolioSchema, generateBreadcrumbSchema } from "@/lib/structured-data"
import ThreeParticlesBg from "@/components/three-particles-bg"

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
  const accent = isArcgis ? "#ea580c" : "#ea580c"
  const features: string[] = item.features ?? []
  const techStack: string[] = item.tech_stack ?? []

  return (
    <main className="min-h-screen flex flex-col bg-black">
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
        <div className="border-b border-white/8 bg-black/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center gap-1.5 text-sm text-white/40">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <ChevronRight size={13} />
              <Link href="/portfolio" className="hover:text-white transition-colors">Portofolio</Link>
              <ChevronRight size={13} />
              <span className="text-white/60 font-medium truncate max-w-[200px]">{item.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section - two column with 3D card */}
        <section className="py-10 md:py-20 relative overflow-hidden">
          {/* 3D background particles */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <ThreeParticlesBg />
          </div>
          <PageTransition>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                {/* Left: Content */}
                <div>
                  <div
                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6"
                    style={{ backgroundColor: `${accent}20` }}
                  >
                    {isArcgis
                      ? <Map size={20} style={{ color: accent }} />
                      : <Globe size={20} style={{ color: accent }} />
                    }
                  </div>

                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-1.5 md:mb-2 leading-tight">
                    {item.title}
                  </h1>

                  {item.category && (
                    <p className="text-sm font-semibold mb-3 md:mb-5" style={{ color: accent }}>
                      {item.category}
                    </p>
                  )}

                  <p className="text-white/50 text-sm md:text-base leading-relaxed mb-5 md:mb-8">
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
                      className="inline-flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3.5 rounded-xl font-semibold border-2 border-white/15 text-white/70 text-sm hover:border-white/40 hover:text-white transition-all duration-200"
                    >
                      Diskusikan Proyek Serupa
                    </Link>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <Link
                      href="/portfolio"
                      className="inline-flex items-center gap-2 text-xs text-white/25 hover:text-white transition-colors group"
                    >
                      <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
                      Kembali ke Portofolio
                    </Link>
                  </div>
                </div>

                {/* Right: 3D Card instead of static image */}
                <div className="order-first lg:order-last">
                  <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <ThreeCard color={accent} height={320} className="w-full h-full" />
                    {/* Overlay with project info */}
                    <div className="absolute inset-0 flex flex-col items-end justify-end p-4 md:p-6 pointer-events-none">
                      <div className="text-right">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: accent }}>
                          {isArcgis ? "ARCGIS" : "IT KONSULTING"}
                        </span>
                        {item.category && (
                          <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </PageTransition>
        </section>

        {/* Feature + Tech Tabs */}
        {(features.length > 0 || techStack.length > 0) && (
          <section className="pb-12 md:pb-20 relative">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#ea580c] opacity-[0.05] blur-3xl rounded-full" />
            </div>
            <PageTransition delay={150}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
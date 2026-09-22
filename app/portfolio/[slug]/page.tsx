import type { Metadata } from "next"
import { isGambarContoh } from "@/lib/image-path"
import { BoardSection } from "@/components/cutting-board-bg"
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
import { generatePortfolioSchema, generateBreadcrumbSchema } from "@/lib/structured-data"
import { buildSeoMetadata } from "@/lib/seo"

function resolveThumbnail(url: string | null): string | null {
  // Path gambar contoh dari versi lama diperlakukan sebagai "belum ada gambar",
  // karena berkasnya sudah dihapus dari /public.
  if (!url || url === "-" || isGambarContoh(url)) return null
  return url
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from("portfolio")
    .select("title, description, meta_title, meta_description, meta_keywords, image_url, og_image, canonical_url")
    .eq("slug", slug)
    .single()

  if (!data) return { title: `Portofolio: ${siteConfig.name}` }

  return buildSeoMetadata({
    title: data.title,
    metaTitle: data.meta_title,
    description: data.description,
    metaDescription: data.meta_description,
    metaKeywords: data.meta_keywords,
    image: resolveThumbnail(data.og_image) || resolveThumbnail(data.image_url),
    path: `/portfolio/${slug}`,
    canonicalUrl: data.canonical_url,
    type: "article",
  })
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
  // Warna departemen dipakai sebagai FILL dan garis saja. Sebagai teks di
  // latar terang ia bisa gagal kontras (orange 2.79:1), jadi teks selalu
  // memakai warna palet yang aman. Dept lama 'arcgis' tidak dipakai lagi;
  // dua departemen yang berlaku adalah it_konsulting dan engineering_konsulting.
  const isEngineering = item.dept === "engineering_konsulting"
  const accent = isEngineering ? "#f07a26" : "#112a46"
  const features: string[] = item.features ?? []
  const techStack: string[] = item.tech_stack ?? []

  return (
    <main className="board-area min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header navItems={navItems} />

      <div className="flex-1">
        {/* Breadcrumb: panel tipis tersendiri, jadi ia juga bagian dari
            tumpukan lembar, bukan bilah yang menempel di tepi layar. */}
        <BoardSection id="breadcrumb" className="pb-0" panelClassName="py-3">
          <div className="panel-pad pt-0">
            <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-brand flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-navy transition-colors">Beranda</Link>
              <ChevronRight size={13} />
              <Link href="/portfolio" className="hover:text-navy transition-colors">Portofolio</Link>
              <ChevronRight size={13} />
              <span className="text-navy font-semibold truncate max-w-[200px]">{item.title}</span>
            </nav>
          </div>
        </BoardSection>

        {/* Hero Section - two column */}
        <BoardSection id="hero-proyek" panelClassName="panel-top-pad">
          <PageTransition>
            <div className="panel-pad">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                {/* Left: Content */}
                <div>
                  <div
                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    {isEngineering
                      ? <Map size={20} style={{ color: "#b45610" }} />
                      : <Globe size={20} style={{ color: accent }} />
                    }
                  </div>

                  <h1 className="text-[24px] md:text-[36px] font-bold text-navy mb-1.5 md:mb-2 leading-tight">
                    {item.title}
                  </h1>

                  {item.category && (
                    <span
                      className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full text-navy mb-3 md:mb-5"
                      style={{ backgroundColor: `${accent}1f`, boxShadow: `inset 0 0 0 1.5px ${accent}` }}
                    >
                      {item.category}
                    </span>
                  )}

                  <p className="text-slate-brand text-[14px] md:text-[15px] leading-relaxed mb-5 md:mb-8">
                    {item.description ?? "Detail proyek tidak tersedia."}
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
                    {item.result_url && item.result_url !== "-" && (
                      <a
                        href={item.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn-solid ${isEngineering ? "" : "!bg-navy !text-ice hover:!bg-navy-700"}`}
                      >
                        Lihat Hasil Proyek
                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                    )}
                    <Link href="/contact" className="btn-quiet">
                      Diskusikan Proyek Serupa
                    </Link>
                  </div>

                  <div className="mt-4 md:mt-6">
                    <Link
                      href="/portfolio"
                      className="inline-flex items-center gap-2 text-[12.5px] text-slate-brand hover:text-navy transition-colors group"
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
                        {isEngineering
                          ? <Map size={40} style={{ color: "#b45610", opacity: 0.35 }} />
                          : <Globe size={40} style={{ color: accent, opacity: 0.25 }} />
                        }
                        <span className="text-[13px] text-slate-brand">Belum ada gambar</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </PageTransition>
        </BoardSection>

        {/* Feature + Tech Tabs */}
        {(features.length > 0 || techStack.length > 0) && (
          <BoardSection id="detail-proyek" panelClassName="panel-top-pad">
            <PageTransition delay={150}>
              <div className="panel-pad">
                <FeatureTabs features={features} techStack={techStack} accent={accent} />
              </div>
            </PageTransition>
          </BoardSection>
        )}
      </div>

      <div className="h-4 md:h-6" aria-hidden="true" />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

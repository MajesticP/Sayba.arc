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

function convertDriveUrl(url: string | null): string | null {
  if (!url || url === "-") return null
  if (url.includes("drive.google.com")) {
    const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (match1) return `https://lh3.googleusercontent.com/d/${match1[1]}`
    const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (match2) return `https://lh3.googleusercontent.com/d/${match2[1]}`
  }
  return url
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from("portfolio")
    .select("title, description")
    .eq("slug", slug)
    .single()
  if (!data) return { title: `Portofolio — ${siteConfig.name}` }
  return {
    title: `${data.title} — ${siteConfig.name}`,
    description: data.description ?? undefined,
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

  const thumbnail = convertDriveUrl(item.image_url)
  const isArcgis = item.dept === "arcgis"
  const accent = isArcgis ? "#ff914d" : "#1a1a1a"
  const features: string[] = item.features ?? []
  const techStack: string[] = item.tech_stack ?? []

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      <div className="flex-1">
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
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    {isArcgis
                      ? <Map size={26} style={{ color: accent }} />
                      : <Globe size={26} style={{ color: accent }} />
                    }
                  </div>

                  <h1 className="text-xl md:text-4xl font-bold text-black mb-2 leading-tight">
                    {item.title}
                  </h1>

                  {item.category && (
                    <p className="text-base font-semibold mb-5" style={{ color: accent }}>
                      {item.category}
                    </p>
                  )}

                  <p className="text-black/55 text-base leading-relaxed mb-8">
                    {item.description ?? "Detail proyek tidak tersedia."}
                  </p>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    {item.result_url && item.result_url !== "-" && (
                      <a
                        href={item.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105 hover:shadow-lg"
                        style={{ backgroundColor: accent }}
                      >
                        Lihat Hasil Proyek
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border-2 border-black/10 text-black/70 hover:border-black hover:text-black transition-all duration-200"
                    >
                      Diskusikan Proyek Serupa
                    </Link>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/portfolio"
                      className="inline-flex items-center gap-2 text-sm text-black/30 hover:text-black transition-colors group"
                    >
                      <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
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

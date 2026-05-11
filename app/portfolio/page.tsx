import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import { supabase } from "@/lib/supabase"
import type { Portfolio } from "@/lib/database.types"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: `Portofolio — ${siteConfig.name}`,
  description: "Portofolio proyek GIS dan IT dari SAYBA ARC.",
}

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

export default async function PortfolioPage() {
  const { data: portfolioItems, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching portfolio:", error)
  }

  const items: Portfolio[] = portfolioItems ?? []

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      <section className="bg-black py-12 md:py-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3 md:mb-4">Karya Kami</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">Portofolio</h1>
            <p className="text-white/45 text-base md:text-lg max-w-xl mx-auto">Proyek-proyek pilihan dari Departemen ArcGIS dan Departemen IT kami.</p>
          </div>
        </PageTransition>
      </section>

      <section className="py-12 md:py-20 bg-white flex-1">
        <PageTransition delay={100}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {items.length === 0 ? (
              <p className="text-center text-black/40">Belum ada portofolio yang tersedia.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6">
                {items.map((item) => {
                  const thumbnail = convertDriveUrl(item.image_url)
                  const isArcgis = item.dept === "arcgis"
                  return (
                    <Link
                      key={item.id}
                      href={`/portfolio/${item.slug}`}
                      className={`group rounded-xl md:rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden flex flex-col ${
                        isArcgis
                          ? "border-black/8 hover:border-[#ff914d]/30 hover:shadow-orange-50"
                          : "border-black/8 hover:border-black/20 hover:shadow-black/5"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-video overflow-hidden bg-black/5">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isArcgis ? "bg-[#ff914d]/8" : "bg-black/5"}`}>
                            <span className="text-3xl opacity-20">{isArcgis ? "🗺️" : "💻"}</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                            isArcgis ? "bg-[#ff914d]/90 text-white" : "bg-black/80 text-white"
                          }`}>{item.dept.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-3 md:p-6 flex flex-col flex-1">
                        {item.category && (
                          <span className={`hidden md:inline-flex text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3 ${
                            isArcgis ? "bg-[#ff914d]/10 text-[#ff914d]" : "bg-black/8 text-black/50"
                          }`}>{item.category}</span>
                        )}
                        <h3 className="text-xs md:text-lg font-bold text-black mb-1 md:mb-2 leading-snug line-clamp-2">{item.title}</h3>
                        {item.description && (
                          <p className="hidden md:block text-black/50 text-sm leading-relaxed flex-1 line-clamp-3">{item.description}</p>
                        )}
                        <div className={`mt-2 md:mt-4 flex items-center gap-1 text-xs font-semibold transition-colors duration-200 ${
                          isArcgis ? "text-[#ff914d]" : "text-black"
                        }`}>
                          Lihat Detail
                          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </div>

                      <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${isArcgis ? "bg-[#ff914d]" : "bg-black"}`} />
                    </Link>
                  )
                })}
              </div>
            )}

            <div className="mt-10 md:mt-16 text-center">
              <p className="text-black/40 mb-4">Tertarik dengan proyek serupa?</p>
              <Link href="/contact" className="inline-block px-8 py-3.5 rounded-xl font-semibold bg-black text-white hover:bg-[#ff914d] transition-all duration-200 hover:scale-105">
                Diskusikan Proyek Anda
              </Link>
            </div>
          </div>
        </PageTransition>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

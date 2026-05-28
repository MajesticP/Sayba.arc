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

interface DeptConfig {
  value: string
  label: string
  color: string
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

/** Convert a hex color to rgba with the given opacity (0–1) */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default async function PortfolioPage() {
  // Fetch portfolio items and dept configs in parallel
  const [{ data: portfolioItems, error }, { data: deptRows }] = await Promise.all([
    supabase
      .from("portfolio")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("layanan_depts")
      .select("value, label, color, badge_class")
      .order("sort_order", { ascending: true }),
  ])

  if (error) {
    console.error("Error fetching portfolio:", error)
  }

  const items: Portfolio[] = portfolioItems ?? []

  // Build a lookup map: dept slug → DeptConfig
  const deptMap = new Map<string, DeptConfig>()
  for (const row of deptRows ?? []) {
    deptMap.set(row.value, {
      value: row.value,
      label: row.label,
      color: row.color ?? "#000000",
    })
  }

  const fallback: DeptConfig = { value: "unknown", label: "DEPT", color: "#000000" }

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
                  const dept = deptMap.get(item.dept) ?? fallback
                  const color = dept.color

                  return (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      thumbnail={thumbnail}
                      dept={dept}
                      color={color}
                      hexToRgba={hexToRgba}
                    />
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

// Client-friendly card — hover effects via CSS custom properties
function PortfolioCard({
  item,
  thumbnail,
  dept,
  color,
  hexToRgba,
}: {
  item: Portfolio
  thumbnail: string | null
  dept: DeptConfig
  color: string
  hexToRgba: (hex: string, alpha: number) => string
}) {
  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="portfolio-card group rounded-xl md:rounded-2xl border border-black/8 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden flex flex-col"
      style={{ "--dept-color": color, "--dept-color-30": hexToRgba(color, 0.3), "--dept-color-08": hexToRgba(color, 0.08) } as React.CSSProperties}
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
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: hexToRgba(color, 0.08) }}
          >
            <span className="text-3xl opacity-20">🗂️</span>
          </div>
        )}
        {/* Dept badge top-left */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm text-white"
            style={{ backgroundColor: hexToRgba(color, 0.9) }}
          >
            {dept.label.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 md:p-6 flex flex-col flex-1">
        {item.category && (
          <span
            className="hidden md:inline-flex text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3"
            style={{ backgroundColor: hexToRgba(color, 0.1), color }}
          >
            {item.category}
          </span>
        )}
        <h3 className="text-xs md:text-lg font-bold text-black mb-1 md:mb-2 leading-snug line-clamp-2">{item.title}</h3>
        {item.description && (
          <p className="hidden md:block text-black/50 text-sm leading-relaxed flex-1 line-clamp-3">{item.description}</p>
        )}
        <div className="mt-2 md:mt-4 flex items-center gap-1 text-xs font-semibold transition-colors duration-200" style={{ color }}>
          Lihat Detail
          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Bottom hover bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: color }}
      />
    </Link>
  )
}

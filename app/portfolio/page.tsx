import type { Metadata } from "next"
import Link from "next/link"
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

interface DeptConfig { value: string; label: string; color: string }

function convertDriveUrl(url: string | null): string | null {
  if (!url || url === "-") return null
  if (url.startsWith("/api/gdrive-img")) return url
  const match1 = url.match(/\/file\/d\/([\w-]+)/)
  if (match1) return `/api/gdrive-img?id=${match1[1]}`
  const match2 = url.match(/[?&]id=([\w-]+)/)
  if (match2) return `/api/gdrive-img?id=${match2[1]}`
  return url
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default async function PortfolioPage() {
  const [{ data: portfolioItems, error }, { data: deptRows }] = await Promise.all([
    supabase.from("portfolio").select("*").eq("status", "active").order("created_at", { ascending: false }),
    supabase.from("layanan_depts").select("value, label, color, badge_class").order("sort_order", { ascending: true }),
  ])
  if (error) console.error("Error fetching portfolio:", error)
  const items: Portfolio[] = portfolioItems ?? []

  const deptMap = new Map<string, DeptConfig>()
  for (const row of deptRows ?? []) {
    deptMap.set(row.value, { value: row.value, label: row.label, color: row.color ?? "#000000" })
  }
  const fallback: DeptConfig = { value: "unknown", label: "DEPT", color: "#000000" }

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />

      {/* Hero */}
      <section className="bg-black py-8 md:py-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-[10px] font-bold text-[#ff914d] uppercase tracking-widest mb-2">Karya Kami</span>
            <h1 className="text-[22px] md:text-5xl font-bold text-white mb-2">Portofolio</h1>
            <p className="text-white/45 text-[13px] md:text-lg max-w-xl mx-auto">
              Hasil kerja nyata dari berbagai proyek yang telah kami selesaikan untuk klien.
            </p>
          </div>
        </PageTransition>
      </section>

      {/* Grid */}
      <section className="py-6 md:py-20 bg-white flex-1">
        <PageTransition delay={100}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            {items.length === 0 ? (
              <p className="text-center text-black/40 py-16">Belum ada portofolio yang tersedia.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {items.map((item) => {
                  const thumbnail = convertDriveUrl(item.image_url)
                  const dept = deptMap.get(item.dept) ?? fallback
                  return (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      thumbnail={thumbnail}
                      dept={dept}
                      hexToRgba={hexToRgba}
                    />
                  )
                })}
              </div>
            )}

            <div className="mt-8 md:mt-16 text-center">
              <p className="text-black/40 text-[12px] mb-3">Tertarik dengan proyek serupa?</p>
              <Link
                href="/contact"
                className="inline-block px-7 py-2.5 rounded-xl font-semibold bg-black text-white hover:bg-[#ff914d] transition-all duration-200 hover:scale-105 text-[13px]"
              >
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

function PortfolioCard({ item, thumbnail, dept, hexToRgba }: {
  item: Portfolio
  thumbnail: string | null
  dept: DeptConfig
  hexToRgba: (hex: string, alpha: number) => string
}) {
  const color = dept.color

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="portfolio-card group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden rounded-xl border border-black/8 w-full flex flex-col"
      style={{
        "--dept-color": color,
        "--dept-color-30": hexToRgba(color, 0.3),
        "--dept-color-08": hexToRgba(color, 0.08),
      } as React.CSSProperties}
    >
      {/* Thumbnail — hard-capped height */}
      <div
        className="relative w-full bg-black/5 overflow-hidden leading-[0]" style={{ height: "180px" }}
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={item.title}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105 block"
            style={{ height: "100%" }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: hexToRgba(color, 0.08) }}
          >
            <span className="text-3xl opacity-20">🗂️</span>
          </div>
        )}

        {/* Dept badge */}
        <div className="absolute top-2 left-2">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white backdrop-blur-sm"
            style={{ backgroundColor: hexToRgba(color, 0.88) }}
          >
            {dept.label.toUpperCase()}
          </span>
        </div>

        {/* Bottom color bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />
      </div>

      {/* Content — hard-capped at remaining 130px, clipped */}
      <div
        className="flex flex-col p-4 flex-1"
      >
        {item.category && (
          <span
            className="inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit mb-1 flex-shrink-0"
            style={{ backgroundColor: hexToRgba(color, 0.1), color }}
          >
            {item.category}
          </span>
        )}

        <h3 className="text-[14px] font-bold text-black mb-1.5 leading-snug line-clamp-2 flex-shrink-0">
          {item.title}
        </h3>

        {item.description && (
          <p
            className="text-black/50 text-[12px] leading-relaxed line-clamp-3"
          >
            {item.description}
          </p>
        )}

        <div
          className="mt-auto flex items-center gap-1 text-[10px] font-semibold flex-shrink-0 pt-1"
          style={{ color }}
        >
          Lihat Detail
          <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

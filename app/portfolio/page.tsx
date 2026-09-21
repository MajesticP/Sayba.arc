import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import PageTransition from "@/components/page-transition"
import { supabase } from "@/lib/supabase"
import type { Portfolio } from "@/lib/database.types"
import ThreeCard from "@/components/three-card"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: `Portofolio — ${siteConfig.name}`,
  description: "Portofolio proyek GIS dan IT dari SAYBA ARC.",
  alternates: { canonical: `${siteConfig.url}/portfolio` },
  openGraph: {
    title: `Portofolio — ${siteConfig.name}`,
    description: "Portofolio proyek GIS dan IT dari SAYBA ARC.",
    url: `${siteConfig.url}/portfolio`,
    type: "website",
    images: [ogImage],
  },
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

export const revalidate = 60

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
      <PageHero
        eyebrow="Karya Kami"
        title="Portofolio"
        subtitle="Hasil kerja nyata dari berbagai proyek yang telah kami selesaikan untuk klien."
      />
      <section className="py-6 md:py-20 bg-[#0a0a0a] flex-1">
        <PageTransition delay={100}>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            {items.length === 0 ? (
              <p className="text-center text-white/30 py-16">Belum ada portofolio yang tersedia.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {items.map((item) => {
                  const dept = deptMap.get(item.dept) ?? fallback
                  return (
                    <PortfolioCard3D
                      key={item.id}
                      item={item}
                      dept={dept}
                    />
                  )
                })}
              </div>
            )}
            <div className="mt-8 md:mt-16 text-center">
              <p className="text-white/30 text-[12px] mb-3">Tertarik dengan proyek serupa?</p>
              <Link
                href="/contact"
                className="inline-block px-7 py-2.5 rounded-xl font-semibold bg-[#ea580c] text-white hover:bg-[#c2410c] transition-all duration-200 hover:scale-105 text-[13px]"
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

function PortfolioCard3D({ item, dept }: { item: Portfolio; dept: DeptConfig }) {
  const color = dept.color

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden rounded-xl border border-white/10 w-full flex flex-col bg-white/[0.03] hover:bg-white/[0.06]"
    >
      <ThreeCard color={color} height={200} className="w-full rounded-none" />
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {dept.label.toUpperCase()}
          </span>
          {item.category && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {item.category}
            </span>
          )}
        </div>
        <h3 className="text-[14px] font-bold text-white mb-1.5 leading-snug line-clamp-2">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-white/40 text-[12px] leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-1 text-[10px] font-semibold pt-2" style={{ color }}>
          Lihat Detail
          <ArrowRight size={10} className="transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
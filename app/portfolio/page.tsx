import type { Metadata } from "next"
import { isGambarContoh } from "@/lib/image-path"
import Link from "next/link"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import PageTransition from "@/components/page-transition"
import { supabase } from "@/lib/supabase"
import type { Portfolio } from "@/lib/database.types"
import { ArrowRight } from "lucide-react"
import { getDepts } from "@/lib/layanan-config"
import { BoardSection } from "@/components/cutting-board-bg"
import TiltCard from "@/components/tilt-card"

export const metadata: Metadata = {
  title: `Portofolio: ${siteConfig.name}`,
  description: "Portofolio proyek GIS dan IT dari SAYBA ARC.",
  alternates: { canonical: `${siteConfig.url}/portfolio` },
  openGraph: {
    title: `Portofolio: ${siteConfig.name}`,
    description: "Portofolio proyek GIS dan IT dari SAYBA ARC.",
    url: `${siteConfig.url}/portfolio`,
    type: "website",
    images: [ogImage],
  },
}

interface DeptConfig { value: string; label: string; color: string }

function convertDriveUrl(url: string | null): string | null {
  if (!url || url === "-" || isGambarContoh(url)) return null
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
  const [{ data: portfolioItems, error }, deptRows] = await Promise.all([
    supabase.from("portfolio").select("*").eq("status", "active").order("created_at", { ascending: false }),
    getDepts(),
  ])
  if (error) console.error("Error fetching portfolio:", error)
  const items: Portfolio[] = portfolioItems ?? []

  // Departemen dibaca dari tabel `layanan_depts` lewat helper getDepts(),
  // jadi departemen yang ditambah dari admin langsung tampil di sini.
  const deptMap = new Map<string, DeptConfig>()
  for (const row of deptRows) {
    deptMap.set(row.value, { value: row.value, label: row.label, color: row.color ?? "#000000" })
  }
  const fallback: DeptConfig = { value: "unknown", label: "DEPT", color: "#000000" }

  return (
    <main className="board-area min-h-screen flex flex-col">
      <Header navItems={navItems} />

      {/* Hero */}
      <PageHero
        eyebrow="Karya Kami"
        title="Portofolio"
        subtitle="Hasil kerja nyata dari berbagai proyek yang telah kami selesaikan untuk klien."
      />

      {/* Grid */}
      <BoardSection id="portofolio" panelClassName="panel-top-pad">
        <PageTransition delay={100}>
          <div className="panel-pad">
            {items.length === 0 ? (
              /* Keadaan kosong yang jujur: sebutkan sebabnya dan beri satu
                 tindakan, bukan sekadar "belum ada data". */
              <div className="text-center py-14 md:py-20 max-w-md mx-auto">
                <p className="text-navy font-bold text-[16px] md:text-[18px] mb-2">
                  Portofolio sedang disiapkan
                </p>
                <p className="text-slate-brand text-[13.5px] leading-relaxed mb-6">
                  Katalog proyek belum kami tampilkan di sini. Sementara itu, Anda bisa
                  melihat lingkup pekerjaan kami atau langsung menanyakan proyek serupa.
                </p>
                <div className="btn-row justify-center">
                  <Link href="/services" className="btn-solid">Lihat layanan</Link>
                  <Link href="/contact" className="btn-quiet">Tanya proyek serupa</Link>
                </div>
              </div>
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

            <div className="mt-8 md:mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-ice-line">
              <p className="text-slate-brand text-[13.5px] text-center sm:text-left leading-relaxed">
                Tertarik dengan proyek serupa?
              </p>
              <Link href="/contact" className="btn-solid w-full sm:w-auto shrink-0">
                Diskusikan Proyek Anda
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </PageTransition>
      </BoardSection>

      <div className="h-4 md:h-6" aria-hidden="true" />
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
    // Efek kartu disamakan dengan kartu Layanan, Informasi, dan Berita:
    // sorot kursor (.kartu-sorot) plus kemiringan mengikuti kursor (TiltCard).
    <TiltCard max={4} lift={3} className="w-full">
      <Link
        href={`/portfolio/${item.slug}`}
        className="portfolio-card kartu-sorot kartu-angkat group transition-all duration-300 overflow-hidden rounded-2xl border border-ice-line bg-white w-full flex flex-col"
        style={{
          "--dept-color": color,
          "--dept-color-30": hexToRgba(color, 0.3),
          "--dept-color-08": hexToRgba(color, 0.08),
        } as React.CSSProperties}
      >
        {/* Thumbnail: hard-capped height */}
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
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-brand">
                {dept.label}
              </span>
            </div>
          )}

          {/* Dept badge */}
          <div className="absolute top-2.5 left-2.5">
            {/* Label departemen: warna dept jadi garis tepi saja, teksnya navy
                di atas bidang putih supaya selalu lolos kontras apa pun warna
                departemennya. */}
            <span
              className="inline-flex items-center text-[10.5px] font-bold px-2.5 py-1 rounded-full text-navy"
              style={{ backgroundColor: "rgba(255,255,255,0.94)", boxShadow: `inset 0 0 0 1.5px ${color}` }}
            >
              {dept.label}
            </span>
          </div>

          {/* Bottom color bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />
        </div>

        {/* Content: hard-capped at remaining 130px, clipped */}
        <div
          className="flex flex-col p-4 flex-1"
        >
          {item.category && (
            <span
              className="inline-flex text-[10.5px] font-bold px-2.5 py-1 rounded-full w-fit mb-2 flex-shrink-0 text-navy"
              style={{ backgroundColor: hexToRgba(color, 0.14) }}
            >
              {item.category}
            </span>
          )}

          <h3 className="text-[14.5px] font-bold text-navy mb-1.5 leading-snug line-clamp-2 flex-shrink-0">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-slate-brand text-[12.5px] leading-relaxed line-clamp-3">
              {item.description}
            </p>
          )}

          {/* Tautan detail: teks selalu navy, warna dept hanya pada ikon. */}
          <div className="mt-auto flex items-center gap-1 text-[11.5px] font-bold text-navy flex-shrink-0 pt-3">
            Lihat Detail
            <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" style={{ color }} />
          </div>
        </div>
      </Link>
    </TiltCard>
  )
}

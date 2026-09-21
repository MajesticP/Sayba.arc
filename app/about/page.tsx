import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig, aboutPage, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageHero from "@/components/page-hero"
import PageTransition from "@/components/page-transition"
import TeamSection, { type TimMember } from "@/components/team-section"
import { BoardSection } from "@/components/cutting-board-bg"

export const metadata: Metadata = {
  title: `Tentang Kami: ${siteConfig.name}`,
  description: aboutPage.hero.subtitle,
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: `Tentang Kami: ${siteConfig.name}`,
    description: aboutPage.hero.subtitle,
    url: `${siteConfig.url}/about`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

async function getTeam(): Promise<TimMember[]> {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    const { data, error } = await supabase
      .from("tim")
      .select("id, name, role, bio, photo_url, github_url, linkedin_url, instagram_url, order_num, status")
      .eq("status", "active")
      .order("order_num", { ascending: true })
    if (error || !data?.length) return []
    return data as TimMember[]
  } catch { return [] }
}

export default async function AboutPage() {
  const team = await getTeam()
  const hasTeam = team.length > 0

  return (
    <main className="board-area min-h-screen flex flex-col">
      <Header navItems={navItems} />

      {/* Hero */}
      <PageHero
        image="/banners/about-1920x600.webp"
        imageMobile="/banners/about-mobile-900x450.webp"
        eyebrow="Siapa Kami"
        title={aboutPage.hero.title}
        subtitle={aboutPage.hero.subtitle}
      />

      {/* Misi & Visi */}
      <BoardSection id="misi-visi" panelClassName="panel-top-pad">
        <div className="px-5 sm:px-7 lg:px-10 pb-7 md:pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-2xl p-5 md:p-8 border border-ice-line">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-ice-dim flex items-center justify-center mb-3 md:mb-5">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-slate-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-[15px] md:text-xl font-bold text-navy mb-1.5 md:mb-3">Misi Kami</h2>
              <p className="text-slate-brand leading-relaxed text-[13px] md:text-[15.5px]">{aboutPage.mission}</p>
            </div>
            <div className="bg-navy rounded-2xl p-5 md:p-8">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-orange/20 flex items-center justify-center mb-3 md:mb-5">
                <svg className="w-4 h-4 md:w-6 md:h-6 text-ice" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-[15px] md:text-xl font-bold text-ice mb-1.5 md:mb-3">Visi Kami</h2>
              <p className="text-orange-soft leading-relaxed text-[13px] md:text-[15px]">{aboutPage.vision}</p>
            </div>
          </div>
        </div>
      </BoardSection>

      {/* Tim: hanya tampil kalau ada anggota aktif.
          Kalau kosong, section disembunyikan sepenuhnya; instruksi internal
          tidak pernah muncul di halaman publik. */}
      {hasTeam && (
        <BoardSection id="tim" panelClassName="panel-top-pad">
          <div className="px-5 sm:px-7 lg:px-10 pb-7 md:pb-12">
            <PageTransition delay={100}>
              <div className="text-center mb-5 md:mb-14">
                <span className="text-[10px] font-bold text-slate-brand uppercase tracking-widest mb-1 block">Tim Kami</span>
                <h2 className="text-[20px] md:text-3xl font-bold text-navy mb-1 md:mb-3">Kenali Tim SAYBA ARC</h2>
                <p className="text-slate-brand text-[12px] md:text-base">Para ahli di balik setiap proyek yang kami kerjakan</p>
              </div>
            </PageTransition>
            <TeamSection team={team} />
          </div>
        </BoardSection>
      )}

      {/* CTA: panel terang. Footer tepat di bawahnya navy, dan permukaan
          terang inilah yang memisahkan keduanya supaya tinggi footer terbaca
          apa adanya, bukan menyatu jadi satu bidang biru panjang. */}
      <BoardSection id="cta" panelClassName="panel-top-pad">
        <PageTransition delay={200}>
          <div className="px-5 sm:px-8 lg:px-12 pb-8 md:pb-14 text-center max-w-2xl mx-auto">
            <h2 className="text-[21px] md:text-[32px] font-bold text-navy mb-2.5 md:mb-3.5 leading-tight">Siap Berkolaborasi?</h2>
            <p className="text-slate-brand text-[13.5px] md:text-[16px] leading-relaxed mb-6 md:mb-8">Mari diskusikan bagaimana SAYBA ARC dapat membantu proyek Anda.</p>
            <div className="btn-row justify-center">
              <Link href="/contact" className="btn-solid">Hubungi Kami</Link>
              <Link href="/services" className="btn-quiet">Lihat layanan</Link>
            </div>
          </div>
        </PageTransition>
      </BoardSection>

      <div className="h-4 md:h-6" aria-hidden="true" />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

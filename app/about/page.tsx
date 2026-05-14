import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig, aboutPage, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import TeamSection, { type TimMember } from "@/components/team-section"

export const metadata: Metadata = {
  title: `Tentang Kami — ${siteConfig.name}`,
  description: aboutPage.hero.subtitle,
}

export interface DeptConfig {
  value: string
  label: string
  color: string
  description?: string
}

async function getTeam(): Promise<TimMember[]> {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    const { data, error } = await supabase
      .from("tim")
      .select("id, name, role, bio, photo_url, github_url, linkedin_url, instagram_url, dept, order_num, status")
      .eq("status", "active")
      .order("order_num", { ascending: true })
    if (error || !data?.length) return []
    return data as TimMember[]
  } catch {
    return []
  }
}

async function getDepts(): Promise<DeptConfig[]> {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    const { data } = await supabase
      .from("layanan_depts")
      .select("value, label, color, description")
      .order("sort_order", { ascending: true })
    return (data ?? []) as DeptConfig[]
  } catch {
    return []
  }
}

export default async function AboutPage() {
  const [teamFromDb, deptsFromDb] = await Promise.all([getTeam(), getDepts()])

  const team: TimMember[] = teamFromDb

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      {/* Hero */}
      <section className="bg-black py-12 md:py-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3">Siapa Kami</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{aboutPage.hero.title}</h1>
            <p className="text-white/45 text-base md:text-lg">{aboutPage.hero.subtitle}</p>
          </div>
        </PageTransition>
      </section>

      {/* Misi & Visi */}
      <section className="py-8 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 border border-black/8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-[#ff914d]/10 flex items-center justify-center mb-3 md:mb-5">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff914d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-black mb-2 md:mb-3">Misi Kami</h2>
              <p className="text-black/55 leading-relaxed text-sm md:text-base">{aboutPage.mission}</p>
            </div>
            <div className="bg-black rounded-xl md:rounded-2xl p-5 md:p-8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-[#ff914d]/20 flex items-center justify-center mb-3 md:mb-5">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#ff914d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Visi Kami</h2>
              <p className="text-white/45 leading-relaxed text-sm md:text-base">{aboutPage.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tim */}
      <section className="py-8 md:py-20 bg-[#f7f7f7]" id="tim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageTransition delay={100}>
            <div className="text-center mb-6 md:mb-14">
              <span className="text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-2 block">Tim Kami</span>
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2 md:mb-3">Kenali Tim SAYBA ARC</h2>
              <p className="text-black/50 text-sm md:text-base">Para ahli di balik setiap proyek yang kami kerjakan</p>
            </div>
          </PageTransition>

          <TeamSection team={team as TimMember[]} depts={deptsFromDb} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-black">
        <PageTransition delay={200}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Siap Berkolaborasi?</h2>
            <p className="text-white/40 mb-7">Mari diskusikan bagaimana SAYBA ARC dapat membantu proyek Anda.</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:scale-105"
            >
              Hubungi Kami
            </Link>
          </div>
        </PageTransition>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

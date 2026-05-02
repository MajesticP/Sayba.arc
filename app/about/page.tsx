import type { Metadata } from "next"
import Link from "next/link"
import { siteConfig, aboutPage, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"

export const metadata: Metadata = {
  title: `Tentang Kami — ${siteConfig.name}`,
  description: aboutPage.hero.subtitle,
}

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      {/* Hero */}
      <section className="bg-black py-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-4">Siapa Kami</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{aboutPage.hero.title}</h1>
            <p className="text-white/45 text-lg">{aboutPage.hero.subtitle}</p>
          </div>
        </PageTransition>
      </section>

      {/* Misi & Visi */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-black/8">
              <div className="w-12 h-12 rounded-xl bg-[#ff914d]/10 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#ff914d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-black mb-3">Misi Kami</h2>
              <p className="text-black/55 leading-relaxed">{aboutPage.mission}</p>
            </div>
            <div className="bg-black rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-[#ff914d]/20 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-[#ff914d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Visi Kami</h2>
              <p className="text-white/45 leading-relaxed">{aboutPage.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tim */}
      <section className="py-20 bg-[#f7f7f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3 block">Tim Kami</span>
            <h2 className="text-3xl font-bold text-black mb-3">Kenali Tim SAYBA ARC</h2>
            <p className="text-black/50">Para ahli di balik setiap proyek yang kami kerjakan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aboutPage.team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-7 border border-black/8 hover:border-[#ff914d]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-50">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-5">
                  <span className="text-xl font-bold text-[#ff914d]">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-1">{member.name}</h3>
                <p className="text-[#ff914d] text-sm font-medium mb-3">{member.role}</p>
                <p className="text-black/50 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black">
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

import type { Metadata } from "next"
import { siteConfig, contactPage, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import { DynamicIcon } from "@/lib/dynamic-icon"

export const metadata: Metadata = {
  title: `Kontak — ${siteConfig.name}`,
  description: contactPage.subtitle,
}

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      {/* Hero */}
      <section className="bg-black py-12 md:py-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3 md:mb-4">Ayo Bicara</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">{contactPage.title}</h1>
            <p className="text-white/45 text-base md:text-lg max-w-xl mx-auto">{contactPage.subtitle}</p>
          </div>
        </PageTransition>
      </section>

      <section className="py-12 md:py-20 bg-white flex-1">
        <PageTransition delay={100}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {/* Info */}
              <div className="space-y-3 md:space-y-5">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">Informasi Kontak</h2>
                {contactPage.info.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-xl md:rounded-2xl border border-black/8 hover:border-[#ff914d]/30 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-[#ff914d]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff914d]/20 transition-colors">
                      <DynamicIcon name={item.icon} color="#ff914d" size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-black/40 uppercase tracking-wider">{item.label}</div>
                      <div className="text-black font-medium text-sm md:text-base">{item.value}</div>
                    </div>
                  </a>
                ))}

                <div className="mt-4 md:mt-8 p-4 md:p-6 bg-black rounded-xl md:rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#ff914d]" />
                  <p className="text-white/50 text-sm leading-relaxed pl-2">
                    Kami biasanya merespons dalam 1 hari kerja. Untuk keperluan mendesak, silakan hubungi via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="bg-[#f7f7f7] rounded-xl md:rounded-2xl p-5 md:p-8 border border-black/5">
                <h2 className="text-xl font-bold text-black mb-6">Kirim Pesan</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-black/60 mb-1.5">Nama Lengkap</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm" placeholder="Nama Anda" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black/60 mb-1.5">Email</label>
                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm" placeholder="email@perusahaan.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black/60 mb-1.5">Departemen yang Dibutuhkan</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm">
                      <option value="">Pilih departemen...</option>
                      <option value="arcgis">Departemen ArcGIS</option>
                      <option value="it">Departemen IT</option>
                      <option value="both">Keduanya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black/60 mb-1.5">Pesan</label>
                    <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm resize-none" placeholder="Ceritakan proyek atau kebutuhan Anda..." />
                  </div>
                  <button className="w-full py-3.5 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.01]">
                    Kirim Pesan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

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
      <Header navItems={navItems} />

      {/* Hero */}
      <section className="bg-black py-8 md:py-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-[10px] font-bold text-[#ff914d] uppercase tracking-widest mb-1.5">Ayo Bicara</span>
            <h1 className="text-[22px] md:text-5xl font-bold text-white mb-2">{contactPage.title}</h1>
            <p className="text-white/45 text-[13px] md:text-lg max-w-xl mx-auto">{contactPage.subtitle}</p>
          </div>
        </PageTransition>
      </section>

      <section className="py-6 md:py-20 bg-white flex-1">
        <PageTransition delay={100}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">

              {/* Info */}
              <div className="space-y-2.5 md:space-y-5">
                <h2 className="text-[16px] md:text-2xl font-bold text-black mb-3 md:mb-6">Informasi Kontak</h2>
                {contactPage.info.map((item, index) => (
                  <a key={index} href={item.href}
                    className="flex items-center gap-3 p-3.5 md:p-5 bg-white rounded-xl border border-black/8 hover:border-[#ff914d]/30 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 group">
                    <div className="w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-[#ff914d]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff914d]/20 transition-colors">
                      <DynamicIcon name={item.icon} color="#ff914d" size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-black/40 uppercase tracking-wider">{item.label}</div>
                      <div className="text-black font-medium text-[13px] md:text-base">{item.value}</div>
                    </div>
                  </a>
                ))}

                <div className="p-3.5 md:p-6 bg-black rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#ff914d]" />
                  <p className="text-white/50 text-[12px] md:text-sm leading-relaxed pl-3">
                    Kami biasanya merespons dalam 1 hari kerja. Untuk keperluan mendesak, silakan hubungi via WhatsApp.
                  </p>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="bg-[#f7f7f7] rounded-xl p-6 md:p-10 border border-black/5 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="#25D366" className="w-7 h-7">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[16px] md:text-xl font-bold text-black mb-1.5">Chat Langsung via WhatsApp</h2>
                  <p className="text-black/50 text-[12px] md:text-sm leading-relaxed max-w-xs">
                    Cara tercepat menghubungi kami — ceritakan kebutuhan Anda dan tim kami akan merespons langsung.
                  </p>
                </div>
                <a
                  href={contactPage.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold bg-[#25D366] text-white hover:bg-[#1ebe5a] transition-all duration-200 hover:shadow-lg hover:shadow-[#25D366]/25 hover:scale-[1.01] text-[13px] md:text-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </PageTransition>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

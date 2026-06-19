import type { Metadata } from "next"
import { siteConfig, contactPage, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import ContactForm from "@/components/contact-form"
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

              {/* Form */}
              <ContactForm />
            </div>
          </div>
        </PageTransition>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

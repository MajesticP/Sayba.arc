import type { Metadata } from "next"
import { siteConfig, contactPage, navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/page-transition"
import { DynamicIcon } from "@/lib/dynamic-icon"
import ContactForm from "@/components/contact-form"

export const metadata: Metadata = {
  title: `Kontak — ${siteConfig.name}`,
  description: contactPage.subtitle,
}

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      {/* Hero */}
      <section className="bg-black py-10 md:py-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-2 md:mb-4">Ayo Bicara</span>
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4">{contactPage.title}</h1>
            <p className="text-white/45 text-sm md:text-lg max-w-xl mx-auto">{contactPage.subtitle}</p>
          </div>
        </PageTransition>
      </section>

      <section className="py-8 md:py-20 bg-white flex-1">
        <PageTransition delay={100}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {/* Info */}
              <div className="space-y-3 md:space-y-5">
                <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">Informasi Kontak</h2>
                {contactPage.info.map((item, index) => (
                  <a
                    key={index}
                    href={item.icon === "map-pin"
                      ? "https://maps.google.com/?q=Pontianak,Kalimantan+Barat,Indonesia"
                      : item.href}
                    target={item.icon === "map-pin" ? "_blank" : undefined}
                    rel={item.icon === "map-pin" ? "noopener noreferrer" : undefined}
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

              {/* Form — Client Component with send notification */}
              <ContactForm />
            </div>
          </div>
        </PageTransition>
      </section>

      {/* Map Section */}
      <section className="bg-[#f7f7f7] py-8 md:py-14">
        <PageTransition delay={150}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">Lokasi Kantor</h2>
            <div className="rounded-2xl overflow-hidden border border-black/8 shadow-sm">
              <iframe
                title="Lokasi SAYBA ARC"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127843.98752085762!2d109.27920824999999!3d-0.02312800000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e1d59008ff11e59%3A0x5030bfbca832eb8!2sPontianak%2C%20West%20Kalimantan!5e0!3m2!1sen!2sid!4v1715000000000!5m2!1sen!2sid"
                width="100%"
                height="360"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-3 text-sm text-black/40 text-center">{siteConfig.address}</p>
          </div>
        </PageTransition>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

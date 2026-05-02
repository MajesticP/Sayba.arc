import { notFound } from "next/navigation"
import { navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { DynamicIcon } from "@/lib/dynamic-icon"
import { supabase } from "@/lib/supabase"
import type { PriceTier } from "@/lib/database.types"

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: service, error } = await supabase
    .from("layanan")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (error || !service) notFound()

  const prices: PriceTier[] = service.prices ?? []

  // Dynamic dept styling
  const DEPT_MAP: Record<string, { label: string; color: string }> = {
    arcgis: { label: "Departemen ArcGIS", color: "#ff914d" },
    it: { label: "Departemen IT", color: "#111111" },
    kelautan: { label: "Departemen Kelautan", color: "#0a6e8a" },
  }
  const deptCfg = DEPT_MAP[service.dept] ?? { label: `Departemen ${service.dept}`, color: "#888" }
  const accent = deptCfg.color

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} ctaText="Hubungi Kami" />

      {/* Hero */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="text-white/30 hover:text-[#ff914d] text-sm flex items-center gap-1.5 mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Layanan
          </Link>

          <div className="flex items-center gap-5 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: accent === "#111111" ? "rgba(255,255,255,0.08)" : `${accent}26` }}
            >
              <DynamicIcon name={service.icon ?? "layers"} color={accent === "#111111" ? "#fff" : accent} size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: accent === "#111111" ? "rgba(255,255,255,0.4)" : accent }}
                >
                  {deptCfg.label}
                </span>
                {service.category && (
                  <>
                    <span className="text-white/20 text-xs">›</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: accent === "#111111" ? "rgba(255,255,255,0.08)" : `${accent}22`,
                        color: accent === "#111111" ? "rgba(255,255,255,0.5)" : accent,
                      }}
                    >
                      {service.category}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{service.title}</h1>
            </div>
          </div>

          {service.description && (
            <p className="text-white/45 text-lg leading-relaxed max-w-2xl">{service.description}</p>
          )}
        </div>
      </section>

      {/* Pricing */}
      {prices.length > 0 && (
        <section className="py-20 bg-white flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: service.dept === "arcgis" ? "#ff914d" : "#111" }}
              >
                Pilih Paket
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">Paket Harga</h2>
              <p className="text-black/45 max-w-xl mx-auto">
                Pilih paket yang paling sesuai dengan kebutuhan dan skala organisasi Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prices.map((tier, i) => {
                const isMiddle = i === 1
                return (
                  <div
                    key={i}
                    className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                      isMiddle
                        ? "bg-black text-white shadow-2xl shadow-black/20 scale-105"
                        : "bg-white border border-black/10 hover:border-black/20 hover:shadow-xl"
                    }`}
                  >
                    {isMiddle && (
                      <div
                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: accent }}
                      >
                        Paling Populer
                      </div>
                    )}

                    {/* Tier name */}
                    <div className="mb-6">
                      <p
                        className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                          isMiddle ? "text-white/40" : "text-black/40"
                        }`}
                      >
                        {tier.name}
                      </p>
                      <div className="flex items-end gap-1">
                        <span
                          className={`text-3xl font-bold ${isMiddle ? "text-white" : "text-black"}`}
                        >
                          {formatPrice(tier.price)}
                        </span>
                      </div>
                      <p
                        className={`text-sm mt-2 leading-snug ${
                          isMiddle ? "text-white/60" : "text-black/50"
                        }`}
                      >
                        {tier.bio}
                      </p>
                    </div>

                    {/* Divider */}
                    <div
                      className={`h-px mb-6 ${
                        isMiddle ? "bg-white/10" : "bg-black/8"
                      }`}
                    />

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-8">
                      {tier.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2.5">
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: isMiddle ? (service.dept === "arcgis" ? "#ff914d" : "#60a5fa") : accent }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span
                            className={`text-sm leading-snug ${
                              isMiddle ? "text-white/80" : "text-black/60"
                            }`}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA button */}
                    <Link
                      href={`/contact?layanan=${encodeURIComponent(service.title)}&paket=${encodeURIComponent(tier.name)}`}
                      className={`block text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 ${
                        isMiddle
                          ? "text-white"
                          : "bg-black/[0.06] text-black hover:bg-black/10"
                      }`}
                      style={isMiddle ? { backgroundColor: accent } : {}}
                    >
                      Pilih Paket {tier.name}
                    </Link>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-black/30 text-sm mt-8">
              Butuh solusi di luar paket? —{" "}
              <Link href="/contact" className="underline hover:text-black transition-colors">
                Diskusikan kebutuhan kustom Anda
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Fallback if no prices yet */}
      {prices.length === 0 && (
        <section className="py-20 bg-white flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Tertarik dengan layanan ini?</h2>
            <p className="text-black/45 mb-6">
              Harga disesuaikan dengan kebutuhan Anda. Mari diskusikan solusi terbaik.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: accent }}
            >
              Hubungi Kami
            </Link>
          </div>
        </section>
      )}

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

import { notFound } from "next/navigation"
import { navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { DynamicIcon } from "@/lib/dynamic-icon"
import { supabase } from "@/lib/supabase"
import type { PriceTier } from "@/lib/database.types"

function gdriveToImg(url: string): string {
  if (!url) return url
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: service, error } = await supabase
    .from("layanan").select("*").eq("slug", slug).eq("status", "active").single()

  if (error || !service) notFound()

  const prices: PriceTier[] = service.prices ?? []

  const DEPT_MAP: Record<string, { label: string; color: string }> = {
    arcgis: { label: "Departemen ArcGIS", color: "#ff914d" },
    it: { label: "Departemen IT", color: "#111111" },
    kelautan: { label: "Departemen Kelautan", color: "#0a6e8a" },
  }
  const deptCfg = DEPT_MAP[service.dept] ?? { label: `Departemen ${service.dept}`, color: "#888" }
  const accent = deptCfg.color

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />

      {/* Hero */}
      <section
        className="relative py-7 md:py-20 overflow-hidden bg-black min-h-[220px] md:min-h-[380px] flex items-center"
        style={service.image_url ? {
          backgroundImage: `url(${gdriveToImg(service.image_url)})`,
          backgroundSize: "cover", backgroundPosition: "center",
        } : undefined}
      >
        {service.image_url && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </>
        )}
        {!service.image_url && (
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at 70% 50%, ${accent} 0%, transparent 70%)` }} />
        )}

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services" className="text-white/30 hover:text-[#ff914d] text-[11px] flex items-center gap-1 mb-4 md:mb-8 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Kembali ke Layanan
          </Link>

          <div className="flex items-center gap-2.5 md:gap-5 mb-3 md:mb-6">
            <div className="w-9 h-9 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
              style={{ backgroundColor: accent === "#111111" ? "rgba(255,255,255,0.10)" : `${accent}30` }}>
              <DynamicIcon name={service.icon ?? "layers"} color={accent === "#111111" ? "#fff" : accent} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent === "#111111" ? "rgba(255,255,255,0.4)" : accent }}>
                  {deptCfg.label}
                </span>
                {service.category && (
                  <>
                    <span className="text-white/20 text-[10px]">›</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: accent === "#111111" ? "rgba(255,255,255,0.10)" : `${accent}28`, color: accent === "#111111" ? "rgba(255,255,255,0.5)" : accent }}>
                      {service.category}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-[18px] md:text-4xl font-bold text-white leading-tight drop-shadow-md">{service.title}</h1>
            </div>
          </div>

          {service.description && (
            <p className="text-white/60 text-[12px] md:text-lg leading-relaxed max-w-2xl drop-shadow-sm">{service.description}</p>
          )}
        </div>
      </section>

      {/* Pricing */}
      {prices.length > 0 && (
        <section className="py-8 md:py-20 bg-white flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-5 md:mb-12">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest mb-1.5 md:mb-3" style={{ color: service.dept === "arcgis" ? "#ff914d" : "#111" }}>
                Pilih Paket
              </span>
              <h2 className="text-[20px] md:text-4xl font-bold text-black mb-1 md:mb-3">Paket Harga</h2>
              <p className="text-black/45 text-[12px] md:text-base max-w-xl mx-auto">
                Pilih paket yang paling sesuai dengan kebutuhan dan skala organisasi Anda.
              </p>
            </div>

            {/* Mobile: horizontal scroll; Desktop: grid */}
            <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 scrollbar-hide">
              {prices.map((tier, i) => {
                const isMiddle = i === 1
                return (
                  <div key={i}
                    className={`relative rounded-2xl p-4 md:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-[72vw] sm:w-[55vw] md:w-auto snap-center ${isMiddle ? "bg-black text-white shadow-2xl shadow-black/20 md:scale-105" : "bg-white border border-black/10 hover:border-black/20 hover:shadow-xl"}`}>
                    {isMiddle && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: accent }}>
                        Paling Populer
                      </div>
                    )}
                    <div className="mb-4 md:mb-6">
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isMiddle ? "text-white/40" : "text-black/40"}`}>{tier.name}</p>
                      <div className="flex items-end gap-1">
                        <span className={`text-[22px] md:text-3xl font-bold ${isMiddle ? "text-white" : "text-black"}`}>{formatPrice(tier.price)}</span>
                      </div>
                      <p className={`text-[12px] mt-1 leading-snug ${isMiddle ? "text-white/60" : "text-black/50"}`}>{tier.bio}</p>
                    </div>

                    <div className={`h-px mb-4 md:mb-6 ${isMiddle ? "bg-white/10" : "bg-black/8"}`} />

                    <ul className="space-y-2.5 flex-1 mb-5 md:mb-8">
                      {tier.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            style={{ color: isMiddle ? (service.dept === "arcgis" ? "#ff914d" : "#60a5fa") : accent }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className={`text-[12px] md:text-sm leading-snug ${isMiddle ? "text-white/80" : "text-black/60"}`}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={`/contact?layanan=${encodeURIComponent(service.title)}&paket=${encodeURIComponent(tier.name)}`}
                      className={`block text-center px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-all duration-200 hover:scale-105 ${isMiddle ? "text-white" : "bg-black/[0.06] text-black hover:bg-black/10"}`}
                      style={isMiddle ? { backgroundColor: accent } : {}}>
                      Pilih {tier.name}
                    </Link>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-black/30 text-[12px] mt-6">
              Butuh solusi di luar paket? —{" "}
              <Link href="/contact" className="underline hover:text-black transition-colors">Diskusikan kebutuhan kustom Anda</Link>
            </p>
          </div>
        </section>
      )}

      {prices.length === 0 && (
        <section className="py-10 md:py-20 bg-white flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-[18px] md:text-2xl font-bold text-black mb-3">Tertarik dengan layanan ini?</h2>
            <p className="text-black/45 text-[13px] mb-5">Harga disesuaikan dengan kebutuhan Anda. Mari diskusikan solusi terbaik.</p>
            <Link href="/contact" className="inline-block px-7 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 text-[13px]"
              style={{ backgroundColor: accent }}>
              Hubungi Kami
            </Link>
          </div>
        </section>
      )}

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

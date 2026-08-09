import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { navItems, footerLinks, socialLinks, siteConfig } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import ProductFeatureTabs from "@/components/product-feature-tabs"
import { generateProductDetailMetadata, generateProductSchema } from "@/lib/structured-data"

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

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabase
    .from("produk")
    .select("title, description, meta_title, meta_description, meta_keywords, image_url, og_image, canonical_url")
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!data) return { title: `Produk — ${siteConfig.name}` }

  const meta = generateProductDetailMetadata({
    title: data.meta_title || `${data.title} — ${siteConfig.name}`,
    description: data.meta_description || data.description || siteConfig.description,
    slug,
    productTitle: data.title,
    keywords: data.meta_keywords ?? undefined,
    ogImage: data.og_image || data.image_url || undefined,
    canonicalUrl: data.canonical_url || undefined,
  })

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
    twitter: meta.twitter,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params

  const { data: product, error } = await supabase
    .from("produk").select("*").eq("slug", slug).eq("status", "active").single()

  if (error || !product) notFound()

  const productSchema = generateProductSchema({
    name: product.title,
    description: product.description ?? siteConfig.description,
    url: `${siteConfig.url}/products/${slug}`,
    image: (product as any).og_image || product.image_url || undefined,
    price: String(product.price),
  })

  const DEPT_MAP: Record<string, { label: string; color: string }> = {
    arcgis: { label: "Departemen ArcGIS", color: "#ff914d" },
    it: { label: "Departemen IT", color: "#111111" },
    kelautan: { label: "Departemen Kelautan", color: "#0a6e8a" },
  }
  const deptCfg = DEPT_MAP[product.dept] ?? { label: `Departemen ${product.dept}`, color: "#888" }
  const accent = deptCfg.color

  const technologies: string[] = (product as any).technologies ?? []
  const process: string[] = (product as any).process ?? []
  const specifications: string[] = (product as any).specifications ?? []
  const hasTabs = technologies.length > 0 || process.length > 0 || specifications.length > 0

  const waLink = `https://wa.me/6287721916495?text=${encodeURIComponent(`Halo, saya tertarik dengan produk "${product.title}"\n> Sayba Arc`)}`

  return (
    <main className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Header navItems={navItems} />

      {/* Hero */}
      <section className="relative py-7 md:py-20 overflow-hidden bg-black min-h-[220px] md:min-h-[380px] flex items-center">
        {product.image_url && (
          <>
            {/* Real <img> (not a CSS background) so Google Images can crawl and index it */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gdriveToImg(product.image_url)}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          </>
        )}
        {!product.image_url && (
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at 70% 50%, ${accent} 0%, transparent 70%)` }} />
        )}

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="text-white/30 hover:text-[#ff914d] text-[11px] flex items-center gap-1 mb-4 md:mb-8 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Kembali ke Produk
          </Link>

          <div className="flex items-center gap-1.5 mb-3 md:mb-6 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent === "#111111" ? "rgba(255,255,255,0.4)" : accent }}>
              {deptCfg.label}
            </span>
            {product.category && (
              <>
                <span className="text-white/20 text-[10px]">›</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: accent === "#111111" ? "rgba(255,255,255,0.10)" : `${accent}28`, color: accent === "#111111" ? "rgba(255,255,255,0.5)" : accent }}>
                  {product.category}
                </span>
              </>
            )}
          </div>
          <h1 className="text-[18px] md:text-4xl font-bold text-white leading-tight drop-shadow-md mb-2 md:mb-4">{product.title}</h1>

          {product.description && (
            <p className="text-white/60 text-[12px] md:text-lg leading-relaxed max-w-2xl drop-shadow-sm">{product.description}</p>
          )}
        </div>
      </section>

      {/* Harga & Detail Produk — bersebelahan di desktop kalau ada data tab */}
      <section className="py-8 md:py-16 bg-white flex-1">
        <div className={hasTabs ? "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" : "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"}>
          <div className={hasTabs ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:gap-8 items-start" : ""}>

            {/* Kiri: Tab Teknologi/Proses/Spesifikasi — hanya render kalau ada isinya */}
            {hasTabs && (
              <div className="order-2 lg:order-1 min-w-0">
                <div className="rounded-2xl border border-black/10 p-5 md:p-8">
                  <ProductFeatureTabs technologies={technologies} process={process} specifications={specifications} accent={accent} />
                </div>
              </div>
            )}

            {/* Kanan: Kartu Harga & CTA — sticky kalau ada tab di sampingnya */}
            <div className={hasTabs ? "order-1 lg:order-2 lg:sticky lg:top-20" : ""}>
              <div className="rounded-2xl border border-black/10 p-5 md:p-7 flex flex-col gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/35 mb-1.5">Harga</p>
                  <p className="text-[26px] md:text-3xl font-bold text-black">{formatPrice(product.price)}</p>
                  <p className="text-black/45 text-[12px] md:text-sm mt-2">
                    Dokumen dikirimkan langsung setelah pembayaran dikonfirmasi oleh tim kami.
                  </p>
                </div>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#25D366] text-white hover:bg-[#1ebe5a] transition-all duration-200 hover:shadow-lg hover:shadow-[#25D366]/25 hover:scale-[1.02] text-[13px] md:text-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Pesan via WhatsApp
                </a>
              </div>
              <p className="text-center text-black/30 text-[12px] mt-4">
                Butuh versi kustom? —{" "}
                <Link href="/contact" className="underline hover:text-black transition-colors">Diskusikan kebutuhan Anda</Link>
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

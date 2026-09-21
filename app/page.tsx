import type { Metadata } from "next"
import { siteConfig, hero, about, cta, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Hero from "@/components/hero"
import PromoCarousel from "@/components/promo-carousel"
import Services from "@/components/services"
import InformasiHighlight from "@/components/informasi-highlight"
import NewsHighlight from "@/components/news-highlight"
import About from "@/components/about"
import CTA from "@/components/cta"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Layanan, PromoBanner, Berita, Informasi } from "@/lib/database.types"
import { LAYANAN_DEPTS } from "@/lib/layanan-config"
import { getKategori, kategoriDariDokumen } from "@/lib/kategori"
import { generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/structured-data"

export const metadata: Metadata = {
  title: `${siteConfig.name}, Konsultan IT & Engineering Pontianak`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `${siteConfig.name}, Konsultan IT & Engineering Pontianak`,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function Home() {
  // Urutan section di beranda: Hero, Banner Promosi, Layanan, Informasi, Berita.
  // Semua data diambil paralel supaya waktu render tidak menumpuk.
  const [layananRes, promoRes, beritaRes, informasiRes, kategoriInformasi, kategoriBerita] =
    await Promise.all([
    supabase
      .from("layanan")
      .select("*")
      .eq("status", "active")
      .not("featured_order", "is", null)
      .order("featured_order", { ascending: true })
      .limit(3),
    supabase
      .from("promo_banner")
      .select("*")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("berita")
      .select("id, title, slug, excerpt, category, image_url, published_at, read_minutes, views")
      .eq("status", "active")
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("informasi")
      .select("id, title, slug, excerpt, category, published_at, read_minutes, views")
      .eq("status", "active")
      .order("published_at", { ascending: false })
      .limit(5),
    getKategori("informasi"),
    getKategori("berita"),
  ])

  if (layananRes.error) console.error("Error fetching layanan:", layananRes.error.message)
  if (beritaRes.error) console.error("Error fetching berita:", beritaRes.error.message)
  if (informasiRes.error) console.error("Error fetching informasi:", informasiRes.error.message)

  const allLayanan: Layanan[] = layananRes.data ?? []
  const promoBanners: PromoBanner[] = promoRes.data ?? []
  const beritaTerbaru = (beritaRes.data ?? []) as Berita[]
  const informasiTerbaru = (informasiRes.data ?? []) as Informasi[]

  // Kategori Informasi: dari tabel `kategori`; kalau masih kosong, susun dari
  // dokumen yang benar-benar ada supaya labelnya tetap tampil.
  const kategoriInfo =
    kategoriInformasi.length > 0
      ? kategoriInformasi
      : kategoriDariDokumen(informasiTerbaru.map((a) => a.category))

  // Kategori Berita: dari tabel `kategori`; kalau kosong, susun dari artikel
  // yang ada supaya labelnya tetap tampil.
  const kategoriBeritaList =
    kategoriBerita.length > 0
      ? kategoriBerita
      : kategoriDariDokumen(beritaTerbaru.map((a) => a.category))

  const organizationSchema = generateOrganizationSchema()
  const localBusinessSchema = generateLocalBusinessSchema()

  return (
    <main className="board-area min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <Header navItems={navItems} />

      {/* Setiap section adalah satu lembar kerja yang mengambang di atas meja
          potong. Celah kiri-kanan tiap panel dibiarkan terbuka (lihat
          `.board-slot`), jadi permukaan meja terlihat menyambung dari lembar
          pertama sampai lembar terakhir. Jarak antar lembar dibuat tipis
          supaya terbaca sebagai satu tumpukan, bukan halaman terpisah. */}
      <Hero data={hero} />
      <PromoCarousel slides={promoBanners} interval={6000} />
      <Services allLayanan={allLayanan} depts={LAYANAN_DEPTS} />
      <InformasiHighlight articles={informasiTerbaru} kategori={kategoriInfo} />
      <NewsHighlight articles={beritaTerbaru} kategori={kategoriBeritaList} />
      <About data={about} />
      {/* CTA: lembar terang terakhir. Footer di bawahnya navy, dan permukaan
          terang inilah yang memisahkan keduanya supaya tinggi footer terbaca
          apa adanya. */}
      <CTA data={cta} />
      {/* Jarak sebelum footer: memberi ruang meja di bawah lembar terakhir. */}
      <div className="h-4 md:h-6" aria-hidden="true" />

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

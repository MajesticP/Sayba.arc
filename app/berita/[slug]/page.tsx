import type { Metadata } from "next"
import { isGambarContoh } from "@/lib/image-path"
import { BoardSection } from "@/components/cutting-board-bg"
import Link from "next/link"
import { notFound } from "next/navigation"
import { siteConfig, navItems, footerLinks, socialLinks } from "@/lib/data"
import { formatNewsDate } from "@/lib/news-data"
import { getKategori, resolveKategori } from "@/lib/kategori"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ViewCounter from "@/components/view-counter"
import { generateBreadcrumbSchema } from "@/lib/structured-data"
import { buildSeoMetadata, gdriveToProxy } from "@/lib/seo"
import { supabase } from "@/lib/supabase"
import type { Berita } from "@/lib/database.types"

interface PageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

/**
 * Halaman detail berita: gambar utama artikel.
 *
 * Dulu ada gambar contoh di /public/berita yang dipakai sebagai cadangan.
 * Berkas contoh itu sudah dihapus, dan memakai foto contoh sebagai cadangan
 * menyesatkan pembaca (foto proyek lain tampil seolah milik berita ini).
 * Kalau artikel belum punya foto, bidang gambarnya tidak ditampilkan sama
 * sekali: judul dan isi tetap terbaca, dan tidak ada gambar palsu.
 */

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string {
  if (url && isGambarContoh(url)) return ""
  return gdriveToProxy(url) || ""
}

function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${siteConfig.url}${url}`
}

/**
 * Pecah isi artikel (Markdown ringan dari textarea admin) menjadi blok:
 * baris kosong memisah paragraf, awalan "## " menandai sub-judul.
 * Disimpan lokal karena helper kategori/berita tidak lagi memuatnya.
 */
function parseArticleBody(body: string | null): string[] {
  if (!body) return []
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
}

async function getArticle(slug: string): Promise<Berita | null> {
  const { data, error } = await supabase
    .from("berita")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle()

  if (error) console.error("Error fetching berita detail:", error)
  return data ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: `Berita: ${siteConfig.name}` }

  return buildSeoMetadata({
    title: article.title,
    metaTitle: article.meta_title,
    excerpt: article.excerpt,
    metaDescription: article.meta_description,
    metaKeywords: article.meta_keywords,
    image: gdriveToProxy(article.og_image) || gdriveToProxy(article.image_url) || "",
    path: `/berita/${article.slug}`,
    canonicalUrl: article.canonical_url,
    type: "article",
    publishedTime: article.published_at,
  })
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const kategoriBerita = await getKategori("berita")
  const cat = resolveKategori(article.category, kategoriBerita)
  const color = cat.color
  const catLabel = cat.label
  const heroImg = gdriveToImg(article.image_url)
  const blocks = parseArticleBody(article.body)

  // Artikel lain: kategori sama lebih dulu, lalu sisanya
  const { data: othersData } = await supabase
    .from("berita")
    .select("id, title, slug, category, image_url, published_at, read_minutes")
    .eq("status", "active")
    .neq("slug", article.slug)
    .order("published_at", { ascending: false })
    .limit(12)

  const others = (othersData ?? []) as Array<{
    id: string
    title: string
    slug: string
    category: string
    image_url: string | null
    published_at: string
    read_minutes: number
  }>
  const related = [
    ...others.filter((a) => a.category === article.category),
    ...others.filter((a) => a.category !== article.category),
  ].slice(0, 3)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: absoluteUrl(article.og_image || article.image_url || ""),
    datePublished: article.published_at,
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo-256.png` },
    },
    mainEntityOfPage: `${siteConfig.url}/berita/${article.slug}`,
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Beranda", url: siteConfig.url },
    { name: "Berita", url: `${siteConfig.url}/berita` },
    { name: article.title, url: `${siteConfig.url}/berita/${article.slug}` },
  ])

  return (
    <main className="board-area min-h-screen flex flex-col bg-ice">
      {/* Penghitung tampilan: naik saat halaman dibuka atau di-refresh */}
      <ViewCounter table="berita" slug={article.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header navItems={navItems} />

      {/* ══ JUDUL ARTIKEL ══ */}
      <BoardSection dark id="judul-artikel" panelClassName="relative">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 pt-20 pb-10 md:pt-28 md:pb-14">
          <nav
            className="flex items-center gap-1.5 text-[12px] text-orange-soft mb-6 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-ice transition-colors">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/berita" className="hover:text-ice transition-colors">
              Berita
            </Link>
          </nav>

          {/* Badge kategori: warna kategori dipakai sebagai GARIS tepi saja,
              teksnya ice di atas bidang navy sehingga kontrasnya 13.44:1
              berapa pun warna kategorinya. Warna kategori mentah tidak bisa
              dipakai sebagai latar berteks terang: sebagian gagal kontras. */}
          <span
            className="inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-ice mb-4"
            style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }}
          >
            {catLabel}
          </span>

          <h1 className="text-[24px] md:text-[36px] font-bold text-ice leading-[1.2] tracking-tight mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-ice/75 text-[14px] md:text-[16px] leading-relaxed mb-6">{article.excerpt}</p>
          )}

          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 pt-5 border-t border-white/10 text-[12px] text-ice/70">
            <span className="text-ice font-medium">{article.author}</span>
            <span aria-hidden="true">·</span>
            <span>{formatNewsDate(article.published_at)}</span>
            <span aria-hidden="true">·</span>
            <span>{article.read_minutes} menit baca</span>
          </div>
        </div>
      </BoardSection>

      {/* ══ ISI ══ */}
      <BoardSection id="isi-artikel" as="article" panelClassName="panel-top-pad">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 pb-10 md:pb-16">
          {/* Gambar utama: hanya kalau artikel punya foto. Tanpa foto, blok
              ini tidak ditampilkan sama sekali, bukan diisi gambar contoh. */}
          {heroImg && (
            <figure className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-ice-line bg-ice-dim mb-8 md:mb-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </figure>
          )}

          <div>
            {blocks.map((block, i) =>
              block.startsWith("## ") ? (
                <h2
                  key={i}
                  className="text-[17px] md:text-[22px] font-bold text-navy mt-9 mb-4 pb-2 border-b border-ice-line leading-snug"
                >
                  {block.slice(3)}
                </h2>
              ) : (
                <p
                  key={i}
                  className="text-[14px] md:text-[16px] text-slate-brand leading-[1.85] my-4 whitespace-pre-line"
                >
                  {block}
                </p>
              )
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-9 pt-6 border-t border-ice-line">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-white border border-ice-line text-[11px] font-medium text-slate-brand"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Ajakan */}
          <div className="mt-9 rounded-2xl bg-navy p-6 md:p-8">
            <h2 className="text-[17px] md:text-[20px] font-bold text-ice mb-2">
              Ada pekerjaan teknis yang sedang direncanakan?
            </h2>
            <p className="text-orange-soft text-[14px] md:text-[15px] leading-relaxed mb-5 max-w-lg">
              Ceritakan lingkupnya. Kami bantu petakan kebutuhan dan langkah pertamanya.
            </p>
            <Link href="/contact" className="btn-solid">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </BoardSection>

      {/* ══ ARTIKEL LAIN ══ */}
      {related.length > 0 && (
        <BoardSection id="artikel-lain" panelClassName="panel-top-pad">
          <div className="px-5 sm:px-7 lg:px-10 pb-7 md:pb-12">
            <div className="flex items-baseline justify-between gap-3 mb-5">
              <h2 className="text-[18px] md:text-2xl font-bold text-navy">Artikel Lainnya</h2>
              <Link
                href="/berita"
                className="text-[13px] font-semibold text-slate-brand hover:text-navy transition-colors"
              >
                Lihat semua
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-ice-line overflow-hidden hover:border-orange hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-ice-dim">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gdriveToImg(item.image_url)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-bold text-navy leading-snug line-clamp-2 mb-2 group-hover:text-slate-brand transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-[11px] text-slate-brand">
                      {formatNewsDate(item.published_at)} · {item.read_minutes} mnt baca
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </BoardSection>
      )}

      <div className="h-4 md:h-6" aria-hidden="true" />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

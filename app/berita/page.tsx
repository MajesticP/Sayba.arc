import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Berita } from "@/lib/database.types"
import { getKategori, kategoriDariDokumen } from "@/lib/kategori"
import NewsList from "@/components/news-list"

const description =
  "Catatan proyek, panduan teknis, dan kabar tim SAYBA ARC, konsultan IT dan engineering di Pontianak."

export const metadata: Metadata = {
  title: `Berita: ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/berita` },
  openGraph: {
    title: `Berita: ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/berita`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function BeritaPage() {
  const [articlesRes, kategoriDb] = await Promise.all([
    supabase
      .from("berita")
      .select("*")
      .eq("status", "active")
      .order("published_at", { ascending: false }),
    getKategori("berita"),
  ])

  if (articlesRes.error) console.error("Error fetching berita:", articlesRes.error.message)

  // Tidak ada data contoh. Kalau database kosong, halaman menampilkan empty state.
  const articles: Berita[] = articlesRes.data ?? []

  // Kategori dari tabel `kategori`; kalau masih kosong, susun dari dokumen
  // yang benar-benar ada supaya filter tetap berfungsi.
  const kategori =
    kategoriDb.length > 0 ? kategoriDb : kategoriDariDokumen(articles.map((a) => a.category))

  return (
    <main className="board-area min-h-screen flex flex-col">
      <Header navItems={navItems} />
      <NewsList initialArticles={articles} kategori={kategori} />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

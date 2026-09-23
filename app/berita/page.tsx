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

/**
 * Ambil semua berita, sorotan lebih dulu.
 *
 * Kalau kolom `featured_order` belum ada (migrasi belum dijalankan), PostgREST
 * menolak seluruh query dan daftar berita jadi kosong. Karena itu ada
 * percobaan kedua tanpa kolom itu: daftarnya tetap tampil, hanya urutan
 * sorotannya yang belum berlaku.
 */
async function ambilSemuaBerita(): Promise<{ data: Berita[] | null; error: { message: string } | null }> {
  const denganSorotan = await supabase
    .from("berita")
    .select("*")
    .eq("status", "active")
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false })

  if (!denganSorotan.error) {
    return { data: (denganSorotan.data ?? []) as Berita[], error: null }
  }

  const tanpaSorotan = await supabase
    .from("berita")
    .select("*")
    .eq("status", "active")
    .order("published_at", { ascending: false })

  return {
    data: (tanpaSorotan.data ?? []) as Berita[],
    error: tanpaSorotan.error ?? denganSorotan.error,
  }
}

export default async function BeritaPage() {
  // Sorotan dulu (featured_order 1, 2, 3), lalu sisanya menurut tanggal.
  // Urutan ini dipakai halaman berita sendiri, jadi sorotan #1 selalu paling
  // atas dan sama dengan yang tampil di beranda.
  const [articlesRes, kategoriDb] = await Promise.all([
    ambilSemuaBerita(),
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

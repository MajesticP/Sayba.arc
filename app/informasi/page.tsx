import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Informasi } from "@/lib/database.types"
import { getKategori, kategoriDariDokumen } from "@/lib/kategori"
import InformasiClient from "./informasi-client"

const description =
  "Panduan kerja, standar berkas, dan pengumuman layanan dari SAYBA ARC: konsultan IT dan engineering di Pontianak."

export const metadata: Metadata = {
  title: `Informasi: ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/informasi` },
  openGraph: {
    title: `Informasi: ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/informasi`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

export default async function InformasiPage() {
  const [articlesRes, kategoriDb] = await Promise.all([
    supabase
      .from("informasi")
      .select("*")
      .eq("status", "active")
      .order("published_at", { ascending: false }),
    getKategori("informasi"),
  ])

  if (articlesRes.error) console.error("Error fetching informasi:", articlesRes.error.message)

  // Tidak ada data contoh. Kalau database kosong, halaman menampilkan empty state.
  const articles: Informasi[] = articlesRes.data ?? []

  // Kategori diambil dari tabel `kategori` (scope "informasi") supaya admin bisa
  // menambah/menghapus sendiri. Kalau tabel masih kosong, susun daftar dari
  // kategori yang benar-benar dipakai artikel agar filter tetap berfungsi.
  const kategori =
    kategoriDb.length > 0 ? kategoriDb : kategoriDariDokumen(articles.map((a) => a.category))

  return (
    <main className="min-h-screen flex flex-col">
      <Header navItems={navItems} />
      <InformasiClient initialArticles={articles} kategori={kategori} />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

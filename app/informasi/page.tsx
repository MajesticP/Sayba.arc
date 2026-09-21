import type { Metadata } from "next"
import { siteConfig, navItems, footerLinks, socialLinks, ogImage } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase"
import type { Informasi } from "@/lib/database.types"
import InformasiClient, { type KategoriItem } from "./informasi-client"

const description =
  "Panduan kerja, standar berkas, dan pengumuman layanan dari SAYBA ARC — konsultan IT dan engineering di Pontianak."

export const metadata: Metadata = {
  title: `Informasi — ${siteConfig.name}`,
  description,
  alternates: { canonical: `${siteConfig.url}/informasi` },
  openGraph: {
    title: `Informasi — ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/informasi`,
    type: "website",
    images: [ogImage],
  },
}

export const revalidate = 60

/** Warna cadangan bila kategori belum punya warna di database. */
const FALLBACK_COLOR = "#5e6572"

export default async function InformasiPage() {
  const [articlesRes, kategoriRes] = await Promise.all([
    supabase
      .from("informasi")
      .select("*")
      .eq("status", "active")
      .order("published_at", { ascending: false }),
    supabase
      .from("informasi_kategori")
      .select("slug, label, color, sort_order")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
  ])

  if (articlesRes.error) console.error("Error fetching informasi:", articlesRes.error)
  if (kategoriRes.error) console.error("Error fetching kategori informasi:", kategoriRes.error)

  // Tidak ada data contoh. Kalau database kosong, halaman menampilkan empty state.
  const articles: Informasi[] = articlesRes.data ?? []

  // Kategori diambil dari database supaya admin bisa menambah/menghapus sendiri.
  // Kalau tabel kategori masih kosong, susun daftar dari kategori yang benar-benar
  // dipakai artikel supaya filter tetap berfungsi.
  const kategori: KategoriItem[] =
    kategoriRes.data && kategoriRes.data.length > 0
      ? (kategoriRes.data as Array<{ slug: string; label: string; color: string | null }>).map(
          (k) => ({
            slug: k.slug,
            label: k.label,
            color: k.color || FALLBACK_COLOR,
          })
        )
      : [...new Set(articles.map((a) => a.category))].map((slug) => ({
          slug,
          label: slug,
          color: FALLBACK_COLOR,
        }))

  return (
    <main className="min-h-screen flex flex-col bg-platinum">
      <Header navItems={navItems} />
      <InformasiClient initialArticles={articles} categories={kategori} />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

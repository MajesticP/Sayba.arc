import Link from "next/link"
import { navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CuttingBoardBackground from "@/components/cutting-board-bg"

/**
 * 404 kustom — pengganti halaman default Next.js yang berbahasa Inggris.
 * Berbahasa Indonesia, memakai palet baru, dan memberi jalan keluar
 * (bukan jalan buntu): empat tautan ke bagian utama situs.
 */
export default function NotFound() {
  const links = [
    { label: "Beranda", href: "/" },
    { label: "Layanan", href: "/services" },
    { label: "Informasi", href: "/informasi" },
    { label: "Kontak", href: "/contact" },
  ]

  return (
    <main className="min-h-screen flex flex-col bg-platinum">
      <Header navItems={navItems} />

      <section className="relative bg-carbon overflow-hidden flex-1 flex items-center">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-[120px] pb-20 md:pt-40 md:pb-28 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-steel mb-4">
            Kesalahan 404
          </p>

          <h1 className="text-[64px] sm:text-[88px] md:text-[112px] font-bold leading-none text-platinum tracking-tight mb-4">
            404
          </h1>

          <h2 className="text-[20px] md:text-3xl font-bold text-platinum mb-3">
            Halaman tidak ditemukan
          </h2>

          <p className="text-[14px] md:text-base text-steel leading-relaxed max-w-xl mx-auto mb-9">
            Alamat yang Anda buka tidak ada atau sudah dipindahkan. Periksa kembali
            tautannya, atau mulai lagi dari salah satu bagian di bawah ini.
          </p>

          <nav
            aria-label="Tautan bantuan"
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-steel text-carbon text-[13px] font-semibold hover:bg-powder transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

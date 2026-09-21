import Link from "next/link"
import { navItems, footerLinks, socialLinks } from "@/lib/data"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CuttingBoardBackground, { BoardSection } from "@/components/cutting-board-bg"

/**
 * 404 kustom, pengganti halaman default Next.js yang berbahasa Inggris.
 *
 * Bentuknya panel gelap yang mengambang di atas meja potong, sama seperti
 * seluruh halaman lain, jadi halaman ini tidak terasa sebagai halaman asing.
 * Empat tautan ke bagian utama situs: halaman ini memberi jalan keluar,
 * bukan jalan buntu.
 */
export default function NotFound() {
  const links = [
    { label: "Beranda", href: "/" },
    { label: "Layanan", href: "/services" },
    { label: "Informasi", href: "/informasi" },
    { label: "Kontak", href: "/contact" },
  ]

  return (
    <main className="board-area min-h-screen flex flex-col">
      <Header navItems={navItems} />

      <BoardSection dark id="not-found" className="flex-1" panelClassName="relative overflow-hidden flex-1 flex items-center">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-16 md:py-24 text-center">
          <p className="text-[12px] font-bold uppercase tracking-widest text-orange-soft mb-4">
            Kesalahan 404
          </p>

          <h1 className="text-[56px] sm:text-[80px] md:text-[104px] font-bold leading-none text-ice tracking-tight mb-4 tabular-nums">
            404
          </h1>

          <h2 className="text-[20px] md:text-[28px] font-bold text-ice mb-3">
            Halaman tidak ditemukan
          </h2>

          <p className="text-[14px] md:text-[16px] text-ice/85 leading-relaxed max-w-xl mx-auto mb-9">
            Alamat yang Anda buka tidak ada atau sudah dipindahkan. Periksa kembali
            tautannya, atau mulai lagi dari salah satu bagian di bawah ini.
          </p>

          {/* Tautan pemulihan: tombol pertama adalah tindakan utama, sisanya
              pilihan tenang supaya mata tahu harus mulai dari mana. */}
          <nav aria-label="Tautan bantuan" className="btn-row justify-center">
            {links.map((link, i) => (
              <Link key={link.href} href={link.href} className={i === 0 ? "btn-solid" : "btn-quiet"}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </BoardSection>

      <div className="h-4 md:h-6" aria-hidden="true" />
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </main>
  )
}

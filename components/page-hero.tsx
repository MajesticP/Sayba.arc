import type React from "react"
import PageTransition from "@/components/page-transition"
import { BoardSection } from "@/components/cutting-board-bg"

interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  /** Konten tambahan di bawah subtitle (tombol, statistik, breadcrumb, dll.) */
  children?: React.ReactNode
}

/**
 * PageHero: kepala halaman untuk halaman daftar (Tentang, Kontak, Portofolio).
 *
 * Bentuknya panel gelap yang mengambang di atas meja potong, sama seperti
 * lembar-lembar lain di situs.
 *
 * TIDAK memakai gambar banner lagi. Sebelumnya kepala halaman memuat foto
 * besar dari /public/banners, dan foto itu harus disiapkan terpisah untuk
 * setiap halaman serta setiap ukuran layar. Motif meja potong sudah menjadi
 * identitas situs, jadi ia yang dipakai di sini: kisi ukur, tanda registrasi,
 * dan sapuan pisau potong. Hasilnya tidak ada berkas gambar yang perlu
 * diganti saat teks berubah, dan kepala halaman tetap konsisten dengan
 * seluruh permukaan lain di situs.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: PageHeroProps) {
  return (
    <BoardSection
      dark
      id="page-hero"
      panelClassName="relative min-h-[200px] md:min-h-[300px] flex items-center justify-center"
    >
      <div className="relative z-10 w-full pt-20 pb-10 md:pt-24 md:pb-14">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
            {eyebrow && (
              <span className="inline-block text-[11px] font-bold text-orange-soft uppercase tracking-widest mb-2.5">
                {eyebrow}
              </span>
            )}
            <h1 className="text-[24px] md:text-[46px] font-bold text-ice mb-2.5 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-ice/85 text-[13.5px] md:text-[17px] max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </PageTransition>
      </div>

      {/* Garis ukur penutup: batas antara kepala halaman dan isinya. */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange/55 to-transparent" />
    </BoardSection>
  )
}

import type React from "react"
import PageTransition from "@/components/page-transition"
import { BoardSection } from "@/components/cutting-board-bg"

interface PageHeroProps {
  /** Banner desktop di /public/banners/, ganti file, nama dipertahankan. Rasio 1920x600 px. */
  image: string
  /**
   * Banner khusus layar kecil, rasio 2:1 (900x450 px). Banner desktop yang
   * sangat lebar (3.2:1) harus dipotong hampir separuh lebarnya agar muat di
   * layar ponsel, sehingga gambarnya tampak ter-zoom. Versi 2:1 nyaris tidak
   * terpotong. Kalau dikosongkan, banner desktop tetap dipakai.
   */
  imageMobile?: string
  imageAlt?: string
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
 * lembar-lembar lain di situs. Sebelumnya ia latar penuh sampai tepi layar,
 * sehingga halaman daftar terasa berasal dari situs yang berbeda dengan
 * beranda. Sekarang aturan "semua section adalah lembar di atas satu meja"
 * berlaku di seluruh halaman.
 *
 * Orb orange yang dulu ada di sini sudah dihapus: ia menambah cahaya tanpa
 * menambah makna.
 */
export default function PageHero({
  image,
  imageMobile,
  imageAlt = "",
  eyebrow,
  title,
  subtitle,
  children,
}: PageHeroProps) {
  return (
    <BoardSection dark id="page-hero" panelClassName="relative min-h-[210px] md:min-h-[360px] flex items-center">
      {/* Browser hanya mengunduh satu berkas: yang cocok dengan lebar layarnya. */}
      <picture>
        {imageMobile && <source media="(max-width: 767px)" srcSet={imageMobile} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={imageAlt}
          aria-hidden={imageAlt ? undefined : true}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-95 md:opacity-70"
        />
      </picture>

      {/* Scrim jauh lebih tipis di ponsel supaya banner benar-benar terlihat.
          Di desktop tetap pekat karena area teksnya jauh lebih luas. */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/55 via-navy/40 to-navy/65 md:from-navy/80 md:via-navy/60 md:to-navy/85" />

      <div className="relative z-10 w-full pt-24 pb-8 md:pt-28 md:pb-14">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 text-center">
            {eyebrow && (
              <span
                className="inline-block text-[11px] font-bold text-orange-soft uppercase tracking-widest mb-2"
                style={{ textShadow: "0 1px 3px rgba(17,42,70,0.9)" }}
              >
                {eyebrow}
              </span>
            )}
            {/* Bayangan teks menjaga keterbacaan di atas scrim tipis versi ponsel */}
            <h1
              className="text-[22px] md:text-[44px] font-bold text-white mb-2 leading-tight"
              style={{ textShadow: "0 2px 10px rgba(17,42,70,0.85)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-white/85 md:text-white/80 text-[13px] md:text-[17px] max-w-2xl mx-auto leading-snug md:leading-relaxed"
                style={{ textShadow: "0 1px 6px rgba(17,42,70,0.9)" }}
              >
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

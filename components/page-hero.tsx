import type React from "react"
import PageTransition from "@/components/page-transition"

interface PageHeroProps {
  /** Banner desktop di /public/banners/ — ganti file, nama dipertahankan. Rasio 1920x600 px. */
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
    <section className="relative bg-black overflow-hidden min-h-[170px] md:min-h-[380px] flex items-center">
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55 md:from-black/75 md:via-black/55 md:to-black/80" />

      {/* Aksen glow oranye */}
      <div className="absolute -top-16 right-1/4 w-72 h-72 rounded-full bg-[#ff914d] opacity-[0.10] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full pt-[80px] pb-5 md:pt-32 md:pb-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {eyebrow && (
              <span
                className="inline-block text-[10px] font-bold text-[#ff914d] uppercase tracking-widest mb-1.5 md:mb-2"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {eyebrow}
              </span>
            )}
            {/* Bayangan teks menjaga keterbacaan di atas scrim tipis versi ponsel */}
            <h1
              className="text-[20px] md:text-5xl font-bold text-white mb-1.5 md:mb-2 leading-tight"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-white/75 md:text-white/55 text-[12.5px] md:text-lg max-w-2xl mx-auto leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-none"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
              >
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </PageTransition>
      </div>

      {/* Garis aksen bawah */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/60 to-transparent" />
    </section>
  )
}

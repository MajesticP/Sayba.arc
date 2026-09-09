import type React from "react"
import PageTransition from "@/components/page-transition"

interface PageHeroProps {
  /** Gambar banner di /public/banners/ — ganti file, nama dipertahankan. Rasio 1920x600 px. */
  image: string
  imageAlt?: string
  eyebrow?: string
  title: string
  subtitle?: string
  /** Konten tambahan di bawah subtitle (tombol, statistik, breadcrumb, dll.) */
  children?: React.ReactNode
}

export default function PageHero({ image, imageAlt = "", eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative bg-black overflow-hidden min-h-[220px] md:min-h-[380px] flex items-center">
      {/* Banner */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={imageAlt}
        aria-hidden={imageAlt ? undefined : true}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Scrim — menjaga teks tetap terbaca dengan gambar apa pun */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />

      {/* Aksen glow oranye */}
      <div className="absolute -top-16 right-1/4 w-72 h-72 rounded-full bg-[#ff914d] opacity-[0.10] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full pt-[88px] pb-8 md:pt-32 md:pb-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {eyebrow && (
              <span className="inline-block text-[10px] font-bold text-[#ff914d] uppercase tracking-widest mb-2">
                {eyebrow}
              </span>
            )}
            <h1 className="text-[22px] md:text-5xl font-bold text-white mb-2 leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-white/55 text-[13px] md:text-lg max-w-2xl mx-auto">{subtitle}</p>
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

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { siteConfig } from "@/lib/data"

interface NavItem { label: string; href: string }
interface HeaderProps { navItems: NavItem[]; ctaText?: string; ctaHref?: string }

/**
 * Header: kapsul melayang.
 *
 * Bentuk dan posisi dipertahankan: kapsul melayang di atas section pertama,
 * tanpa spacer, sehingga latarnya mengikuti hero di bawahnya. Yang berubah
 * hanya warna (palet Executive Navy) dan kerapian jarak.
 *
 * Warna: kapsul memakai navy dengan teks ice. Alasan navy, bukan putih:
 * warna otoritas pada panduan brand dipakai untuk header, dan latar gelap
 * membuat kapsul terbaca sebagai satu bidang di atas hero yang juga navy.
 */
export default function Header({ navItems, ctaText, ctaHref }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Kapsul menebal saat halaman di-scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Tutup menu mobile setiap pindah halaman
  useEffect(() => setIsOpen(false), [pathname])

  // Tutup menu mobile dengan Escape (WCAG 2.1.2: tidak ada jebakan fokus)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen])

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      {/* Jarak atas di container dalam, bukan di <header>: globals.css punya
          aturan `header { padding-top: env(safe-area-inset-top) }` tanpa
          @layer, yang presedennya mengalahkan utility Tailwind. */}
      <div className="max-w-6xl mx-auto px-3 sm:px-5 pt-4 md:pt-6">
        <div
          className={`pointer-events-auto rounded-2xl md:rounded-full border transition-all duration-300 ${
            scrolled
              ? "bg-navy/95 backdrop-blur-xl border-ice/15 shadow-[0_8px_30px_rgba(17,42,70,0.28)]"
              : "bg-navy/90 backdrop-blur-lg border-ice/10 shadow-[0_4px_20px_rgba(17,42,70,0.20)]"
          }`}
        >
          <div className="flex justify-between items-center h-14 pl-3.5 pr-2.5 md:pl-5 md:pr-2.5">
            {/* Logo: nama brand selalu tampil */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-256.png"
                alt={siteConfig.name}
                width={32}
                height={32}
                fetchPriority="high"
                decoding="async"
                className="h-8 w-8 rounded-md object-contain"
              />
              <span className="font-bold text-[15px] text-ice tracking-tight group-hover:text-orange-soft transition-colors">
                {siteConfig.name}
              </span>
            </Link>

            {/* Navigasi desktop */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-7" aria-label="Navigasi utama">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`text-[13.5px] font-medium transition-colors duration-200 relative group ${
                    isActive(item.href) ? "text-ice" : "text-ice/70 hover:text-ice"
                  }`}
                >
                  {item.label}
                  {/* Garis penanda halaman aktif. Orange dipakai di sini karena
                      ini satu-satunya penanda posisi di navigasi, sesuai aturan
                      "orange untuk aksen saja". */}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-orange transition-all duration-300 ${
                      isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {ctaText && ctaHref ? (
              <Link
                href={ctaHref}
                className="hidden md:inline-flex items-center px-4 py-2 rounded-full text-[13.5px] font-bold text-navy bg-orange hover:bg-orange-soft transition-colors"
              >
                {ctaText}
              </Link>
            ) : (
              // Penyeimbang lebar agar nav tetap di tengah kapsul saat tidak ada CTA
              <span className="hidden md:block w-8" aria-hidden="true" />
            )}

            {/* Tombol menu mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-ice/80 hover:text-ice hover:bg-ice/10 transition-colors"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isOpen}
              aria-controls="menu-mobile"
            >
              {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>

          {/* Menu mobile: tetap di dalam kapsul */}
          {isOpen && (
            <div
              id="menu-mobile"
              className="md:hidden px-2.5 pb-2.5 pt-1 border-t border-ice/12 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex flex-col gap-0.5 pt-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`py-2.5 px-3 rounded-xl text-[13.5px] font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-ice bg-ice/12"
                        : "text-ice/75 hover:text-ice hover:bg-ice/8"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {ctaText && ctaHref && (
                  <Link
                    href={ctaHref}
                    onClick={() => setIsOpen(false)}
                    className="mt-1.5 py-2.5 px-3 rounded-xl text-[13.5px] font-bold text-navy bg-orange hover:bg-orange-soft transition-colors text-center"
                  >
                    {ctaText}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

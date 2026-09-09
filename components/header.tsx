"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/lib/data"

interface NavItem { label: string; href: string }
interface HeaderProps { navItems: NavItem[]; ctaText?: string; ctaHref?: string }

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <>
      {/* Spacer agar konten tidak tertutup header yang fixed */}
      <div className="h-[70px] md:h-[78px]" aria-hidden="true" />

      <header className="fixed inset-x-0 top-0 z-50 pt-2.5 md:pt-3.5 pointer-events-none">
        <div className="max-w-6xl mx-auto px-3 sm:px-5">
          <div
            className={`pointer-events-auto rounded-2xl md:rounded-full border transition-all duration-300 ${
              scrolled
                ? "bg-white/85 backdrop-blur-xl border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                : "bg-white/70 backdrop-blur-lg border-black/8 shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
            }`}
          >
            <div className="flex justify-between items-center h-14 pl-3.5 pr-2.5 md:pl-5 md:pr-2.5">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Sayba%20Arc.png" alt={siteConfig.name} className="h-8 w-8 rounded-md object-contain transition-opacity group-hover:opacity-80" />
                <span className="font-bold text-base text-black tracking-tight group-hover:text-[#ff914d] transition-colors">{siteConfig.name}</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6 lg:gap-7">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`text-sm font-medium transition-all duration-200 relative group ${isActive(item.href) ? "text-[#ff914d]" : "text-black/60 hover:text-black"}`}>
                    {item.label}
                    <span className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-[#ff914d] transition-all duration-300 ${isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </Link>
                ))}
              </nav>

              {ctaText && ctaHref ? (
                <Link href={ctaHref} className="hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#ff914d] hover:bg-[#e8823e] transition-colors">
                  {ctaText}
                </Link>
              ) : (
                // Penyeimbang lebar agar nav tetap di tengah kapsul saat tidak ada CTA
                <span className="hidden md:block w-8" aria-hidden="true" />
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                }
              </button>
            </div>

            {/* Mobile menu — tetap di dalam kapsul */}
            {isOpen && (
              <div className="md:hidden px-2.5 pb-2.5 pt-1 border-t border-black/8 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-0.5 pt-1.5">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                      className={`py-2 px-3 rounded-xl text-[13px] font-medium transition-colors ${isActive(item.href) ? "text-[#ff914d] bg-orange-50" : "text-black/60 hover:text-black hover:bg-black/5"}`}>
                      {item.label}
                    </Link>
                  ))}
                  {ctaText && ctaHref && (
                    <Link href={ctaHref} onClick={() => setIsOpen(false)} className="mt-1.5 py-2.5 px-3 rounded-xl text-[13px] font-semibold text-white bg-[#ff914d] hover:bg-[#e8823e] transition-colors text-center">
                      {ctaText}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

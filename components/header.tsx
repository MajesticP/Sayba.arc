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
      {/* Tanpa spacer: header melayang di atas section pertama, sehingga
          latarnya mengikuti warna/gambar hero di bawahnya. Setiap halaman
          memberi padding-atas pada section pertamanya agar konten tidak
          tertutup kapsul ini. */}
      {/* Jarak atas dipasang di container dalam, bukan di <header>: globals.css
          punya aturan `header { padding-top: env(safe-area-inset-top) }` tanpa
          @layer, yang presedennya mengalahkan utility Tailwind. Dengan begini
          safe-area untuk ponsel berponi tetap jalan dan jarak ini tetap terpakai. */}
      <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
              <div className="max-w-6xl mx-auto px-3 sm:px-5 pt-4 md:pt-6">
                <div
                  className={`pointer-events-auto rounded-2xl md:rounded-full border transition-all duration-300 ${
                    scrolled
                      ? "bg-black/85 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                      : "bg-black/50 backdrop-blur-lg border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  <div className="flex justify-between items-center h-14 pl-3.5 pr-2.5 md:pl-5 md:pr-2.5">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0 relative w-[180px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo-256.png" alt={siteConfig.name} width={32} height={32} fetchPriority="high" decoding="async" className="h-7 w-7 md:h-8 md:w-8 rounded-md object-contain transition-opacity group-hover:opacity-80 shrink-0 brightness-200" />
                      <div className="relative h-5 md:h-6 overflow-hidden w-full">
                        <div className="absolute inset-x-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.87,0,0.13,1)]" style={{ transform: `translateY(${textIdx === 0 ? "0" : "-50%"})` }}>
                          <span className="font-extrabold text-[12px] md:text-[14px] text-white tracking-tight group-hover:text-[#ea580c] transition-colors h-5 md:h-6 flex items-center">SAYBA ARC</span>
                          <span className="font-extrabold text-[12px] md:text-[14px] text-white tracking-tight group-hover:text-[#ea580c] transition-colors h-5 md:h-6 flex items-center">ART YOU BELIEVE</span>
                        </div>
                      </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-7 lg:gap-9">
                      {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={`text-[12px] uppercase tracking-wider font-bold transition-all duration-200 relative group ${isActive(item.href) ? "text-[#ea580c]" : "text-white/50 hover:text-white"}`}>
                          {item.label}
                          <span className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-[#ea580c] transition-all duration-300 ${isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
                        </Link>
                      ))}
                    </nav>

                    {ctaText && ctaHref ? (
                      <Link href={ctaHref} className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-bold text-black bg-white hover:bg-[#ea580c] hover:text-white transition-colors">
                        {ctaText}
                      </Link>
                    ) : (
                      // Penyeimbang lebar agar nav tetap di tengah kapsul saat tidak ada CTA
                      <span className="hidden md:block w-8" aria-hidden="true" />
                    )}

                    {/* Mobile toggle */}
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
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
                          <div className="md:hidden px-2.5 pb-2.5 pt-1 border-t border-white/8 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col gap-0.5 pt-1.5">
                              {navItems.map((item) => (
                                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                                  className={`py-2 px-3 rounded-xl text-[13px] font-medium transition-colors ${isActive(item.href) ? "text-[#ea580c] bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                                  {item.label}
                                </Link>
                              ))}
                              {ctaText && ctaHref && (
                                <Link href={ctaHref} onClick={() => setIsOpen(false)} className="mt-1.5 py-2.5 px-3 rounded-xl text-[13px] font-semibold text-black bg-white hover:bg-[#ea580c] hover:text-white transition-colors text-center">
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

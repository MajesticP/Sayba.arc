"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/lib/data"

interface NavItem { label: string; href: string }
interface HeaderProps { navItems: NavItem[]; ctaText?: string; ctaHref?: string }

export default function Header({ navItems, ctaText, ctaHref }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-black/8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Sayba%20Arc.png" alt={siteConfig.name} className="h-8 w-8 rounded-md object-contain transition-opacity group-hover:opacity-80" />
            <span className="font-bold text-base text-black tracking-tight group-hover:text-[#ff914d] transition-colors">{siteConfig.name}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`text-sm font-medium transition-all duration-200 relative group ${pathname === item.href ? "text-[#ff914d]" : "text-black/60 hover:text-black"}`}>
                {item.label}
                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#ff914d] transition-all duration-300 ${pathname === item.href ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            ))}
          </nav>

          {ctaText && ctaHref && (
            <Link href={ctaHref} className="hidden md:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#ff914d] hover:bg-[#e8823e] transition-colors">
              {ctaText}
            </Link>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-black/60 hover:text-black transition-colors p-1" aria-label="Toggle menu">
            {isOpen
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-black/8 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                  className={`py-2 px-3 rounded-lg text-[13px] font-medium transition-colors ${pathname === item.href ? "text-[#ff914d] bg-orange-50" : "text-black/60 hover:text-black hover:bg-black/5"}`}>
                  {item.label}
                </Link>
              ))}
              {ctaText && ctaHref && (
                <Link href={ctaHref} onClick={() => setIsOpen(false)} className="mt-1.5 py-2.5 px-3 rounded-lg text-[13px] font-semibold text-white bg-[#ff914d] hover:bg-[#e8823e] transition-colors text-center">
                  {ctaText}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

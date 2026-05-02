"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/lib/data"

interface NavItem {
  label: string
  href: string
}

interface HeaderProps {
  navItems: NavItem[]
  ctaText?: string
  ctaHref?: string
}

export default function Header({
  navItems,
  ctaText = "Hubungi Kami",
  ctaHref = "/contact",
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-black/8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#ff914d] flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <span className="font-bold text-lg text-black tracking-tight group-hover:text-[#ff914d] transition-colors duration-200">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-200 relative group ${
                  pathname === item.href ? "text-[#ff914d]" : "text-black/60 hover:text-black"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#ff914d] transition-all duration-300 ${
                    pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link
              href={ctaHref}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-black text-white hover:bg-[#ff914d] transition-all duration-200"
            >
              {ctaText}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black/60 hover:text-black transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-black/8 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-[#ff914d] bg-orange-50"
                      : "text-black/60 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={ctaHref}
                onClick={() => setIsOpen(false)}
                className="mt-2 py-2.5 px-3 rounded-lg text-sm font-semibold bg-black text-white text-center hover:bg-[#ff914d] transition-colors"
              >
                {ctaText}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

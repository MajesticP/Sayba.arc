"use client"

import Link from "next/link"
import { useContent } from "@/lib/i18n"

export default function About() {
  const { about } = useContent()

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-6">
              {about.title}
            </h2>
            <p className="text-black/55 text-base md:text-lg leading-relaxed mb-8">
              {about.description}
            </p>
            <Link
              href={about.buttonHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-[#ff914d] transition-all duration-200"
            >
              {about.buttonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right — stat grid */}
          <div className="grid grid-cols-2 gap-4">
            {about.stats.map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-black/8 bg-black/[0.02] hover:border-[#ff914d]/30 hover:bg-[#ff914d]/[0.03] transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold text-black mb-1">{stat.value}</div>
                <div className="text-sm text-black/45 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useContent } from "@/lib/i18n"

export default function Hero() {
  const data = useContent()
  const { hero, siteConfig } = data

  return (
    <section className="relative overflow-hidden bg-[#0A1628] text-white py-12 md:py-32">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ff914d]/30 bg-[#ff914d]/10 text-[#ff914d] text-xs font-semibold tracking-wider uppercase mb-5 md:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
            {hero.badge}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-4 md:mb-6">
            {siteConfig.name}
            <span className="block text-[#ff914d] mt-1">{siteConfig.tagline}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-base md:text-xl leading-relaxed max-w-2xl mb-7 md:mb-10">
            {hero.subtitle}
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href={hero.primaryButton.href}
              className="px-6 py-3 rounded-xl bg-[#ff914d] text-white font-semibold text-sm hover:bg-[#ff7a2e] transition-all duration-200 shadow-lg shadow-[#ff914d]/20 text-center"
            >
              {hero.primaryButton.text}
            </Link>
            <Link
              href={hero.secondaryButton.href}
              className="px-6 py-3 rounded-xl border border-white/20 text-white/80 font-semibold text-sm hover:border-white/50 hover:text-white transition-all duration-200 text-center"
            >
              {hero.secondaryButton.text}
            </Link>
          </div>

          {/* Dept pills — mobile inline, desktop floating */}
          <div className="flex flex-wrap gap-2 mt-7 lg:hidden">
            {[data.arcgisDepartment, data.itDepartment, data.oceanicDepartment].map((dept) => (
              <div
                key={dept.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d]" />
                <span className="text-white/60 text-xs font-medium">{dept.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating dept pills — desktop only */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3">
          {[data.arcgisDepartment, data.itDepartment, data.oceanicDepartment].map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#ff914d]" />
              <span className="text-white/70 text-sm font-medium">{dept.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

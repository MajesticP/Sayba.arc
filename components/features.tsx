"use client"

import PageTransition from "@/components/page-transition"
import { DynamicIcon } from "@/lib/dynamic-icon"

interface FeatureItem {
  icon: string
  title: string
  description: string
}

interface FeaturesProps {
  title: string
  subtitle: string
  items: FeatureItem[]
}

export default function Features({ title, subtitle, items }: FeaturesProps) {
  return (
    <section className="py-14 md:py-24 bg-black" id="features">
      <PageTransition delay={200}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3">Keunggulan Kami</span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">{title}</h2>
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto">{subtitle}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-5">
            {items.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/8 hover:border-[#ff914d]/30 rounded-xl md:rounded-2xl p-3 md:p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-[#ff914d]/20 flex items-center justify-center mb-2 md:mb-4 group-hover:bg-[#ff914d]/30 transition-colors duration-300">
                  <DynamicIcon name={feature.icon} color="#ff914d" size={18} />
                </div>
                <h3 className="text-white font-bold text-xs md:text-base mb-1 md:mb-2 leading-snug">{feature.title}</h3>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    </section>
  )
}

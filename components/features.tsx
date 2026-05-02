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
    <section className="py-24 bg-black" id="features">
      <PageTransition delay={200}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3">Keunggulan Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">{subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/8 hover:border-[#ff914d]/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-[#ff914d]/20 flex items-center justify-center mb-4 group-hover:bg-[#ff914d]/30 transition-colors duration-300">
                  <DynamicIcon name={feature.icon} color="#ff914d" size={22} />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    </section>
  )
}

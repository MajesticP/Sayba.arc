"use client"

import Link from "next/link"
import PageTransition from "@/components/page-transition"

interface CTAData {
  title: string
  subtitle: string
  buttonText: string
  buttonHref: string
}

interface CTAProps {
  data: CTAData
}

export default function CTA({ data }: CTAProps) {
  return (
    <section className="py-14 md:py-24 bg-[#f7f7f7]" id="cta">
      <PageTransition delay={400}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#ff914d] opacity-[0.08] blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#ff914d] opacity-[0.05] blur-3xl pointer-events-none" />
            {/* Orange line accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#ff914d] rounded-full" />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">{data.title}</h2>
              <p className="text-white/45 text-base md:text-lg mb-7 md:mb-10 max-w-2xl mx-auto">{data.subtitle}</p>
              <Link
                href={data.buttonHref}
                className="inline-block px-10 py-4 rounded-xl font-bold text-base bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105"
              >
                {data.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </PageTransition>
    </section>
  )
}

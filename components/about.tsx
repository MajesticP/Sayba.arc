"use client"

import Link from "next/link"
import PageTransition from "@/components/page-transition"

interface AboutData {
  title: string
  description: string
  stats: Array<{ value: string; label: string }>
  buttonText: string
  buttonHref: string
}

interface AboutProps {
  data: AboutData
}

export default function About({ data }: AboutProps) {
  return (
    <section className="py-10 md:py-24 bg-white" id="about">
      <PageTransition delay={300}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 items-center">
            {/* Stats panel */}
            <div className="relative">
              <div className="bg-black rounded-3xl p-6 md:p-10">
                <div className="grid grid-cols-2 gap-3 md:gap-5">
                  {data.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white/[0.05] rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/8 hover:border-[#ff914d]/30 transition-colors duration-300"
                    >
                      <div className="text-2xl md:text-3xl font-bold text-[#ff914d] mb-0.5 md:mb-1">{stat.value}</div>
                      <div className="text-white/40 text-xs md:text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini map */}
                <div className="mt-6 rounded-xl bg-white/[0.04] border border-white/8 p-4 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,145,77,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.4) 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                    }}
                  />
                  <svg className="w-full h-24 relative z-10 opacity-80" viewBox="0 0 300 100">
                    <polygon points="30,20 100,10 150,40 120,80 20,70" fill="rgba(255,145,77,0.2)" stroke="rgba(255,145,77,0.6)" strokeWidth="1" />
                    <polygon points="130,30 220,20 270,60 230,90 100,75" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                    <circle cx="75" cy="45" r="5" fill="#ff914d" />
                    <circle cx="75" cy="45" r="10" fill="#ff914d" opacity="0.3" />
                    <circle cx="190" cy="55" r="4" fill="white" opacity="0.5" />
                  </svg>
                  <div className="text-xs text-white/30 text-center mt-1 relative z-10">Kalimantan Barat, Indonesia</div>
                </div>
              </div>

              {/* Orange accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-[#ff914d] opacity-15 -z-10" />
            </div>

            {/* Text */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <span className="inline-block text-xs font-bold text-[#ff914d] uppercase tracking-widest mb-3">Tentang Kami</span>
                <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">{data.title}</h2>
              </div>
              <p className="text-black/55 text-sm md:text-lg leading-relaxed">{data.description}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={data.buttonHref}
                  className="px-6 py-3 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105"
                >
                  {data.buttonText}
                </Link>
                <Link
                  href="/services"
                  className="px-6 py-3 rounded-xl font-semibold bg-black text-white hover:bg-black/80 transition-all duration-200 hover:scale-105"
                >
                  Layanan Kami
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </section>
  )
}

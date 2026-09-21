import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import CuttingBoardBackground from "@/components/cutting-board-bg"

interface HeroData {
  title: string
  subtitle: string
  primaryButton: { text: string; href: string }
  secondaryButton: { text: string; href: string }
  badge?: string
}

/** Tiga fakta yang bisa diverifikasi, bukan klaim pemasaran. */
const FACTS = [
  { value: "2", label: "Departemen" },
  { value: "2025", label: "Berdiri sejak" },
  { value: "100%", label: "Berkas sumber" },
]

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative overflow-hidden bg-carbon">
      <CuttingBoardBackground tone="dark" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[104px] pb-16 md:pt-40 md:pb-24 text-center">
        {data.badge && (
          <p className="animate-fade-in stagger-1 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-[12px] font-medium text-powder mb-6">
            <MapPin className="w-3.5 h-3.5 text-steel" aria-hidden="true" />
            {data.badge}
          </p>
        )}

        <h1 className="animate-blur-in stagger-2 text-[28px] leading-[1.15] sm:text-4xl lg:text-[48px] font-bold tracking-tight text-platinum mb-5">
          {data.title}
        </h1>

        <p className="animate-fade-in-up stagger-3 text-[14px] md:text-lg leading-relaxed text-steel max-w-2xl mx-auto mb-8">
          {data.subtitle}
        </p>

        <div className="animate-fade-in-up stagger-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12">
          <Link
            href={data.primaryButton.href}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-powder text-carbon text-[14px] font-semibold hover:bg-white transition-colors"
          >
            {data.primaryButton.text}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href={data.secondaryButton.href}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-platinum text-[14px] font-semibold hover:bg-white/[0.06] transition-colors"
          >
            {data.secondaryButton.text}
          </Link>
        </div>

        {/* Garis ukur dengan tiga titik data — menggantikan kartu statistik mengambang */}
        <div className="animate-fade-in stagger-5 relative max-w-2xl mx-auto">
          <div className="rule-line text-steel" aria-hidden="true" />
          <dl className="grid grid-cols-3 gap-4 pt-5">
            {FACTS.map((fact) => (
              <div key={fact.label} className="text-center">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="block text-[20px] md:text-2xl font-bold text-platinum tabular-nums">
                    {fact.value}
                  </span>
                  <span className="block text-[11px] text-steel mt-0.5">{fact.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

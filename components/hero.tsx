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

/**
 * Tiga fakta yang bisa diverifikasi. Tidak ada angka pemasaran di sini:
 * jumlah departemen dan tahun berdiri bisa dicek, dan klaim "100% berkas
 * sumber" adalah janji kerja yang tertulis di setiap KAK.
 */
const FACTS = [
  { value: "02", label: "Departemen" },
  { value: "2025", label: "Berdiri sejak" },
  { value: "100%", label: "Berkas sumber" },
]

export default function Hero({ data }: { data: HeroData }) {
  return (
    <section className="relative overflow-hidden bg-navy">
      <CuttingBoardBackground tone="dark" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[104px] pb-16 md:pt-40 md:pb-24 text-center">
        {data.badge && (
          <p className="animate-fade-in stagger-1 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ice/15 bg-ice/[0.04] text-[12px] font-medium text-ice/80 mb-6">
            <MapPin className="w-3.5 h-3.5 text-orange" aria-hidden="true" />
            {data.badge}
          </p>
        )}

        <h1 className="animate-blur-in stagger-2 text-[28px] leading-[1.15] sm:text-4xl lg:text-[48px] font-bold tracking-tight text-ice mb-5">
          {data.title}
        </h1>

        {/* Garis dimensi seperti pada gambar teknik: menandai lebar kolom teks.
            Fungsinya membingkai judul, bukan dekorasi. */}
        <div className="animate-draw-line stagger-3 flex items-center justify-center gap-2 max-w-xs mx-auto mb-5" aria-hidden="true">
          <span className="h-2 w-px bg-orange/60" />
          <span className="h-px flex-1 bg-orange/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-orange" />
          <span className="h-px flex-1 bg-orange/40" />
          <span className="h-2 w-px bg-orange/60" />
        </div>

        <p className="animate-fade-in-up stagger-4 text-[14px] md:text-lg leading-relaxed text-ice/75 max-w-2xl mx-auto mb-8">
          {data.subtitle}
        </p>

        <div className="animate-fade-in-up stagger-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12">
          <Link
            href={data.primaryButton.href}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange text-navy text-[14px] font-bold hover:bg-orange-soft transition-colors"
          >
            {data.primaryButton.text}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href={data.secondaryButton.href}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-ice/25 text-ice text-[14px] font-semibold hover:bg-ice/[0.08] transition-colors"
          >
            {data.secondaryButton.text}
          </Link>
        </div>

        {/* Spesifikasi ringkas, disusun seperti kolom lembar data teknik */}
        <div className="animate-fade-in stagger-6 relative max-w-2xl mx-auto">
          <div className="rule-line text-ice/70" aria-hidden="true" />
          <dl className="grid grid-cols-3 gap-4 pt-5">
            {FACTS.map((fact) => (
              <div key={fact.label} className="text-center">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="block text-[20px] md:text-2xl font-bold text-ice tabular-nums">
                    {fact.value}
                  </span>
                  <span className="block text-[11px] text-ice/65 mt-0.5">{fact.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { CheckCircle2, Cpu } from "lucide-react"

interface Props {
  features: string[]
  techStack: string[]
  /** Warna departemen. Dipakai sebagai GARIS dan TINT saja, bukan warna teks:
      sebagian warna departemen gagal kontras bila dipakai menulis di latar
      terang (orange mentah 2.79:1). Teks selalu memakai warna palet. */
  accent: string
}

/**
 * FeatureTabs: daftar fitur dan teknologi sebuah proyek, dipisah dua tab.
 *
 * Warna departemen hanya muncul pada garis bawah tab aktif, tint lingkaran
 * ikon, dan warna ikonnya. Label tab dan isi daftar memakai navy, sehingga
 * kontrasnya tetap lolos berapa pun warna departemennya.
 */
export default function FeatureTabs({ features, techStack, accent }: Props) {
  const tabs = [
    ...(features.length > 0 ? [{ id: "features", label: "Fitur" }] : []),
    ...(techStack.length > 0 ? [{ id: "tech", label: "Teknologi" }] : []),
  ]

  const [active, setActive] = useState(tabs[0]?.id ?? "features")

  if (tabs.length === 0) return null

  const ikonWarna = accent === "#f07a26" ? "#b45610" : accent

  return (
    <div>
      {/* Tab: label selalu navy, penanda aktif adalah garis bawah berwarna
          departemen. Menandai posisi dengan garis lebih jelas daripada
          mengubah warna teks, dan tidak mengorbankan kontras. */}
      <div className="flex gap-1 border-b border-ice-line mb-6" role="tablist">
        {tabs.map((tab) => {
          const aktif = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => setActive(tab.id)}
              className={`relative min-h-[44px] px-5 md:px-7 py-3 font-bold text-[13.5px] md:text-sm transition-colors duration-200 ${
                aktif ? "text-navy" : "text-slate-brand hover:text-navy"
              }`}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t transition-transform duration-300"
                style={{
                  backgroundColor: accent,
                  transform: aktif ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Isi: satu komponen untuk kedua tab supaya tidak ada kode kembar. */}
      {tabs.map((tab) => {
        if (active !== tab.id) return null
        const items = tab.id === "features" ? features : techStack
        const Ikon = tab.id === "features" ? CheckCircle2 : Cpu
        return (
          <div key={tab.id} className="flex flex-col gap-2.5 animate-fade-in">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 rounded-xl px-4 md:px-5 py-3.5 md:py-4 bg-ice-dim border border-ice-line hover:border-orange/40 transition-colors duration-150"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${accent}1f` }}
                >
                  <Ikon size={15} style={{ color: ikonWarna }} aria-hidden="true" />
                </div>
                <span className="text-ink font-medium text-[13px] md:text-[14.5px] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * BagianLipat: kelompok kolom form yang bisa dibuka-tutup.
 *
 * Gunanya supaya form admin tetap ringkas. Kolom yang hampir selalu dibiarkan
 * apa adanya (penulis, tanggal, status, tag, ikon, galeri) tidak ikut memakan
 * tempat, tetapi tetap ada dan tetap bisa diubah. Penulis membuka sendiri
 * bagian yang sedang ia kerjakan.
 *
 * Saat tertutup, `ringkas` menampilkan isi pentingnya sekilas, supaya penulis
 * tidak perlu membuka bagian hanya untuk memeriksa keadaannya.
 *
 * `awalBuka` untuk bagian yang isinya perlu terlihat sejak awal — mis. bagian
 * yang sudah berisi data pada item yang sedang diedit. Nilainya HARUS dihitung
 * dari prop data yang sedang diedit, bukan dari state form: saat modal baru
 * dibuka, state form masih berisi data item sebelumnya.
 */
export default function BagianLipat({ label, ringkas, awalBuka = false, children }: {
  label: string
  ringkas?: string
  awalBuka?: boolean
  children: React.ReactNode
}) {
  const [buka, setBuka] = useState(awalBuka)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setBuka(v => !v)}
        aria-expanded={buka}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <ChevronDown
          size={13}
          className={cn("text-white/30 flex-shrink-0 transition-transform", buka && "rotate-180")}
        />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/45">{label}</span>
        {ringkas && !buka && (
          <span className="text-[10.5px] text-white/25 truncate ml-1">{ringkas}</span>
        )}
        <span className="ml-auto text-[10.5px] text-white/25 flex-shrink-0">{buka ? "Tutup" : "Buka"}</span>
      </button>

      {buka && (
        <div className="px-3.5 pb-3.5 space-y-3 border-t border-white/[0.06] pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

import { Braces, Database, DraftingCompass, MapPinned, Ruler, Server } from "lucide-react"

/**
 * HeroCapabilities: dua kolom isi pekerjaan di bawah judul hero.
 *
 * Gunanya menjawab pertanyaan pertama pengunjung: "IT-nya apa, engineering-nya
 * apa?" Judul hero menyebut dua bidang sekaligus, jadi dua bidang itu perlu
 * ditunjukkan bentuk pekerjaannya, bukan hanya disebut.
 *
 * Bentuknya sengaja seperti daftar gambar (bill of materials) di lembar
 * teknik: label kolom, nomor urut, nama bagian. Bukan kartu ikon bergaya
 * pemasaran, karena tidak ada satu pun baris di sini yang tidak bisa
 * dicocokkan dengan layanan yang benar-benar dikerjakan.
 *
 * Warnanya memakai token yang sama dengan sisa panel gelap. Ikon oranye
 * dipakai dua kali saja (satu per kolom) supaya tetap di bawah jatah 10%
 * aksen; sisanya netral ice.
 */

interface Baris {
  /** Nomor bagian, seperti nomor butir di daftar gambar teknik. */
  no: string
  label: string
  icon: typeof Braces
}

const KOLOM: { judul: string; keterangan: string; baris: Baris[] }[] = [
  {
    judul: "IT",
    keterangan: "Perangkat lunak & data",
    baris: [
      { no: "01", label: "Web & aplikasi internal", icon: Braces },
      { no: "02", label: "Basis data & API", icon: Database },
      { no: "03", label: "Deployment & server", icon: Server },
    ],
  },
  {
    judul: "Engineering",
    keterangan: "Pemetaan & dokumen teknik",
    baris: [
      { no: "04", label: "Pemetaan spasial (GIS)", icon: MapPinned },
      { no: "05", label: "Gambar teknik 2D & 3D", icon: DraftingCompass },
      { no: "06", label: "Ukur & olah data lapangan", icon: Ruler },
    ],
  },
]

export default function HeroCapabilities() {
  return (
    <div className="animate-fade-in stagger-6 relative">
      {/* Garis ukur yang sama dengan strip fakta di atasnya, jadi kedua blok
          terbaca sebagai satu lembar data, bukan dua bagian terpisah. */}
      <div className="rule-line text-ice/70" aria-hidden="true" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 pt-5 text-left">
        {KOLOM.map((kolom) => (
          <section key={kolom.judul} className="min-w-0">
            <h2 className="flex items-baseline gap-2 mb-2.5">
              <span className="text-[12px] font-bold tracking-[0.14em] uppercase text-ice">
                {kolom.judul}
              </span>
              <span className="text-[11px] text-ice/75 truncate">{kolom.keterangan}</span>
            </h2>

            <ul className="space-y-1.5">
              {kolom.baris.map((baris) => {
                const Icon = baris.icon
                return (
                  <li key={baris.no} className="flex items-center gap-2.5">
                    <span className="w-4 shrink-0 text-[10.5px] font-bold tabular-nums text-orange-soft">
                      {baris.no}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0 text-ice/60" aria-hidden="true" />
                    <span className="text-[12.5px] md:text-[13px] text-ice/85 leading-snug">
                      {baris.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

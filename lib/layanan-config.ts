/**
 * ── KONFIGURASI DEPARTEMEN LAYANAN ───────────────────────────────────────────
 *
 * SAYBA ARC punya DUA departemen tetap:
 *   1. IT Consultant: pengembangan digital & sistem informasi
 *   2. Engineering Consultant: pemetaan spasial, rancang bangun, gambar teknik
 *
 * Departemen bersifat TETAP (tidak diubah dari admin). Yang dikelola admin
 * adalah daftar LAYANAN di dalam tiap departemen.
 *
 * Nilai `value` disimpan di kolom `dept` tabel `layanan`, jadi jangan diubah
 * tanpa migrasi database.
 */

export interface LayananDept {
  /** Disimpan di DB: harus cocok dengan kolom `dept` */
  value: string
  /** Label yang tampil di UI */
  label: string
  /** Penjelasan singkat departemen */
  description: string
  /** Warna aksen dari palet (lihat DESIGN.md) */
  color: string
  /** Ringkasan lingkup kerja */
  scope: string[]
}

export const LAYANAN_DEPTS: LayananDept[] = [
  {
    value: "it_konsulting",
    label: "IT Consultant",
    description:
      "Pengembangan perangkat lunak, sistem informasi, dan infrastruktur digital yang dipakai sehari-hari oleh tim Anda.",
    color: "#f07a26",
    scope: [
      "Website & aplikasi web",
      "Aplikasi mobile & desktop",
      "Backend, API, dan basis data",
      "Machine learning & analisis data",
      "Cloud, deployment, dan pemeliharaan",
    ],
  },
  {
    value: "engineering_konsulting",
    label: "Engineering Consultant",
    description:
      "Pemetaan spasial, rancang bangun, dan dokumen teknik yang siap dipakai untuk perizinan maupun pelaksanaan lapangan.",
    color: "#5a5c62",
    scope: [
      "Pemetaan & analisis spasial (GIS)",
      "Gambar teknik 2D & 3D (AutoCAD)",
      "Desain rancang bangun",
      "Survey dan pengolahan data lapangan",
      "Dokumen teknis & laporan",
    ],
  },
]

/** Cari departemen berdasarkan value */
export const getDept = (value: string): LayananDept | undefined =>
  LAYANAN_DEPTS.find((d) => d.value === value)

/** Label departemen; fallback: ubah "foo_bar" jadi "Foo Bar" */
export const getDeptLabel = (value: string): string =>
  getDept(value)?.label ??
  value
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

/** Warna aksen departemen */
export const getDeptColor = (value: string): string =>
  getDept(value)?.color ?? "#5a5c62"

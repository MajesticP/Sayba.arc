/**
 * ── LAYANAN DEPT CONFIG ──────────────────────────────────────────────────────
 * 
 * To add a new dept/layanan type:
 *   1. Add a new entry to LAYANAN_DEPTS below
 *   2. That's it — dashboard, filters, badges, forms all update automatically
 *
 * To add sub-categories for a dept:
 *   Edit the `subCategories` array for that dept.
 *   These appear as quick-pick chips in the Add/Edit Layanan modal.
 */

export interface LayananDept {
  /** Stored in the DB — must match what's in Supabase */
  value: string
  /** Human-readable label shown in UI */
  label: string
  /** Short description shown in tooltips / section headers */
  description?: string
  /** Tailwind color classes for the badge */
  badgeClass: string
  /** Hex color for icons / accents */
  color: string
  /** Sub-category suggestions shown in modal (admin can still type a custom one) */
  subCategories: string[]
}

export const LAYANAN_DEPTS: LayananDept[] = [
  {
    value: "arcgis",
    label: "Geospasial & Lingkungan",
    description: "Pemetaan ArcGIS, analisis spasial, dan penginderaan jauh untuk kebutuhan lingkungan dan tata ruang",
    badgeClass: "bg-[#ff914d]/10 text-[#ff914d] ring-[#ff914d]/20",
    color: "#ff914d",
    subCategories: [
      "Pemetaan ArcGIS",
      "Analisis Spasial",
      "Penginderaan Jauh",
      "Manajemen Geodata",
      "Web GIS",
      "Pengumpulan Data Lapangan",
    ],
  },
  {
    value: "it",
    label: "Digital & Perangkat Lunak",
    description: "Pengembangan web, mobile, machine learning, data science, sistem informasi, dan UI/UX",
    badgeClass: "bg-blue-400/10 text-blue-400 ring-blue-400/20",
    color: "#60a5fa",
    subCategories: [
      "Web Development",
      "Mobile App",
      "Machine Learning",
      "Data Science",
      "Sistem Informasi",
      "UI/UX Design",
    ],
  },
  {
    value: "kelautan",
    label: "Kelautan & Perkapalan",
    description: "Gambar teknik kapal 2D — desain lambung, lines plan, konstruksi, general arrangement, dan outfitting",
    badgeClass: "bg-[#0a8a6e]/10 text-[#0a8a6e] ring-[#0a8a6e]/20",
    color: "#0a8a6e",
    subCategories: [
      "Desain Lambung 2D",
      "Lines Plan",
      "Gambar Konstruksi",
      "General Arrangement",
      "Tata Letak Akomodasi",
      "Outfitting & Sistem",
    ],
  },

  // ── ADD MORE SERVICE LINES HERE ──────────────────────────────────────────
  // Example: uncomment and edit to add a 4th service line
  // {
  //   value: "survey",
  //   label: "Survei & Drone",
  //   description: "Survei lapangan, fotogrametri udara, dan pemetaan dengan drone",
  //   badgeClass: "bg-purple-400/10 text-purple-400 ring-purple-400/20",
  //   color: "#a78bfa",
  //   subCategories: ["Aerial Photography", "LiDAR Scan", "Topografi", "Peta Drone"],
  // },
]

/** Lookup helpers */
export const getDept = (value: string): LayananDept | undefined =>
  LAYANAN_DEPTS.find((d) => d.value === value)

export const getDeptLabel = (value: string): string =>
  getDept(value)?.label ??
  value.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

export const getDeptColor = (value: string): string =>
  getDept(value)?.color ?? "#888"

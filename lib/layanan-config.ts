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
    label: "ArcGIS",
    description: "Departemen Teknik Lingkungan & Pemetaan",
    badgeClass:
      "bg-[#ff914d]/10 text-[#ff914d] ring-[#ff914d]/20",
    color: "#ff914d",
    subCategories: [
      "Web GIS",
      "Desktop GIS",
      "3D Mapping",
      "Spatial Analysis",
      "Training & Workshop",
      "Data Processing",
    ],
  },
  {
    value: "it",
    label: "IT",
    description: "Departemen Teknologi Informasi & Digital",
    badgeClass: "bg-blue-400/10 text-blue-400 ring-blue-400/20",
    color: "#60a5fa",
    subCategories: [
      "Web Development",
      "Mobile App",
      "Backend & API",
      "UI/UX Design",
      "Cloud & DevOps",
      "Cybersecurity",
    ],
  },
  {
    value: "kelautan",
    label: "Kelautan",
    description: "Departemen Teknik Kelautan & Perkapalan",
    badgeClass: "bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20",
    color: "#0a6e8a",
    subCategories: [
      "Desain Kapal",
      "Analisis Hidrodinamika",
      "Survey Batimetri",
      "Manajemen Pelabuhan",
      "Konsultasi Kelautan",
    ],
  },

  {
    value: "softwarejailbreak",
    label: "Software Jailbreak",
    description: "Departemen Software & Jailbreak",
    badgeClass: "bg-purple-400/10 text-purple-400 ring-purple-400/20",
    color: "#a78bfa",
    subCategories: ["Oprek HP", "Custom ROM", "Unlock Bootloader", "Firmware Flash"],
  },

  // ── ADD MORE TYPES HERE ─────────────────────────────────────────────────
  // Example:
  // {
  //   value: "survey",
  //   label: "Survey & Drone",
  //   description: "Departemen Survei Lapangan & Fotogrametri",
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

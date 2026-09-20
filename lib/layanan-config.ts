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
    value: "it_konsulting",
    label: "IT Konsulting",
    description: "Departemen Teknologi Informasi & Digital",
    badgeClass: "bg-blue-400/10 text-blue-400 ring-blue-400/20",
    color: "#60a5fa",
    subCategories: [
      "Web Development",
      "Mobile Application",
      "System Integration",
      "Machine Learning",
      "Data Analytics",
    ],
  },
  {
    value: "engineering_konsulting",
    label: "Engineering Konsulting",
    description: "Departemen Rekayasa & Rancang Teknik",
    badgeClass: "bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20",
    color: "#0a6e8a",
    subCategories: [
      "GIS & Pemetaan",
      "IoT Development",
      "Firmware Engineering",
      "Perencanaan Teknis",
    ],
  },
]

/** Lookup helpers */
export const getDept = (value: string): LayananDept | undefined =>
  LAYANAN_DEPTS.find((d) => d.value === value)

export const getDeptLabel = (value: string): string =>
  getDept(value)?.label ??
  value.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

export const getDeptColor = (value: string): string =>
  getDept(value)?.color ?? "#888"

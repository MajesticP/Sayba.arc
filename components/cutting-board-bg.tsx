/**
 * CuttingBoardBackground: motif meja potong arsitek.
 *
 * Motif identitas SAYBA ARC. Terinspirasi meja potong self-healing yang
 * dipakai drafter: kisi ukur, tanda registrasi di sudut, dan garis skala.
 *
 * Dua mode pemakaian:
 *
 *  - `variant="page"`, latar HALAMAN PENUH, dipasang sekali di layout.
 *    Posisinya fixed sehingga meja potong tetap di tempatnya saat halaman
 *    digulir. Section di atasnya mengambang sebagai panel (lihat
 *    `BoardSection`), jadi tepi meja tetap terlihat di sela-sela section
 *    dan latar terasa konsisten dari atas sampai bawah halaman.
 *
 *  - `variant="section"`, latar untuk satu section gelap (hero, CTA).
 *
 * Prinsip: sangat tipis, tidak menutupi teks, tidak ada orb atau glow.
 */

interface Props {
  /** "page" = latar halaman penuh (fixed). "section" = latar satu section. */
  variant?: "page" | "section"
  /** Nada garis. Hanya berlaku untuk variant="section". */
  tone?: "dark" | "light"
  className?: string
}

export default function CuttingBoardBackground({
  variant = "section",
  tone = "dark",
  className = "",
}: Props) {
  // ── Mode halaman penuh: satu elemen fixed di belakang seluruh konten ──
  if (variant === "page") {
    return (
      <div aria-hidden="true" className={`board-page ${className}`}>
        {/* Tanda registrasi sudut layar, seperti tanda potong di meja cetak.
            Hanya di layar lebar supaya tidak berdesakan di ponsel. */}
        <div className="hidden md:block">
          <span className="reg-mark top-5 left-5" style={{ color: "rgba(17,42,70,0.35)" }} />
          <span className="reg-mark top-5 right-5 rotate-90" style={{ color: "rgba(17,42,70,0.35)" }} />
          <span className="reg-mark bottom-5 left-5 -rotate-90" style={{ color: "rgba(17,42,70,0.35)" }} />
          <span className="reg-mark bottom-5 right-5 rotate-180" style={{ color: "rgba(17,42,70,0.35)" }} />
        </div>
      </div>
    )
  }

  // ── Mode section: kisi + tanda registrasi + sapuan pisau potong ──
  const lineColor = tone === "dark" ? "rgba(244,246,249,0.30)" : "rgba(17,42,70,0.30)"

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className={`absolute inset-0 ${tone === "dark" ? "cutting-grid-dark" : "cutting-grid"}`} />

      <div className="hidden md:block">
        <span className="reg-mark top-6 left-6" style={{ color: lineColor }} />
        <span className="reg-mark top-6 right-6 rotate-90" style={{ color: lineColor }} />
        <span className="reg-mark bottom-6 left-6 -rotate-90" style={{ color: lineColor }} />
        <span className="reg-mark bottom-6 right-6 rotate-180" style={{ color: lineColor }} />
      </div>

      {/* Sapuan pisau potong: satu garis tipis melintas lambat. Menandai
          bahwa ini "meja kerja", bukan dekorasi. Berhenti saat reduce motion. */}
      <div className="absolute inset-x-0 top-1/3 h-px overflow-hidden">
        <div
          className="h-full w-1/3 animate-sweep"
          style={{
            background: `linear-gradient(90deg, transparent, ${lineColor}, transparent)`,
            opacity: 0.35,
          }}
        />
      </div>
    </div>
  )
}

/**
 * BoardSection: satu section sebagai lembar kerja yang mengambang di atas meja.
 *
 * Dipakai untuk membungkus section di beranda dan halaman lain. Celah kiri
 * dan kanan sengaja dibiarkan terbuka supaya permukaan meja tetap terlihat,
 * sehingga latar terasa menyatu dari atas sampai bawah halaman. Panelnya
 * solid, bukan transparan, supaya teks selalu terbaca di atas permukaan yang
 * pasti dan tidak ada warna teks yang jatuh di atas warna yang salah.
 *
 * `dots` menampilkan titik jendela di pojok kiri atas, penanda bahwa lembar
 * ini bisa dipindah di atas meja.
 */
export function BoardSection({
  children,
  className = "",
  panelClassName = "",
  id,
  dots = true,
  dark = false,
  as: Tag = "section",
  labelledBy,
}: {
  children: React.ReactNode
  /** Kelas tambahan untuk pembungkus terluar (jarak antar section). */
  className?: string
  /** Kelas tambahan untuk panelnya sendiri (mis. warna latar berbeda). */
  panelClassName?: string
  id?: string
  /** Titik jendela di pojok panel. Matikan untuk panel yang bukan lembar kerja. */
  dots?: boolean
  /** Panel bernada gelap. Dipakai bila satu section memang perlu berat. */
  dark?: boolean
  as?: "section" | "div" | "article"
  labelledBy?: string
}) {
  return (
    <div className={`board-slot ${className}`}>
      <Tag
        id={id}
        aria-labelledby={labelledBy}
        className={`board-panel ${dark ? "board-panel-dark" : ""} ${panelClassName}`}
      >
        {dots && (
          <span className="panel-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
        {/* Sapuan pisau potong saat panel masuk layar. Statis di browser
            yang belum mendukung animasi berbasis gulir. */}
        <span className="panel-sweep pointer-events-none absolute inset-x-0 top-0 z-10 h-px" aria-hidden="true">
          <span
            className="block h-full w-1/3"
            style={{ background: "linear-gradient(90deg, transparent, var(--orange), transparent)", opacity: 0.5 }}
          />
        </span>
        {children}
      </Tag>
    </div>
  )
}

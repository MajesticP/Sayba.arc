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
 *    `.board-panel`), jadi tepi meja tetap terlihat di sela-sela section
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
 * BoardSection: panel yang mengambang di atas meja potong.
 *
 * Dipakai untuk membungkus section di beranda. Tepi kiri dan kanan sengaja
 * diberi jarak supaya permukaan meja tetap terlihat, sehingga latar terasa
 * menyatu dari atas sampai bawah halaman.
 */
export function BoardSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <div id={id} className="px-3 md:px-5 lg:px-6">
      <div className={`board-panel overflow-hidden ${className}`}>{children}</div>
    </div>
  )
}

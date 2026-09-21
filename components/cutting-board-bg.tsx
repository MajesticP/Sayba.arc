/**
 * CuttingBoardBackground — latar bertema meja potong arsitek.
 *
 * Dipakai di section gelap (hero, CTA, blok sorotan). Isinya tiga lapis tipis
 * yang meniru meja potong self-healing:
 *
 *  1. Kisi ukur (24px halus + 120px tegas) — menandai skala, seperti meja potong.
 *  2. Tanda registrasi di sudut — seperti tanda potong di meja cetak.
 *  3. Sapuan garis tipis yang bergerak lambat — meniru gerakan mata pisau saat
 *     memotong. Bergerak sangat lambat dan berhenti total bila pengguna memilih
 *     reduce motion (ditangani di globals.css).
 *
 * Semua opasitas di bawah 0.10 supaya teks tetap jadi fokus utama. Tidak ada
 * orb, tidak ada landmark, tidak ada glow berwarna.
 */
export default function CuttingBoardBackground({
  tone = "dark",
  className = "",
}: {
  /** "dark" untuk section gelap, "light" untuk section terang */
  tone?: "dark" | "light"
  className?: string
}) {
  const lineColor = tone === "dark" ? "rgba(169,180,194,0.30)" : "rgba(94,101,114,0.30)"

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Lapis 1: kisi ukur */}
      <div className={`absolute inset-0 ${tone === "dark" ? "cutting-grid-dark" : "cutting-grid"}`} />

      {/* Lapis 2: tanda registrasi sudut — hanya di layar lebar */}
      <div className="hidden md:block">
        <span className="reg-mark top-6 left-6" style={{ color: lineColor }} />
        <span className="reg-mark top-6 right-6 rotate-90" style={{ color: lineColor }} />
        <span className="reg-mark bottom-6 left-6 -rotate-90" style={{ color: lineColor }} />
        <span className="reg-mark bottom-6 right-6 rotate-180" style={{ color: lineColor }} />
      </div>

      {/* Lapis 3: sapuan pisau potong — garis tipis melintas sangat lambat */}
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

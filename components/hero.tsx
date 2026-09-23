import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import CuttingBoardBackground, { BoardSection } from "@/components/cutting-board-bg"
import Globe from "@/components/globe"

interface HeroData {
  title: string
  subtitle: string
  primaryButton: { text: string; href: string }
  secondaryButton: { text: string; href: string }
  badge?: string
}

/**
 * Tiga fakta yang bisa diverifikasi. Tidak ada angka pemasaran di sini:
 * jumlah departemen dan tahun berdiri bisa dicek, dan klaim "100% berkas
 * sumber" adalah janji kerja yang tertulis di setiap KAK.
 */
const FACTS = [
  { value: "02", label: "Departemen" },
  { value: "2025", label: "Berdiri sejak" },
  { value: "100%", label: "Berkas sumber" },
]

/**
 * Hero: lembar pertama di atas meja potong.
 *
 * Panel bernada gelap, bukan latar penuh. Alasannya, permukaan meja harus
 * tetap terlihat di kiri-kanan lembar pertama supaya aturan "semua section
 * mengambang di atas satu meja" terbaca sejak layar pertama.
 *
 * Bola dunia digambar di belakang teks dan berputar sendiri. Ia diletakkan
 * sebagai latar, bukan di samping teks, karena judul hero sengaja rata tengah.
 * Warnanya sengaja sangat tipis (alfa 0.05 sampai 0.21) sehingga latar di
 * belakang huruf tetap gelap dan kontras teks tidak turun. Titik oranye di
 * bola menandai Pontianak, jadi bola itu membawa keterangan: dari mana kami
 * bekerja.
 *
 * Di bawah tombol hanya ada satu blok data: spesifikasi ringkas (jumlah
 * departemen, tahun berdiri, berkas sumber). Daftar rincian bidang kerja
 * sengaja TIDAK ditaruh di sini: hero sudah memuat badge, judul, keterangan,
 * dua tombol, dan strip fakta, dan menambah satu daftar lagi membuat layar
 * pertama penuh. Rincian pekerjaan tiap bidang ada di section Layanan, tempat
 * pembaca memang datang untuk membacanya.
 */
export default function Hero({ data }: { data: HeroData }) {
  return (
    <BoardSection dark id="beranda" panelClassName="relative overflow-hidden pt-24 md:pt-36">
      <CuttingBoardBackground tone="dark" />

      {/* Bola dunia: latar, di belakang teks. Ukurannya bertingkat mengikuti
          lebar layar supaya tidak berdesakan di ponsel.

          Tepinya dipudarkan memakai mask pada bola itu sendiri, bukan dengan
          menumpuk tabir di atas panel. Dengan mask, tidak ada lapisan warna
          tambahan di atas latar, jadi kontras teks tetap persis seperti yang
          diukur dan tidak ada bidang gelap kedua yang menutupi meja.

          Bola ini tidak menerima peristiwa penunjuk sama sekali: tidak ada
          lapisan penangkap klik, dan `pointer-events-none` menjaga agar tidak
          ada yang tertutup di atasnya. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] lg:w-[560px] lg:h-[560px]"
        aria-hidden="true"
      >
        <Globe className="w-full h-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto panel-pad pt-0 text-center">
        {data.badge && (
          <p className="animate-fade-in stagger-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-ice/20 bg-navy/60 backdrop-blur-sm text-[12px] md:text-[12.5px] font-medium text-ice/90 mb-5 md:mb-7">
            <MapPin className="w-3.5 h-3.5 text-orange-soft shrink-0" aria-hidden="true" />
            {data.badge}
          </p>
        )}

        <h1 className="animate-blur-in stagger-2 text-[27px] leading-[1.16] sm:text-[36px] lg:text-[46px] font-bold tracking-tight text-ice mb-5">
          {data.title}
        </h1>

        {/* Garis dimensi seperti pada gambar teknik: menandai lebar kolom teks.
            Fungsinya membingkai judul, bukan dekorasi. */}
        <div className="animate-draw-line stagger-3 flex items-center justify-center gap-2 max-w-xs mx-auto mb-5 md:mb-6" aria-hidden="true">
          <span className="h-2 w-px bg-orange/60" />
          <span className="h-px flex-1 bg-orange/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-orange" />
          <span className="h-px flex-1 bg-orange/40" />
          <span className="h-2 w-px bg-orange/60" />
        </div>

        <p className="animate-fade-in-up stagger-4 text-[14px] md:text-[17px] leading-relaxed text-ice/85 max-w-2xl mx-auto mb-8 md:mb-10">
          {data.subtitle}
        </p>

        <div className="animate-fade-in-up stagger-5 btn-row justify-center max-w-md sm:max-w-none mx-auto mb-12 md:mb-14">
          <Link href={data.primaryButton.href} className="btn-solid">
            {data.primaryButton.text}
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
          <Link href={data.secondaryButton.href} className="btn-quiet">
            {data.secondaryButton.text}
          </Link>
        </div>

        {/* Spesifikasi ringkas, disusun seperti kolom lembar data teknik */}
        <div className="animate-fade-in stagger-6 relative max-w-2xl mx-auto">
          <div className="rule-line text-ice/70" aria-hidden="true" />
          <dl className="grid grid-cols-3 gap-2 sm:gap-4 pt-5">
            {FACTS.map((fact) => (
              <div key={fact.label} className="text-center px-1">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="block text-[19px] sm:text-[22px] md:text-2xl font-bold text-ice tabular-nums leading-none">
                    {fact.value}
                  </span>
                  <span className="block text-[10.5px] sm:text-[11px] text-ice/75 mt-1.5 leading-tight">{fact.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </BoardSection>
  )
}

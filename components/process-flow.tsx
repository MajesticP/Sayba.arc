"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import type { ProcessStep } from "@/lib/database.types"

/**
 * ProcessFlow: alur proses kerja layanan, satu tahap aktif pada satu waktu.
 *
 * Bentuknya mengikuti stepper standar: lingkaran yang sudah dilewati berisi
 * centang, yang sedang aktif berisi titik, dan yang belum berisi nomornya.
 * Ketiganya SAMA BESAR — ukuran yang berbeda membuat deretannya terlihat
 * goyah, dan mata membaca "lingkaran besar" sebagai hal lain, bukan sebagai
 * tahap yang sedang berjalan.
 *
 * Cara memakainya:
 *  - Lingkaran bisa diklik; tombol kiri/kanan dan geser mendatar juga jalan.
 *  - Penjelasan tahap aktif berganti dengan animasi halus, jadi pembaca fokus
 *    pada satu tahap, bukan membaca enam blok sekaligus.
 *  - Garis penghubung terisi mengikuti kemajuan.
 *
 * Alur berjalan sendiri setelah masuk layar, lalu BERHENTI di tahap terakhir.
 * Tidak mengulang: alur kerja bukan iklan berputar. Menekan tombol mana pun
 * menghentikan gerak sendiri, supaya pembaca tidak digeser paksa.
 *
 * Bila admin belum mengisi `process_steps`, dipakai 6 tahap bawaan.
 *
 * Catatan aksesibilitas: tiap lingkaran adalah tombol sungguhan dengan
 * aria-label, tahap aktif diumumkan lewat aria-live, dan seluruh gerakan
 * dimatikan saat pengunjung mengaktifkan reduce motion.
 */

const DEFAULT_STEPS: ProcessStep[] = [
  { title: "Konsultasi", description: "Diskusi lingkup pekerjaan, kebutuhan data, dan target waktu penyelesaian." },
  { title: "SPK", description: "Surat Perintah Kerja disepakati dan ditandatangani sebagai dasar pelaksanaan." },
  { title: "Invoice DP", description: "Uang muka ditagihkan sesuai kesepakatan sebelum pekerjaan teknis dimulai." },
  { title: "Review", description: "Draf hasil diperiksa bersama; catatan revisi teknis dicatat dan dikerjakan." },
  { title: "Invoice Pelunasan", description: "Sisa pembayaran ditagihkan setelah hasil pekerjaan disetujui." },
  { title: "Serah Terima", description: "Berkas sumber, laporan teknis, dan dukungan pasca serah terima diserahkan." },
]

/** Jeda antar tahap saat berjalan sendiri. */
const JEDA_MS = 2600

export default function ProcessFlow({ steps }: { steps?: ProcessStep[] }) {
  const items = steps && steps.length > 0 ? steps : DEFAULT_STEPS
  const [aktif, setAktif] = useState(0)
  const [berjalan, setBerjalan] = useState(false)
  const [inView, setInView] = useState(false)
  const [kurangiGerak, setKurangiGerak] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  const geserSentuh = useRef<number | null>(null)

  // Hormati preferensi pengunjung: kalau ia meminta gerakan dikurangi, alurnya
  // tidak berjalan sendiri dan tidak ada animasi. Tetap bisa diklik manual.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setKurangiGerak(mq.matches)
    const ubah = () => setKurangiGerak(mq.matches)
    mq.addEventListener("change", ubah)
    return () => mq.removeEventListener("change", ubah)
  }, [])

  // Mulai berjalan sendiri HANYA setelah bagian ini masuk layar. Kalau tidak,
  // alurnya selesai sebelum pembaca sempat melihatnya.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (inView && !kurangiGerak) setBerjalan(true)
  }, [inView, kurangiGerak])

  // Berjalan sendiri sampai tahap terakhir, lalu berhenti.
  useEffect(() => {
    if (!berjalan || kurangiGerak) return
    if (aktif >= items.length - 1) {
      setBerjalan(false)
      return
    }
    const t = setTimeout(() => setAktif((a) => Math.min(a + 1, items.length - 1)), JEDA_MS)
    return () => clearTimeout(t)
  }, [berjalan, aktif, items.length, kurangiGerak])

  const pindah = (i: number) => {
    setBerjalan(false) // pilihan manual menghentikan gerak sendiri
    setAktif(Math.max(0, Math.min(items.length - 1, i)))
  }

  // Papan tunjuk: panah kiri/kanan memindahkan tahap selama bagian ini terlihat.
  const papanTunjuk = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); pindah(aktif + 1) }
    else if (e.key === "ArrowLeft") { e.preventDefault(); pindah(aktif - 1) }
  }

  const awalSentuh = (e: React.TouchEvent) => { geserSentuh.current = e.touches[0].clientX }
  const akhirSentuh = (e: React.TouchEvent) => {
    if (geserSentuh.current === null) return
    const selisih = e.changedTouches[0].clientX - geserSentuh.current
    if (Math.abs(selisih) > 44) pindah(aktif + (selisih < 0 ? 1 : -1))
    geserSentuh.current = null
  }

  const maju = aktif < items.length - 1
  const durasi = kurangiGerak ? "duration-0" : "duration-500"
  const durasiIsi = kurangiGerak ? "duration-0" : "duration-300"

  return (
    <section
      className="mt-12 md:mt-16"
      aria-labelledby="process-flow-title"
      onKeyDown={papanTunjuk}
      tabIndex={0}
      role="group"
      aria-roledescription="Alur proses kerja"
    >
      <div className="flex items-end justify-between gap-4 mb-1.5">
        <h2 id="process-flow-title" className="text-[18px] md:text-2xl font-bold text-navy">
          Proses Kerja Layanan
        </h2>
        {/* "Tahap 3 dari 6" lebih informatif daripada titik polos, dan sekaligus
            memberi tahu bahwa bagian ini memang berganti-ganti. */}
        <span className="text-[12px] text-slate-brand tabular-nums whitespace-nowrap" aria-live="polite">
          Tahap {aktif + 1} dari {items.length}
        </span>
      </div>
      <p className="text-[14px] text-slate-brand mb-6 md:mb-8 max-w-2xl">
        Enam tahap yang kami lalui bersama klien, dari konsultasi awal sampai serah terima berkas.
        Klik salah satu nomor untuk melihat penjelasannya.
      </p>

      <div
        ref={ref}
        className="relative rounded-2xl border border-ice-line bg-ice-dim p-5 md:p-8 overflow-hidden"
        onTouchStart={awalSentuh}
        onTouchEnd={akhirSentuh}
      >
        {/* Kisi meja potong: sangat tipis, hanya memberi tekstur teknis */}
        <div className="cutting-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

        <div className="relative">
          {/* ── Deretan lingkaran ── */}
          <div className="relative">
            <ol
              className="relative grid list-none p-0 m-0 gap-3 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
                // Jarak antar kolom dipakai dua kali: sebagai celah grid, dan
                // oleh garis penghubung untuk menghitung panjangnya. Nilainya
                // harus sama dengan `sm:gap-2` di kelas, kalau tidak garisnya
                // berhenti sebelum pusat lingkaran berikutnya.
                ...({ "--celah": "8px" } as React.CSSProperties),
              }}
            >
              {items.map((step, i) => {
                const ini = i === aktif
                const lewat = i < aktif
                return (
                  <li key={i} className="relative flex flex-col items-center text-center min-w-0">
                    {/* Garis ke lingkaran berikutnya, digambar OLEH lingkaran ini.
                        Cara ini membuat garis selalu mulai dan berakhir tepat di
                        pusat lingkaran, berapa pun jumlah tahap dan selebar apa
                        pun celah antar kolomnya. Perhitungan persen terhadap
                        wadah sebelumnya meleset beberapa piksel karena celah
                        grid tidak ikut terhitung — dan melesetnya terbaca
                        sebagai deretan yang tidak simetris. */}
                    {i < items.length - 1 && (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute h-px bg-ice-line hidden sm:block"
                          style={{ top: 21, left: "50%", right: "calc(-50% - var(--celah))" }}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute h-[2px] bg-orange origin-left transition-transform ease-out ${durasi} hidden sm:block`}
                          style={{
                            top: 20,
                            left: "50%",
                            right: "calc(-50% - var(--celah))",
                            transform: `scaleX(${i < aktif ? 1 : 0})`,
                          }}
                        />
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => pindah(i)}
                      aria-label={`Tahap ${i + 1}: ${step.title}`}
                      aria-current={ini ? "step" : undefined}
                      className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold tabular-nums transition-all ease-out ${durasi} ${
                        ini || lewat
                          ? "border-orange bg-orange text-white"
                          : "border-ice-line bg-white text-slate-brand hover:border-orange/50 hover:text-orange-text"
                      }`}
                    >
                      {/* Isi lingkaran mengikuti keadaan: centang (sudah lewat),
                          titik (sedang aktif), angka (belum sampai). Lingkaran
                          ketiganya sama besar, jadi deretannya tetap rata. */}
                      {lewat ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : ini ? (
                        <span className="block h-2.5 w-2.5 rounded-full bg-white" aria-hidden="true" />
                      ) : (
                        i + 1
                      )}
                    </button>

                    {/* Judul tahap di bawah nomor: hanya di layar lebar. Di layar
                        sempit, enam judul berdesakan dan saling menempel; judul
                        tahap aktif sudah tampil di kotak penjelasan di bawahnya,
                        jadi di sini cukup lingkarannya saja. */}
                    <span
                      className={`mt-2.5 hidden sm:block text-[12.5px] leading-snug transition-colors ${durasiIsi} ${
                        ini ? "font-bold text-navy" : "font-medium text-slate-brand"
                      }`}
                    >
                      {step.title}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* ── Penjelasan tahap aktif ──
              Latarnya sengaja lebih gelap dari panel putih. Sebagai bidang yang
              sama-sama terang, kotak ini dulu menyatu dengan panelnya sehingga
              batasnya tidak terbaca. */}
          <div className="mt-6 md:mt-7 rounded-xl border border-[#c3cfe0] bg-ice-sunken overflow-hidden">
            <div className="flex items-center gap-3 px-4 md:px-5 py-2.5 border-b border-ice-line">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-orange-text min-w-0">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-orange text-white text-[10.5px] tabular-nums"
                  aria-hidden="true"
                >
                  {aktif + 1}
                </span>
                <span className="truncate">{items[aktif].title}</span>
              </span>

              <div className="ml-auto flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => pindah(aktif - 1)}
                  disabled={aktif === 0}
                  aria-label="Tahap sebelumnya"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-ice-line bg-white text-slate-brand transition-colors hover:border-orange hover:text-orange-text disabled:opacity-30 disabled:hover:border-ice-line disabled:hover:text-slate-brand"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => pindah(aktif + 1)}
                  disabled={!maju}
                  aria-label="Tahap berikutnya"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-ice-line bg-white text-slate-brand transition-colors hover:border-orange hover:text-orange-text disabled:opacity-30 disabled:hover:border-ice-line disabled:hover:text-slate-brand"
                >
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Kunci `aktif` pada pembungkus: React memasang ulang isinya tiap
                tahap berganti, sehingga animasi masuknya berjalan lagi. */}
            <div key={aktif} className={`px-4 md:px-5 py-4 ${kurangiGerak ? "" : "animate-masuk"}`}>
              <p className="text-[13.5px] md:text-[14.5px] leading-relaxed text-slate-brand max-w-[62ch]">
                {items[aktif].description || "Penjelasan tahap ini belum diisi."}
              </p>
            </div>
          </div>

          {/* Titik kemajuan: hanya di layar sempit, tempat deretan lingkaran
              berdesakan. Semua titik sama besar supaya deretannya rata; yang
              aktif dibedakan warnanya, bukan ukurannya. */}
          <div className="mt-4 flex items-center justify-center gap-1.5 sm:hidden" aria-hidden="true">
            {items.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${durasiIsi} ${
                  i === aktif ? "bg-orange" : i < aktif ? "bg-orange/45" : "bg-ice-line"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

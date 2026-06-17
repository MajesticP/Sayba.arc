/**
 * Page Content Helper
 * Menyediakan FAQ dan content default untuk setiap tipe halaman detail
 * 
 * Struktur:
 * - Default FAQ untuk setiap tipe (services, applications, products)
 * - Bisa di-override per slug di halaman masing-masing
 * - Hybrid approach: central data + manual override support
 */

import type { FAQSection } from "@/lib/faq-types"
import { DEFAULT_FAQ_SECTION } from "@/lib/faq-types"

/**
 * Contoh FAQ default untuk Services
 * Anda bisa menambah lebih banyak atau menggantinya dengan FAQ spesifik per slug
 */
const servicesFAQMap: Record<string, FAQSection> = {
  "arcgis-mapping": {
    title: "FAQ — Pemetaan ArcGIS",
    description: "Pertanyaan yang sering muncul soal proses dan hasil pemetaan ArcGIS kami.",
    items: [
      {
        question: "Data apa yang perlu saya siapkan?",
        answer:
          "Minimal titik koordinat, batas wilayah, atau shapefile yang sudah ada, plus tujuan petanya — misalnya untuk laporan AMDAL, dokumen tata ruang, atau presentasi ke instansi. Kalau belum punya data sama sekali, kami bisa bantu cari dari sumber terbuka seperti citra satelit dan data BIG.",
      },
      {
        question: "Outputnya dalam format apa?",
        answer:
          "Tergantung kebutuhan: peta cetak siap layout (PDF/JPG resolusi tinggi), file project ArcGIS (.aprx) yang bisa Anda edit sendiri, atau shapefile/geodatabase mentah untuk diolah lebih jauh.",
      },
      {
        question: "Apakah hasilnya mengikuti standar yang dipakai instansi pemerintah?",
        answer:
          "Ya. Kami menyesuaikan simbologi, sistem koordinat, dan format peta dengan standar yang umum dipakai Bappeda, dinas lingkungan, dan instansi sejenis.",
      },
      {
        question: "Berapa lama prosesnya?",
        answer:
          "Peta tematik sederhana biasanya 3-7 hari kerja. Untuk analisis spasial yang lebih kompleks — overlay banyak layer, kajian kesesuaian lahan, dan sejenisnya — kami kasih estimasi setelah melihat data dan luas area kerjanya.",
      },
    ],
  },

  "web-development": {
    title: "FAQ — Pengembangan Web",
    description: "Hal-hal yang biasanya ditanyakan sebelum mulai proyek web dengan kami.",
    items: [
      {
        question: "Pakai teknologi apa?",
        answer:
          "Stack utama kami Next.js, React, dan Node.js. Untuk proyek dengan budget terbatas, kami juga bisa pakai HTML/JS biasa supaya biaya hosting lebih murah.",
      },
      {
        question: "Saya belum punya desain, apakah itu masalah?",
        answer:
          "Tidak. Kalau Anda sudah punya desain (Figma atau sejenisnya), kami implementasikan langsung. Kalau belum, tim kami bantu rancang UI/UX dari nol.",
      },
      {
        question: "Setelah website jadi, apakah saya wajib pakai paket maintenance?",
        answer:
          "Tidak wajib. Kami bantu proses deploy dan kasih panduan dasar pengelolaan konten. Kalau nanti butuh perubahan atau fitur tambahan, tinggal hubungi lagi — bukan kontrak bulanan yang dipaksakan.",
      },
      {
        question: "Berapa lama waktu pengerjaannya?",
        answer:
          "Landing page sederhana sekitar 1-2 minggu. Sistem informasi atau dashboard dengan banyak fitur bisa 3-8 minggu, tergantung kompleksitas — kami kasih timeline detail begitu requirement-nya jelas.",
      },
    ],
  },

  "ml-engineering": {
    title: "FAQ — Machine Learning Engineering",
    description: "Pertanyaan umum seputar pengembangan dan integrasi model machine learning.",
    items: [
      {
        question: "Saya punya data tapi belum tahu model apa yang cocok, bisa dibantu?",
        answer:
          "Bisa. Kami biasanya mulai dari eksplorasi data — lihat pola, kualitas, dan jumlahnya — baru tentukan apakah cocoknya klasifikasi, regresi, deteksi objek, atau forecasting.",
      },
      {
        question: "Modelnya bisa dipakai untuk data real-time?",
        answer:
          "Bisa. Model bisa kami bungkus jadi API yang dipanggil langsung oleh sistem Anda, termasuk setup pipeline untuk data yang terus bertambah.",
      },
      {
        question: "Kalau akurasinya belum sesuai harapan, bagaimana?",
        answer:
          "Kami tunjukkan metrik evaluasi secara transparan dari awal, termasuk batasannya. Kalau hasilnya belum cukup, kita diskusikan apakah perlu data tambahan, fitur baru, atau pendekatan model yang berbeda — bukan dipaksa 'pokoknya akurat'.",
      },
      {
        question: "Source code dan modelnya jadi milik siapa?",
        answer: "Sepenuhnya milik Anda. Source code, model, dan dokumentasinya kami serahkan setelah proyek selesai.",
      },
    ],
  },

  "hull-design": {
    title: "FAQ — Desain Lambung Kapal 2D",
    description: "Pertanyaan umum soal gambar teknik desain lambung kapal dengan AutoCAD.",
    items: [
      {
        question: "Spesifikasi apa yang perlu saya berikan di awal?",
        answer:
          "Minimal ukuran utama kapal (panjang, lebar, tinggi, draft), jenis kapal, dan tujuan penggunaannya. Kalau ada referensi desain atau lines plan sebelumnya, itu sangat membantu.",
      },
      {
        question: "Outputnya format apa?",
        answer:
          "File AutoCAD (.dwg) berisi penampang melintang, profil samping, dan denah atas, plus versi PDF untuk dicetak atau dipresentasikan.",
      },
      {
        question: "Apakah gambar ini bisa langsung dipakai untuk pengajuan klasifikasi/izin?",
        answer:
          "Gambar kami mengikuti format dan standar yang umum dipakai untuk keperluan tersebut, tapi proses pengajuan ke biro klasifikasi tetap di pihak Anda — kami fokus menyediakan gambar tekniknya.",
      },
      {
        question: "Kalau ada perubahan spesifikasi di tengah jalan, bisa revisi?",
        answer:
          "Revisi minor (ukuran, proporsi) termasuk dalam pengerjaan. Untuk perubahan signifikan dari spesifikasi awal, kami diskusikan dulu dampaknya ke timeline dan biaya sebelum lanjut.",
      },
    ],
  },
}

/**
 * Contoh FAQ default untuk Applications
 *
 * NOTE: /applications dan /applications/[slug] saat ini redirect ke /services,
 * jadi map ini belum bisa diakses dari mana pun. Dikosongkan (sebelumnya isinya
 * FAQ generik soal "ERP system" yang bukan layanan kami). Isi lagi kalau rute
 * applications diaktifkan dan ada produk/aplikasi nyata untuk diberi FAQ.
 */
const applicationsFAQMap: Record<string, FAQSection> = {}

/**
 * Contoh FAQ default untuk Products
 *
 * NOTE: /products dan /products/[slug] saat ini redirect ke /services,
 * jadi map ini belum bisa diakses dari mana pun. Dikosongkan (sebelumnya isinya
 * FAQ generik soal "software license" yang bukan produk kami). Isi lagi kalau
 * rute products diaktifkan dan ada produk nyata (misalnya POS Kasir) untuk
 * diberi FAQ.
 */
const productsFAQMap: Record<string, FAQSection> = {}

/**
 * Fungsi untuk mendapatkan FAQ berdasarkan type dan slug
 * 
 * @param type - 'services' | 'applications' | 'products'
 * @param slug - URL slug dari halaman
 * @returns FAQSection dengan fallback ke DEFAULT_FAQ_SECTION
 */
export function getFAQForSlug(
  type: "services" | "applications" | "products",
  slug: string,
): FAQSection {
  let faqMap: Record<string, FAQSection>

  switch (type) {
    case "services":
      faqMap = servicesFAQMap
      break
    case "applications":
      faqMap = applicationsFAQMap
      break
    case "products":
      faqMap = productsFAQMap
      break
  }

  // Jika ada FAQ custom untuk slug ini, gunakan. Jika tidak, gunakan default
  return faqMap[slug] || DEFAULT_FAQ_SECTION
}

/**
 * Helper untuk menambah FAQ baru
 * Gunakan ini jika Anda ingin menambah FAQ dari kode
 */
export function addServiceFAQ(slug: string, faq: FAQSection): void {
  servicesFAQMap[slug] = faq
}

export function addApplicationFAQ(slug: string, faq: FAQSection): void {
  applicationsFAQMap[slug] = faq
}

export function addProductFAQ(slug: string, faq: FAQSection): void {
  productsFAQMap[slug] = faq
}

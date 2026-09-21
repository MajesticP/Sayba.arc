/**
 * Page Content Helper
 * Menyediakan FAQ dan content default untuk setiap tipe halaman detail
 * 
 * Struktur:
 * - Default FAQ untuk setiap tipe (services, applications, informasi)
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
  // Contoh: slug untuk development service
  "custom-development": {
    title: "FAQ - Custom Development",
    description:
      "Pelajari lebih lanjut tentang proses development custom kami dan bagaimana kami membangun solusi yang sempurna untuk kebutuhan Anda.",
    items: [
      {
        question: "Teknologi apa yang Anda gunakan?",
        answer:
          "Kami menggunakan teknologi modern seperti Next.js, React, TypeScript, Tailwind CSS, dan berbagai tools terkini untuk memastikan solusi yang scalable dan performant.",
      },
      {
        question: "Berapa estimasi waktu project?",
        answer:
          "Timeline tergantung pada scope dan kompleksitas. Kami akan memberikan estimasi detail setelah analisis requirement mendalam.",
      },
      {
        question: "Apakah saya bisa request perubahan di tengah project?",
        answer:
          "Tentu! Kami memiliki proses change management yang fleksibel untuk mengakomodasi kebutuhan perubahan Anda.",
      },
      {
        question: "Bagaimana dengan maintenance setelah launch?",
        answer:
          "Kami menyediakan paket maintenance yang komprehensif termasuk bug fixes, updates, dan monitoring performance.",
      },
    ],
  },

  // Contoh: slug untuk consulting service
  "business-consulting": {
    title: "FAQ - Business Consulting",
    description:
      "Dapatkan jawaban tentang layanan konsultasi bisnis kami dan bagaimana kami membantu bisnis Anda berkembang.",
    items: [
      {
        question: "Apa yang termasuk dalam paket consulting?",
        answer:
          "Paket kami meliputi analisis mendalam, strategi, implementasi, dan training untuk tim Anda.",
      },
      {
        question: "Berapa lama durasi engagement consulting?",
        answer:
          "Biasanya 3-12 bulan tergantung tujuan dan scope proyek. Kami bisa menyesuaikan dengan kebutuhan Anda.",
      },
      {
        question: "Siapa yang akan menangani project kami?",
        answer:
          "Tim senior consultant kami yang berpengalaman akan ditugaskan untuk memastikan hasil terbaik.",
      },
    ],
  },
}

/**
 * Contoh FAQ default untuk Applications
 */
const applicationsFAQMap: Record<string, FAQSection> = {
  // Contoh: slug untuk ERP application
  "erp-system": {
    title: "FAQ - ERP System",
    description: "Pelajari tentang fitur dan implementasi ERP system kami yang dirancang untuk bisnis modern.",
    items: [
      {
        question: "Apakah sistem ini bisa terintegrasi dengan sistem existing kami?",
        answer:
          "Ya, sistem kami dirancang dengan flexible API untuk integrasi seamless dengan berbagai platform existing.",
      },
      {
        question: "Bagaimana dengan data migration dari sistem lama?",
        answer:
          "Kami menyediakan layanan data migration lengkap dengan validation dan testing untuk memastikan data integrity.",
      },
      {
        question: "Apakah ada training untuk user?",
        answer:
          "Ya, kami menyediakan training comprehensive untuk semua user level dengan dokumentasi lengkap.",
      },
    ],
  },
}

/**
 * Contoh FAQ default untuk Informasi (dokumen teknis)
 */
const informasiFAQMap: Record<string, FAQSection> = {
  // Contoh: slug untuk dokumen standar teknis
  "standar-format-deliverable-cad-gis": {
    title: "FAQ - Standar Deliverable CAD & GIS",
    description:
      "Informasi lengkap tentang standar format berkas, sistem proyeksi, dan struktur layer yang kami pakai.",
    items: [
      {
        question: "Format berkas apa saja yang diserahkan?",
        answer:
          "DWG/DXF untuk AutoCAD, SHP/File Geodatabase untuk GIS, GeoTIFF untuk raster, serta PDF resolusi tinggi siap cetak.",
      },
      {
        question: "Sistem koordinat apa yang dipakai?",
        answer:
          "Datum WGS 1984 / SRGI 2013 dengan proyeksi UTM Zona 49S/50N atau TM-3° sesuai standar instansi terkait.",
      },
      {
        question: "Apakah metadata ikut disertakan?",
        answer:
          "Ya. Setiap deliverable geospasial dilengkapi metadata berstandar FGDC/ISO 19115 dan atribut yang terisi lengkap.",
      },
    ],
  },
}

/**
 * Fungsi untuk mendapatkan FAQ berdasarkan type dan slug
 * 
 * @param type - 'services' | 'applications' | 'informasi'
 * @param slug - URL slug dari halaman
 * @returns FAQSection dengan fallback ke DEFAULT_FAQ_SECTION
 */
export function getFAQForSlug(
  type: "services" | "applications" | "informasi",
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
    case "informasi":
      faqMap = informasiFAQMap
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

export function addInformasiFAQ(slug: string, faq: FAQSection): void {
  informasiFAQMap[slug] = faq
}

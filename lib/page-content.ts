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
 * Contoh FAQ default untuk Products
 */
const productsFAQMap: Record<string, FAQSection> = {
  // Contoh: slug untuk software license
  "software-license": {
    title: "FAQ - Software License",
    description:
      "Informasi lengkap tentang lisensi software kami dan bagaimana cara menggunakannya dengan optimal.",
    items: [
      {
        question: "Berapa lama durasi lisensi?",
        answer: "Lisensi kami tersedia dalam periode 1 bulan, 1 tahun, atau 3 tahun sesuai kebutuhan Anda.",
      },
      {
        question: "Apakah lisensi bisa dipindahkan ke device lain?",
        answer:
          "Ya, lisensi dapat dipindahkan. Silakan hubungi support kami untuk proses transfer yang mudah.",
      },
      {
        question: "Apa yang termasuk dalam renewal?",
        answer:
          "Renewal mencakup akses ke versi terbaru, security updates, dan support teknis berkelanjutan.",
      },
    ],
  },
}

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

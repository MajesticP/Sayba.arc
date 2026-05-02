/**
 * FAQ System Types and Helpers
 * Digunakan untuk semua halaman detail slug (services, applications, products)
 */

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQSection {
  title: string
  description: string
  items: FAQItem[]
}

/**
 * Default FAQ untuk setiap tipe
 * Bisa di-override per slug di halaman masing-masing
 */
export const DEFAULT_FAQ_SECTION: FAQSection = {
  title: "Pertanyaan yang Sering Diajukan",
  description:
    "Temukan jawaban atas pertanyaan umum tentang produk atau layanan kami.",
  items: [
    {
      question: "Bagaimana cara memulai?",
      answer:
        "Hubungi tim kami untuk konsultasi awal. Kami akan membantu Anda memahami kebutuhan dan memberikan solusi terbaik.",
    },
    {
      question: "Berapa lama proses implementasi?",
      answer: "Waktu implementasi tergantung pada kompleksitas proyek. Kami akan memberikan timeline yang jelas di awal.",
    },
    {
      question: "Apakah ada dukungan teknis?",
      answer: "Ya, kami menyediakan dukungan teknis penuh selama dan setelah implementasi.",
    },
  ],
}

/**
 * Helper untuk merge FAQ default dengan custom FAQ
 * Jika custom FAQ disediakan, gunakan itu. Jika tidak, gunakan default.
 */
export function resolveFAQSection(customFAQ?: Partial<FAQSection>): FAQSection {
  if (!customFAQ) {
    return DEFAULT_FAQ_SECTION
  }

  return {
    title: customFAQ.title || DEFAULT_FAQ_SECTION.title,
    description: customFAQ.description || DEFAULT_FAQ_SECTION.description,
    items: customFAQ.items && customFAQ.items.length > 0 ? customFAQ.items : DEFAULT_FAQ_SECTION.items,
  }
}

/**
 * Type untuk page content dengan FAQ
 * Mempermudah type safety saat menggunakan FAQ di berbagai halaman
 */
export interface PageWithFAQ {
  faq?: Partial<FAQSection>
}

// Structured Data untuk SEO Rich Snippets
//
// Konteks usaha: SAYBA ARC adalah konsultan IT & engineering di Pontianak.
// Skema di bawah disesuaikan dengan konteks itu — bukan skema produk/e-commerce.

const BASE_URL = "https://sayba.id"
const LOGO_URL = `${BASE_URL}/logo-256.png`
const OG_FALLBACK = `${BASE_URL}/og-image.png`

const AREA_SERVED = {
  "@type": "AdministrativeArea",
  name: "Kalimantan Barat, Indonesia",
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${BASE_URL}/#organization`,
    name: "SAYBA ARC",
    url: BASE_URL,
    logo: LOGO_URL,
    image: OG_FALLBACK,
    description:
      "SAYBA ARC adalah konsultan IT dan engineering dari Pontianak. Melayani pengembangan perangkat lunak, sistem informasi, pemetaan spasial, dan dokumen rancang bangun untuk bisnis dan instansi.",
    sameAs: [
      "https://instagram.com/sayba.arc",
      "https://linkedin.com/company/sayba-arc",
      "https://github.com/sayba-arc",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pontianak",
      addressRegion: "Kalimantan Barat",
      addressCountry: "ID",
    },
    areaServed: AREA_SERVED,
    knowsAbout: [
      "Pengembangan perangkat lunak",
      "Sistem informasi",
      "Pemetaan spasial",
      "Sistem Informasi Geografis",
      "Gambar teknik",
      "Rancang bangun",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+6287721916495",
        contactType: "customer service",
        email: "sayba.help@gmail.com",
        areaServed: "ID",
        availableLanguage: ["id"],
      },
    ],
  }
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${BASE_URL}/#localbusiness`,
    name: "SAYBA ARC",
    image: OG_FALLBACK,
    url: BASE_URL,
    telephone: "+6287721916495",
    email: "sayba.help@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pontianak",
      addressRegion: "Kalimantan Barat",
      addressCountry: "ID",
    },
    areaServed: AREA_SERVED,
    priceRange: "Hubungi kami",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:30",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "15:00",
      },
    ],
  }
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateServiceSchema(service: {
  name: string
  description: string
  url: string
  image?: string
  serviceType?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    image: service.image || OG_FALLBACK,
    serviceType: service.serviceType,
    provider: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: BASE_URL,
    },
    areaServed: AREA_SERVED,
  }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

/** Metadata halaman detail layanan. */
export function generateServiceDetailMetadata(options: {
  title: string
  description: string
  slug: string
  serviceTitle: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}) {
  const image = options.ogImage || OG_FALLBACK
  const url = `${BASE_URL}/services/${options.slug}`

  return {
    title: options.title,
    description: options.description,
    keywords:
      options.keywords && options.keywords.length > 0
        ? options.keywords
        : [
            options.serviceTitle,
            `jasa ${options.serviceTitle.toLowerCase()}`,
            "konsultan IT Pontianak",
            "konsultan engineering Pontianak",
            "SAYBA ARC",
          ],
    canonical: options.canonicalUrl || url,
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      type: "website" as const,
      images: [{ url: image, width: 1200, height: 630, alt: options.serviceTitle }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: [image],
    },
  }
}

/** Metadata halaman detail informasi. */
export function generateInformasiDetailMetadata(options: {
  title: string
  description: string
  slug: string
  articleTitle: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}) {
  const image = options.ogImage || OG_FALLBACK
  const url = `${BASE_URL}/informasi/${options.slug}`

  return {
    title: options.title,
    description: options.description,
    keywords:
      options.keywords && options.keywords.length > 0
        ? options.keywords
        : [options.articleTitle, "informasi teknis", "SAYBA ARC", "Pontianak"],
    canonical: options.canonicalUrl || url,
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      type: "article" as const,
      images: [{ url: image, width: 1200, height: 630, alt: options.articleTitle }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: [image],
    },
  }
}

/** Metadata halaman detail portofolio. */
export function generatePortfolioDetailMetadata(options: {
  title: string
  description: string
  slug: string
  portfolioTitle: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}) {
  const image = options.ogImage || OG_FALLBACK
  const url = `${BASE_URL}/portfolio/${options.slug}`

  return {
    title: options.title,
    description: options.description,
    keywords:
      options.keywords && options.keywords.length > 0
        ? options.keywords
        : [options.portfolioTitle, "portofolio", "studi kasus", "SAYBA ARC", "Pontianak"],
    canonical: options.canonicalUrl || url,
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      type: "article" as const,
      images: [{ url: image, width: 1200, height: 630, alt: options.portfolioTitle }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: [image],
    },
  }
}

export function generatePortfolioSchema(item: {
  name: string
  description: string
  url: string
  image?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.name,
    description: item.description,
    url: item.url,
    image: item.image || OG_FALLBACK,
    creator: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: BASE_URL,
    },
  }
}

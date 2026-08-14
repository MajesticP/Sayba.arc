// Structured Data untuk SEO Rich Snippets

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAYBA ARC",
    alternateName: "Art You Believe",
    url: "https://sayba.id",
    logo: "https://sayba.id/Sayba%20Arc.png",
    description:
      "SAYBA ARC adalah agensi multidisiplin dari Pontianak yang menghadirkan solusi digital, rekayasa teknis, dan engineering untuk bisnis dan instansi di Indonesia.",
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
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+6287721916495",
        contactType: "Customer Service",
        email: "sayba.help@gmail.com",
        areaServed: "ID",
        availableLanguage: ["id", "en"],
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: "https://sayba.id",
    },
    url: service.url,
    image: service.image || "https://sayba.id/Sayba%20Arc.png",
    areaServed: {
      "@type": "Country",
      name: "ID",
    },
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  url: string
  image?: string
  price?: string
  currency?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: product.url,
    image: product.image || "https://sayba.id/Sayba%20Arc.png",
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency || "IDR",
      price: product.price || "Contact us",
      availability: "https://schema.org/InStock",
    },
    manufacturer: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: "https://sayba.id",
    },
  }
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "SAYBA ARC",
    image: "https://sayba.id/Sayba%20Arc.png",
    url: "https://sayba.id",
    telephone: "+6287721916495",
    email: "sayba.help@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pontianak",
      addressRegion: "Kalimantan Barat",
      addressCountry: "ID",
    },
    openingHours: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
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

export function generateServiceDetailMetadata(options: {
  title: string
  description: string
  slug: string
  serviceTitle: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}) {
  const image = options.ogImage || "https://sayba.id/Sayba%20Arc.png"
  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords && options.keywords.length > 0 ? options.keywords : [
      options.serviceTitle,
      `jasa ${options.serviceTitle.toLowerCase()}`,
      `layanan ${options.serviceTitle.toLowerCase()}`,
      "SAYBA ARC",
      "digital solutions",
      "indonesia",
    ],
    canonical: options.canonicalUrl || `https://sayba.id/services/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.id/services/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: image,
          width: 1024,
          height: 1024,
          alt: options.serviceTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: [image],
    },
  }
}

export function generateProductDetailMetadata(options: {
  title: string
  description: string
  slug: string
  productTitle: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}) {
  const image = options.ogImage || "https://sayba.id/Sayba%20Arc.png"
  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords && options.keywords.length > 0 ? options.keywords : [
      options.productTitle,
      `produk ${options.productTitle.toLowerCase()}`,
      "SAYBA ARC",
      "digital solutions",
      "indonesia",
    ],
    canonical: options.canonicalUrl || `https://sayba.id/products/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.id/products/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: image,
          width: 1024,
          height: 1024,
          alt: options.productTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: [image],
    },
  }
}

export function generateApplicationDetailMetadata(options: {
  title: string
  description: string
  slug: string
  appTitle: string
}) {
  return {
    title: options.title,
    description: options.description,
    keywords: [
      options.appTitle,
      `aplikasi ${options.appTitle.toLowerCase()}`,
      "SAYBA ARC",
      "software",
      "application",
      "indonesia",
    ],
    canonical: `https://sayba.id/applications/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.id/applications/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: "https://sayba.id/Sayba%20Arc.png",
          width: 1024,
          height: 1024,
          alt: options.appTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: ["https://sayba.id/Sayba%20Arc.png"],
    },
  }
}

export function generateSoftwareApplicationSchema(app: {
  name: string
  description: string
  url: string
  image?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.description,
    url: app.url,
    image: app.image || "https://sayba.id/Sayba%20Arc.png",
    operatingSystem: ["Web", "Windows", "macOS", "Linux", "iOS", "Android"],
    offers: {
      "@type": "Offer",
      price: "Contact for pricing",
    },
    creator: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: "https://sayba.id",
    },
  }
}

export function generatePortfolioDetailMetadata(options: {
  title: string
  description: string
  slug: string
  portfolioTitle: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
}) {
  const image = options.ogImage || "https://sayba.id/Sayba%20Arc.png"
  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords && options.keywords.length > 0
      ? options.keywords
      : [
          options.portfolioTitle,
          `portfolio ${options.portfolioTitle.toLowerCase()}`,
          "SAYBA ARC",
          "digital solutions",
          "indonesia",
        ],
    canonical: options.canonicalUrl || `https://sayba.id/portfolio/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.id/portfolio/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: image,
          width: 1024,
          height: 1024,
          alt: options.portfolioTitle,
        },
      ],
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
    image: item.image || "https://sayba.id/Sayba%20Arc.png",
    creator: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: "https://sayba.id",
    },
  }
}

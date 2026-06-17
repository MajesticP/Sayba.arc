// Structured Data untuk SEO Rich Snippets
//
// NOTE: none of the generators below are currently imported/rendered by any
// page in app/ — this is dead code for now. Left in place (and fixed) in
// case it gets wired up later, but double-check address/hours fields before
// shipping since some are still placeholders.

import { siteConfig, socialLinks } from "@/lib/data"

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SAYBA ARC",
    url: "https://sayba.web.id",
    logo: "https://sayba.web.id/logo.png",
    description: siteConfig.description,
    sameAs: socialLinks.map((s) => s.href),
    address: {
      "@type": "PostalAddress",
      addressCountry: "ID",
      addressLocality: "Pontianak",
      addressRegion: "Kalimantan Barat",
      // TODO: add streetAddress / postalCode here if this schema gets wired up
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.phone.replace(/[^\d+]/g, ""),
        contactType: "Customer Service",
        email: siteConfig.email,
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
      url: "https://sayba.web.id",
    },
    url: service.url,
    image: service.image || "https://sayba.web.id/logo.png",
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
    image: product.image || "https://sayba.web.id/logo.png",
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency || "IDR",
      price: product.price || "Contact us",
      availability: "https://schema.org/InStock",
    },
    manufacturer: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: "https://sayba.web.id",
    },
  }
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "SAYBA ARC",
    image: "https://sayba.web.id/logo.png",
    url: "https://sayba.web.id",
    telephone: siteConfig.phone.replace(/[^\d+]/g, ""),
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pontianak",
      addressRegion: "Kalimantan Barat",
      addressCountry: "ID",
      // TODO: add streetAddress / postalCode here if this schema gets wired up
    },
    // TODO: confirm real operating hours before using this — 09:00–17:00
    // Mon–Fri is a placeholder and may not reflect how the team actually works
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
}) {
  return {
    title: options.title,
    description: options.description,
    keywords: [
      options.serviceTitle,
      `jasa ${options.serviceTitle.toLowerCase()}`,
      `layanan ${options.serviceTitle.toLowerCase()}`,
      "SAYBA ARC",
      "digital solutions",
      "indonesia",
    ],
    canonical: `https://sayba.web.id/services/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.web.id/services/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: "https://sayba.web.id/logo.png",
          width: 1200,
          height: 630,
          alt: options.serviceTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: ["https://sayba.web.id/logo.png"],
    },
  }
}

export function generateProductDetailMetadata(options: {
  title: string
  description: string
  slug: string
  productTitle: string
}) {
  return {
    title: options.title,
    description: options.description,
    keywords: [
      options.productTitle,
      `produk ${options.productTitle.toLowerCase()}`,
      "SAYBA ARC",
      "digital solutions",
      "indonesia",
    ],
    canonical: `https://sayba.web.id/products/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.web.id/products/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: "https://sayba.web.id/logo.png",
          width: 1200,
          height: 630,
          alt: options.productTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: ["https://sayba.web.id/logo.png"],
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
    canonical: `https://sayba.web.id/applications/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.web.id/applications/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: "https://sayba.web.id/logo.png",
          width: 1200,
          height: 630,
          alt: options.appTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: ["https://sayba.web.id/logo.png"],
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
    image: app.image || "https://sayba.web.id/logo.png",
    operatingSystem: ["Web", "Windows", "macOS", "Linux", "iOS", "Android"],
    offers: {
      "@type": "Offer",
      price: "Contact for pricing",
    },
    creator: {
      "@type": "Organization",
      name: "SAYBA ARC",
      url: "https://sayba.web.id",
    },
  }
}

export function generatePortfolioDetailMetadata(options: {
  title: string
  description: string
  slug: string
  portfolioTitle: string
  keywords?: string[]
}) {
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
    canonical: `https://sayba.web.id/portfolio/${options.slug}`,
    openGraph: {
      title: options.title,
      description: options.description,
      url: `https://sayba.web.id/portfolio/${options.slug}`,
      type: "website" as const,
      images: [
        {
          url: "https://sayba.web.id/logo.png",
          width: 1200,
          height: 630,
          alt: options.portfolioTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: ["https://sayba.web.id/logo.png"],
    },
  }
}

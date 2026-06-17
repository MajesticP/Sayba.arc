// ============================================================
// SAYBA ARC — Site Content (English)
//
// Indonesian mirror: lib/data.ts — keep the same shape/keys.
// lib/i18n.ts picks the right file based on active language.
// ============================================================

export const siteConfig = {
  name: "SAYBA ARC",
  tagline: "Geospatial · Digital · Marine",
  description:
    "SAYBA ARC is a multidisciplinary agency from Pontianak delivering ArcGIS-based environmental mapping, web & mobile development, machine learning, data science, and 2D naval architecture drawings in AutoCAD.",
  url: "https://sayba.web.id",
  logoText: "SAYBA ARC",
  logoLink: "/",
  email: "sayba.help@gmail.com",
  phone: "+62 877-2191-6495",
  address: "Pontianak, West Kalimantan, Indonesia",
}

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export const hero = {
  title: "Integrated Engineering & Digital Solutions by SAYBA ARC",
  subtitle:
    "One team, three disciplines: ArcGIS-based environmental mapping and spatial analysis, web/mobile development and machine learning, and 2D ship design with AutoCAD. Based in Pontianak, we take your project from brief to working system — no juggling separate vendors for work that should connect.",
  primaryButton: { text: "Explore Our Services", href: "/services" },
  secondaryButton: { text: "View Portfolio", href: "/portfolio" },
  badge: "Three Disciplines, One Team",
}

export const arcgisDepartment = {
  id: "environmental",
  label: "Geospatial & Environmental",
  title: "Environmental Mapping & Spatial Analysis",
  subtitle:
    "ArcGIS-based GIS and mapping services for environmental analysis, spatial planning, and natural resource management.",
  services: [
    {
      icon: "map",
      title: "ArcGIS Mapping",
      description:
        "Thematic, base, and analytical maps built in ArcGIS — from vector and raster data processing through to print-ready map layouts.",
      href: "/services/arcgis-mapping",
    },
    {
      icon: "layers",
      title: "Environmental Spatial Analysis",
      description:
        "Spatial analysis for environmental impact assessments (AMDAL), land suitability, disaster risk, and land-use planning grounded in geographic data.",
      href: "/services/spatial-analysis",
    },
    {
      icon: "satellite",
      title: "Remote Sensing & Satellite Imagery",
      description:
        "Processing satellite imagery (Landsat, Sentinel, SPOT) for land cover mapping, land-use change detection, and aerial environmental monitoring.",
      href: "/services/remote-sensing",
    },
    {
      icon: "database",
      title: "Geospatial Data Management",
      description:
        "Organising, cleaning, and managing geodatabases — keeping your spatial data structured, consistent, and ready to analyse at any time.",
      href: "/services/geodata-management",
    },
    {
      icon: "globe",
      title: "Web GIS & Interactive Maps",
      description:
        "Building web-based interactive map platforms using Leaflet and ArcGIS Online so your environmental data is accessible and understandable to everyone.",
      href: "/services/web-gis",
    },
    {
      icon: "smartphone",
      title: "Field Data Collection",
      description:
        "Supporting field surveys with digital tools — from form design to GPS data sync — to speed up environmental inventory and monitoring workflows.",
      href: "/services/field-data",
    },
  ],
}

export const itDepartment = {
  id: "it",
  label: "Digital & Software",
  title: "Digital Development & Data Intelligence",
  subtitle:
    "From web and mobile to machine learning and data science — end-to-end digital solutions for modern organisations.",
  services: [
    {
      icon: "code",
      title: "Web Development",
      description:
        "Full-stack web applications using Next.js, React, and Node.js — from fast landing pages to complex browser-based information systems.",
      href: "/services/web-development",
    },
    {
      icon: "smartphone",
      title: "Mobile App Development",
      description:
        "Android and iOS mobile apps built with React Native or Flutter — native performance, single codebase, production-ready.",
      href: "/services/mobile-development",
    },
    {
      icon: "cpu",
      title: "Machine Learning Engineering",
      description:
        "Building, training, and deploying ML models — classification, regression, object detection, forecasting — from notebook experiment to production API.",
      href: "/services/ml-engineering",
    },
    {
      icon: "bar-chart-2",
      title: "Data Science & Analytics",
      description:
        "Data exploration, visualisation, statistical modelling, and data-driven reporting — helping your organisation make decisions from numbers, not assumptions.",
      href: "/services/data-science",
    },
    {
      icon: "monitor",
      title: "Information Systems",
      description:
        "Building management information systems (MIS), admin dashboards, and internal portals tailored to your organisation's specific workflows and requirements.",
      href: "/services/information-systems",
    },
    {
      icon: "layout",
      title: "UI/UX Design",
      description:
        "Clean, intuitive, user-centred interface design — from wireframes and prototypes to a consistent design system for your product.",
      href: "/services/ui-ux",
    },
  ],
}

export const oceanicDepartment = {
  id: "oceanic",
  label: "Marine & Naval Architecture",
  title: "Ship Design & Technical Drawings",
  subtitle:
    "2D ship technical drawings in AutoCAD — from hull design and lines plans through construction drawings and accommodation layouts.",
  services: [
    {
      icon: "anchor",
      title: "2D Hull Design",
      description:
        "2D hull design drawings in AutoCAD — covering cross-sections, side profile, and top-view plan to the technical specifications provided.",
      href: "/services/hull-design",
    },
    {
      icon: "navigation",
      title: "Lines Plan",
      description:
        "Precise ship lines plans — body plan, sheer plan, and half breadth plan — as the basis for hydrostatic calculations and stability analysis.",
      href: "/services/lines-plan",
    },
    {
      icon: "file-text",
      title: "Ship Construction Drawings",
      description:
        "2D ship construction technical drawings covering midship section, floors, frames, and other structural elements to classification standards.",
      href: "/services/construction-drawing",
    },
    {
      icon: "grid",
      title: "General Arrangement",
      description:
        "General Arrangement drawings — overall placement of spaces, decks, and facilities in AutoCAD format ready to submit.",
      href: "/services/general-arrangement",
    },
    {
      icon: "home",
      title: "Accommodation Layout",
      description:
        "Design and technical drawings for ship accommodation spaces — cabins, engine room, wheelhouse, and common areas to operational requirements.",
      href: "/services/accommodation-layout",
    },
    {
      icon: "settings",
      title: "Outfitting & Systems Drawings",
      description:
        "Technical drawings for ship support systems — piping, ventilation, mooring, and deck equipment — in structured, readable 2D AutoCAD format.",
      href: "/services/outfitting",
    },
  ],
}

export const services = [...arcgisDepartment.services, ...itDepartment.services, ...oceanicDepartment.services]

export const features = [
  {
    icon: "layers",
    title: "Cross-Discipline Team",
    description:
      "One agency with three real areas of expertise — Geospatial & Environmental, Digital & Software, and Marine & Naval Architecture. No complicated multi-vendor coordination.",
  },
  {
    icon: "zap",
    title: "End-to-End Delivery",
    description:
      "From requirements analysis and technical execution to final handover — everything handled by one team, no wasteful hand-offs in between.",
  },
  {
    icon: "map-pin",
    title: "Strong Local Context",
    description:
      "We understand conditions on the ground in Kalimantan and Indonesia — spatial planning regulations, BIG standards, and connectivity challenges in remote areas.",
  },
  {
    icon: "refresh-cw",
    title: "Agile & Transparent",
    description:
      "Short sprints, regular updates, and open communication. You know exactly where the project stands at every stage — no surprises at the end.",
  },
  {
    icon: "cpu",
    title: "Current Tools & Tech",
    description:
      "We use actively maintained, relevant stacks — Next.js, Python, ArcGIS, AutoCAD, and modern ML frameworks — not legacy technology that needs propping up.",
  },
  {
    icon: "users",
    title: "Real Collaboration",
    description:
      "We work with you, not just for you. Client input is part of the process, not an interruption — and that consistently makes the end result better.",
  },
]

export const about = {
  title: "Three Disciplines. One Team. One Goal.",
  description:
    "SAYBA ARC is a multidisciplinary agency from Pontianak built on one straightforward belief: complex problems need a team with more than one way of looking at things. We combine expertise in Geospatial & Environmental, Digital & Software, and Marine & Naval Architecture under one roof — so clients don't need to track down three different vendors for work that's fundamentally connected.",
  stats: [
    { value: "3", label: "Specialist Departments" },
    { value: "2025", label: "Founded" },
    { value: "100%", label: "Commitment to Quality" },
    { value: String(services.length), label: "Specialist Services" },
  ],
  buttonText: "Meet the Team",
  buttonHref: "/about",
}

export const cta = {
  title: "Have a Project in Mind?",
  subtitle:
    "Whether you need an environmental map, a web application, a machine learning model, or ship technical drawings — let's talk through what you need and figure out the right approach.",
  buttonText: "Get in Touch",
  buttonHref: "/contact",
}

export const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export const socialLinks = [
  { name: "Instagram", icon: "instagram", href: "https://instagram.com/sayba.arc" },
  { name: "LinkedIn", icon: "linkedin", href: "https://linkedin.com/company/sayba-arc" },
  { name: "WhatsApp", icon: "whatsapp", href: `https://wa.me/${siteConfig.phone.replace(/\D/g, "")}` },
  { name: "GitHub", icon: "github", href: "https://github.com/sayba-arc" },
]

export const servicesPage = {
  title: "Our Services",
  subtitle:
    "Three core service lines — Geospatial & Environmental, Digital & Software, and Marine & Naval Architecture — ready to take your project end to end.",
  items: services.map((s) => ({
    ...s,
    longDescription: s.description,
    features: [] as string[],
  })),
}

export const aboutPage = {
  hero: {
    title: "About SAYBA ARC",
    subtitle:
      "A multidisciplinary agency from Pontianak — Geospatial & Environmental, Digital & Software, and Marine & Naval Architecture in one team.",
  },
  mission:
    "Delivering technical solutions that are relevant, honest, and high quality — no overpromising, no inflated numbers, and no disappearing once the project is done.",
  vision:
    "To become a trusted multidisciplinary agency in Indonesia known not for the promises in proposals, but for the tangible results clients can actually show.",
  team: [
    {
      name: "Geospatial & Environmental Team",
      role: "ArcGIS Mapping & Spatial Analysis",
      bio: "Handles all mapping, GIS, remote sensing, and environmental spatial data work. Experienced in processing spatial data for environmental assessment and land-use planning needs.",
    },
    {
      name: "Digital & Software Team",
      role: "Web, Mobile, ML & Data Science",
      bio: "Builds modern web and mobile applications, machine learning models, data analytics systems, and information systems — from zero to deployment. Main stack: Next.js, Python, React Native.",
    },
    {
      name: "Marine & Naval Architecture Team",
      role: "Ship Design & Technical Drawings",
      bio: "Produces all 2D ship technical drawings in AutoCAD — lines plans, general arrangements, construction drawings, outfitting, and accommodation layouts to technical standards.",
    },
  ],
}

export const contactPage = {
  title: "Get in Touch",
  subtitle:
    "Have a project you want to work on, or just want to explore what's possible? We're glad to hear from you.",
  info: [
    { icon: "mail", label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    {
      icon: "phone",
      label: "Phone / WhatsApp",
      value: siteConfig.phone,
      href: `https://wa.me/${siteConfig.phone.replace(/\D/g, "")}`,
    },
    { icon: "map-pin", label: "Location", value: siteConfig.address, href: "#" },
  ],
}

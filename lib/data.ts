// ============================================================
// SAYBA ARC — Konten Situs (Bahasa Indonesia)
// ============================================================

export const siteConfig = {
  name: "SAYBA ARC",
  tagline: "Art You Believe — Agensi Digital & Engineering dari Pontianak",
  description:
    "SAYBA ARC adalah agensi multidisiplin dari Pontianak yang menghadirkan solusi digital, rekayasa teknis, dan engineering untuk bisnis dan instansi di Indonesia.",
  url: "https://sayba.web.id",
  logoText: "SAYBA ARC",
  logoLink: "/",
  email: "sayba.help@gmail.com",
  phone: "+62 877-2191-6495",
  address: "Pontianak, Kalimantan Barat, Indonesia",
}

export const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/services" },
  { label: "Produk", href: "/products" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
]

export const hero = {
  title: "Solusi Digital & Engineering oleh SAYBA ARC",
  subtitle:
    "Web & aplikasi, GIS & pemetaan, data & machine learning, hingga rancang teknik — SAYBA ARC adalah mitra satu atap untuk beragam kebutuhan digital dan engineering Anda, dikerjakan dalam satu tim.",
  primaryButton: { text: "Jelajahi Layanan Kami", href: "/services" },
  secondaryButton: { text: "Lihat Portofolio", href: "/portfolio" },
  badge: "Multidisiplin · Berbasis di Pontianak",
}

export const features = [
  {
    icon: "zap",
    title: "Eksekusi End-to-End",
    description:
      "Dari analisis kebutuhan hingga serah terima — semua dikerjakan dalam satu tim tanpa hand-off yang membuang waktu Anda.",
  },
  {
    icon: "map-pin",
    title: "Konteks Lokal yang Kuat",
    description:
      "Kami paham kondisi lapangan di Kalimantan dan Indonesia — regulasi, standar lokal, hingga tantangan konektivitas di lapangan.",
  },
  {
    icon: "refresh-cw",
    title: "Agile & Transparan",
    description:
      "Sprint pendek, laporan berkala, komunikasi terbuka. Anda tahu persis perkembangan proyek di setiap tahap.",
  },
  {
    icon: "cpu",
    title: "Stack Teknologi Terkini",
    description:
      "Next.js, Python, ArcGIS, AutoCAD, ML frameworks modern — kami pakai yang relevan dan terawat, bukan teknologi warisan.",
  },
  {
    icon: "users",
    title: "Kolaborasi Nyata",
    description:
      "Kami bekerja bersama Anda, bukan hanya untuk Anda. Masukan klien adalah bagian dari proses, bukan gangguan.",
  },
  {
    icon: "shield",
    title: "Hasil yang Bisa Ditunjukkan",
    description:
      "Kami tidak overpromise. Setiap deliverable dirancang agar bisa langsung dipakai, ditunjukkan ke stakeholder, atau di-deploy.",
  },
]

export const about = {
  title: "Satu Tim. Banyak Keahlian.",
  description:
    "SAYBA ARC adalah agensi dari Pontianak yang lahir dari keyakinan bahwa masalah nyata butuh orang yang mau turun tangan langsung. Kami tidak mengunci diri di satu bidang — kami mengerjakan apa yang klien butuhkan, dari pemetaan, sistem informasi dan rancangan perkapalan hingga kebutuhan engineer lainnya.",
  stats: [
    { value: "50+", label: "Proyek Selesai" },
    { value: "2025", label: "Tahun Berdiri" },
    { value: "100%", label: "Komitmen Kualitas" },
    { value: "1", label: "Tim, Banyak Solusi" },
  ],
  buttonText: "Kenali Tim Kami",
  buttonHref: "/about",
}

export const cta = {
  title: "Punya Proyek yang Ingin Dikerjakan?",
  subtitle:
    "Apapun kebutuhannya — peta, aplikasi, data, atau desain — ceritakan ke kami dan kita cari solusinya bersama.",
  buttonText: "Hubungi Kami",
  buttonHref: "/contact",
}

export const footerLinks = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/services" },
  { label: "Produk", href: "/products" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
]

export const socialLinks = [
  { name: "Instagram", icon: "instagram", href: "https://instagram.com/sayba.arc" },
  { name: "LinkedIn", icon: "linkedin", href: "https://linkedin.com/company/sayba-arc" },
  { name: "WhatsApp", icon: "whatsapp", href: "https://wa.me/6287721916495" },
  { name: "GitHub", icon: "github", href: "https://github.com/sayba-arc" },
]

export const servicesPage = {
  title: "Layanan Kami",
  subtitle:
    "Setiap layanan dirancang untuk menyelesaikan masalah nyata — bukan sekadar daftar fitur yang terdengar keren.",
}

export const aboutPage = {
  hero: {
    title: "Tentang SAYBA ARC",
    subtitle: "Agensi digital dan engineering dari Pontianak yang bekerja lintas disiplin untuk klien yang butuh hasil, bukan janji.",
  },
  mission:
    "Menghadirkan solusi teknis yang relevan, jujur, dan berkualitas — tanpa overpromise, tanpa inflasi angka, dan tanpa meninggalkan klien setelah proyek selesai.",
  vision:
    "Menjadi agensi terpercaya di Indonesia yang dikenal karena hasil nyata yang bisa klien tunjukkan.",
}

export const contactPage = {
  title: "Hubungi Kami",
  subtitle:
    "Punya proyek yang ingin dikerjakan atau sekadar ingin mengeksplorasi kemungkinan? Kami senang mendengar dari Anda.",
  info: [
    { icon: "mail", label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: "phone", label: "Telepon / WhatsApp", value: siteConfig.phone, href: `https://wa.me/6287721916495` },
    { icon: "map-pin", label: "Lokasi", value: siteConfig.address, href: "#" },
  ],
  whatsappLink:
    "https://wa.me/6287721916495?text=Halo%20Saya%20Tertarik%20Pada%20%5Bjenis%20produk/jasa%5D%20%5BJasa%20nya%20mis%20:%20Autocad%203D%5D%20%0A%3E%20Sayba%20Arc",
}

// ============================================================
// SAYBA ARC — Konfigurasi & Helper Pusat Informasi
// ============================================================

import type { Informasi } from "@/lib/database.types"

export interface InformasiCategory {
  slug: string
  label: string
  color: string
  badgeClass: string
}

export const informasiCategories: InformasiCategory[] = [
  {
    slug: "pengumuman",
    label: "Pengumuman",
    color: "#ff914d",
    badgeClass: "bg-orange-500/10 text-[#ff914d] border-orange-500/25",
  },
  {
    slug: "panduan",
    label: "Panduan Layanan",
    color: "#3b82f6",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  },
  {
    slug: "standar",
    label: "Standar & Regulasi",
    color: "#10b981",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  },
  {
    slug: "dokumentasi",
    label: "Dokumentasi & Rilis",
    color: "#8b5cf6",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  },
  {
    slug: "operasional",
    label: "Operasional",
    color: "#f59e0b",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  },
]

export function getInformasiCategory(slug: string): InformasiCategory | undefined {
  return informasiCategories.find((c) => c.slug === slug || c.label.toLowerCase() === slug.toLowerCase())
}

export function getInformasiCategoryLabel(slug: string): string {
  return getInformasiCategory(slug)?.label ?? slug
}

export function getInformasiCategoryColor(slug: string): string {
  return getInformasiCategory(slug)?.color ?? "#ff914d"
}

export function getInformasiCategoryBadgeClass(slug: string): string {
  return getInformasiCategory(slug)?.badgeClass ?? "bg-white/10 text-white/70 border-white/20"
}

export function formatInformasiDate(iso: string): string {
  if (!iso) return "-"
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return iso
  }
}

export function parseInformasiBody(body: string | null): string[] {
  if (!body) return []
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
}

/** Fallback data when database table is empty or loading */
export const FALLBACK_INFORMASI: Informasi[] = [
  {
    id: "info-1",
    title: "Prosedur & Alur Kerja Konsultasi GIS dan Rancang Teknik",
    slug: "prosedur-alur-kerja-konsultasi-teknis",
    category: "panduan",
    excerpt: "Panduan lengkap tahapan pengajuan proyek, pengumpulan data lapangan, asistensi berkala, hingga serah terima berkas teknis di SAYBA ARC.",
    author: "Tim Teknis SAYBA ARC",
    body: `## 1. Tahap Inisiasi & Penjajakan Kebutuhan
Klien dapat menghubungi tim SAYBA ARC melalui portal kontak resmi atau WhatsApp. Pada tahap ini, kami mengidentifikasi ruang lingkup pekerjaan, kebutuhan data awal (data spasial/vektor, peta dasar, spesifikasi kapal, atau skema rancangan teknik), serta target waktu penyelesaian.

## 2. Penyusunan Kerangka Acuan Kerja (KAK) & Penawaran
Setelah ruang lingkup disepakati, tim engineer kami menyusun Kerangka Acuan Kerja (KAK) beserta estimasi biaya dan jadwal milestone pengerjaan. Dokumen ini menjadi acuan kerja resmi yang transparan bagi kedua belah pihak.

## 3. Eksekusi Teknis & Supervisi Lapangan
Pengerjaan dilakukan langsung oleh tim spesialis kami tanpa perantara pihak ketiga. Apabila proyek memerlukan pengambilan data lapangan (ground check GIS, survei batimetri, atau fotogrametri drone), tim lapangan kami beroperasi sesuai standar keselamatan dan regulasi instansi terkait.

## 4. Asistensi Berkala & Uji Validasi
Kami memberikan update progres secara berkala melalui presentasi mingguan atau dashboard pemantauan. Klien memiliki kesempatan melakukan review dan memberikan umpan balik sebelum finalisasi deliverable.

## 5. Serah Terima Berkas & Dukungan Teknis
Deliverable diserahkan dalam format digital standar industri (GeoTIFF, SHP, File Geodatabase, DWG/DXF, PDF berstandar cetak, serta laporan teknis lengkap). Kami memberikan masa garansi revisi teknis dan dukungan konsultasi pasca serah terima.`,
    published_at: "2026-09-10",
    read_minutes: 4,
    views: 428,
    featured: true,
    tags: ["SOP", "Konsultasi", "GIS", "Engineering", "Alur Kerja"],
    status: "active",
    image_url: "/banners/services-1920x600.webp",
    meta_title: "Prosedur & Alur Kerja Konsultasi GIS dan Rancang Teknik — SAYBA ARC",
    meta_description: "Panduan tahapan pengajuan proyek, asistensi berkala, hingga serah terima berkas teknis di SAYBA ARC.",
    meta_keywords: ["sop konsultasi gis", "alur kerja engineering", "prosedur sayba arc", "pemetaan pontianak"],
    og_image: null,
    canonical_url: null,
    created_at: "2026-09-10T08:00:00Z",
  },
  {
    id: "info-2",
    title: "Standar Format Deliverable CAD, Pemetaan Geospasial & Pelaporan",
    slug: "standar-format-deliverable-cad-gis",
    category: "standar",
    excerpt: "Spesifikasi teknis mengenai struktur layer AutoCAD, sistem proyeksi koordinat (UTM/TM-3°), dan format basis data geospasial resmi.",
    author: "Departemen GIS & Perkapalan",
    body: `## Standar Sistem Koordinat Spasial
Setiap pekerjaan geospasial di SAYBA ARC diproyeksikan dengan sistem koordinat standar nasional:
- Datum: WGS 1984 / SRGI 2013 (Sistem Referensi Geospasial Indonesia)
- Proyeksi: Universal Transverse Mercator (UTM) Zona 49S/50N atau TM-3° sesuai standar BPN/ATR untuk pemetaan kadastral.

## Standar Layering AutoCAD & Rancang Gambar
Untuk dokumen rekayasa kapal dan gambar teknik sipil:
- Satuan gambar: Milimeter (mm) untuk perkapalan, Meter (m) untuk tata letak tapak dan kontur.
- Struktur Layer: Terorganisir berdasarkan elemen struktur, anotasi, garis dimensi, dan garis air (waterlines).
- Format file: DWG versi kompatibel (AutoCAD 2018–2024) serta dokumen PDF beresolusi tinggi dengan skala terkalibrasi.

## Integritas Data Geodatabase
Data vektor disimpan dalam format ESRI Shapefile (.shp) atau File Geodatabase (.gdb) dengan atribut yang terisi lengkap, topologi bebas overlap, dan metadata berstandar FGDC/ISO 19115.`,
    published_at: "2026-09-08",
    read_minutes: 3,
    views: 312,
    featured: false,
    tags: ["AutoCAD", "GIS", "Standar Teknis", "WGS84", "UTM"],
    status: "active",
    image_url: null,
    meta_title: "Standar Format Deliverable CAD, Pemetaan Geospasial & Pelaporan — SAYBA ARC",
    meta_description: "Spesifikasi teknis mengenai struktur layer AutoCAD, sistem proyeksi koordinat, dan format basis data geospasial resmi.",
    meta_keywords: ["standar autocad sayba", "format shp geodatabase", "sistem proyeksi utm pontianak"],
    og_image: null,
    canonical_url: null,
    created_at: "2026-09-08T09:30:00Z",
  },
  {
    id: "info-3",
    title: "Pengumuman Jadwal Layanan Helpdesk & Konsultasi Langsung",
    slug: "jadwal-layanan-helpdesk-konsultasi",
    category: "pengumuman",
    excerpt: "Informasi mengenai jam operasional kantor, waktu respon pesan WhatsApp konsultasi, serta penanganan tiket teknis darurat.",
    author: "Sekretariat SAYBA ARC",
    body: `## Jam Operasional Kantor & Helpdesk
SAYBA ARC melayani konsultasi langsung dan komunikasi daring pada hari dan jam kerja berikut:
- **Senin – Jumat**: 08.30 – 17.00 WIB
- **Sabtu**: 09.00 – 15.00 WIB (Sesi Konsultasi Khusus & Diskusi Teknis)
- **Minggu & Hari Libur Nasional**: Libur Operasional

## Saluran Komunikasi Resmi
- WhatsApp Konsultasi: +62 877-2191-6495 (Respon rata-rata < 15 menit pada jam kerja)
- Surel Penawaran / KAK: sayba.help@gmail.com
- Lokasi Kantor: Pontianak, Kalimantan Barat, Indonesia

## Kebijakan Emergency Support
Untuk klien dengan kontrak kerja sama aktif (Managed Maintenance / Server Monitoring), tim teknis kami tetap siaga 24/7 melalui jalur darurat yang telah ditentukan dalam perjanjian kerja sama.`,
    published_at: "2026-09-05",
    read_minutes: 2,
    views: 198,
    featured: false,
    tags: ["Jadwal", "Helpdesk", "Kontak", "Operasional"],
    status: "active",
    image_url: null,
    meta_title: "Jadwal Layanan Helpdesk & Konsultasi Langsung — SAYBA ARC",
    meta_description: "Informasi jam operasional kantor, waktu respon WhatsApp konsultasi, serta penanganan teknis SAYBA ARC.",
    meta_keywords: ["jam operasional sayba arc", "kontak whatsapp sayba", "kantor pontianak"],
    og_image: null,
    canonical_url: null,
    created_at: "2026-09-05T10:00:00Z",
  },
  {
    id: "info-4",
    title: "Kebijakan Keamanan Data & Kerahasiaan Informasi Klien (NDA)",
    slug: "kebijakan-keamanan-data-kerahasiaan-klien",
    category: "standar",
    excerpt: "Komitmen SAYBA ARC dalam menjaga integritas data spasial, blueprint teknik, dan informasi rahasia instansi melalui perjanjian non-disclosure.",
    author: "Tim Legalitas & Kepatuhan",
    body: `## Komitmen Kerahasiaan Tanpa Kompromi
Di SAYBA ARC, kami menyadari bahwa data spasial perencanaan kota, peta topografi lahan perkebunan/tambang, dan blueprint kapal merupakan aset bernilai tinggi yang bersifat konfidensial.

## Klausul Non-Disclosure Agreement (NDA)
Kami bersedia menandatangani perjanjian kerahasiaan resmi (NDA) sebelum pertukaran data awal dilakukan. Seluruh data mentah dari klien dilindungi dan tidak akan pernah dibagikan, dipublikasikan, atau dialihkan kepada pihak lain.

## Penyimpanan & Pemusnahan Data
- Data proyek disimpan pada server terenkripsi dengan akses terbatas khusus personil teknis yang bertugas.
- Setelah proyek dinyatakan selesai dan masa retensi garansi terlewati, salinan data kerja dapat dihapus secara permanen atas permintaan resmi klien.`,
    published_at: "2026-09-01",
    read_minutes: 3,
    views: 245,
    featured: false,
    tags: ["Keamanan", "NDA", "Kerahasiaan", "Data Protection"],
    status: "active",
    image_url: null,
    meta_title: "Kebijakan Keamanan Data & Kerahasiaan Klien — SAYBA ARC",
    meta_description: "Komitmen SAYBA ARC dalam menjaga integritas data spasial, blueprint teknik, dan informasi rahasia instansi.",
    meta_keywords: ["kebijakan privasi sayba arc", "nda proyek pemetaan", "keamanan data spasial"],
    og_image: null,
    canonical_url: null,
    created_at: "2026-09-01T11:00:00Z",
  },
  {
    id: "info-5",
    title: "Ketentuan Garansi Hasil Pekerjaan & Hak Revisi Dokumen",
    slug: "ketentuan-garansi-dan-hak-revisi-pekerjaan",
    category: "panduan",
    excerpt: "Hak revisi desain, batas toleransi perhitungan teknis, serta masa garansi perbaikan bug aplikasi atau peta web.",
    author: "Manajemen Proyek SAYBA ARC",
    body: `## Ketentuan Revisi Standar
Setiap paket layanan di SAYBA ARC mencakup sesi revisi gratis untuk memastikan hasil pekerjaan sesuai dengan KAK awal:
- Pekerjaan Gambar CAD & Peta: Mencakup 2 hingga 3 kali siklus revisi minor (perubahan atribut, layout kartografi, atau dimensi penyesuaian).
- Pengembangan Web & Sistem Aplikasi: Mencakup masa uji coba (User Acceptance Testing - UAT) selama 14–30 hari kerja.

## Masa Garansi Pemeliharaan (Maintenance)
Setelah serah terima (Handover), klien berhak atas masa garansi teknis gratis selama 30 hingga 90 hari (tergantung jenis kontrak) untuk memperbaiki segala kesalahan kalkulasi, ketidaksesuaian layer, atau galat fungsional pada aplikasi.

## Permintaan di Luar Lingkup (Scope Creep)
Penambahan fitur atau perubahan desain fundamental yang berada di luar kesepakatan KAK awal akan dibahas dalam addendum kontrak tersendiri secara profesional dan transparan.`,
    published_at: "2026-08-25",
    read_minutes: 3,
    views: 184,
    featured: false,
    tags: ["Garansi", "Revisi", "SOP", "Layanan Klien"],
    status: "active",
    image_url: null,
    meta_title: "Ketentuan Garansi Hasil Pekerjaan & Hak Revisi Dokumen — SAYBA ARC",
    meta_description: "Hak revisi desain, batas toleransi perhitungan teknis, serta masa garansi perbaikan dokumen atau peta web di SAYBA ARC.",
    meta_keywords: ["garansi proyek sayba", "hak revisi gambar teknik", "sop pemeliharaan web"],
    og_image: null,
    canonical_url: null,
    created_at: "2026-08-25T14:00:00Z",
  },
  {
    id: "info-6",
    title: "Catatan Rilis Arsitektur Sistem Web GIS & Integrasi API V2",
    slug: "catatan-rilis-arsitektur-web-gis-v2",
    category: "dokumentasi",
    excerpt: "Peningkatan performa rendering vektor geospasial ribuan poligon, kompatibilitas Esri ArcGIS REST Services, dan caching tile otomatis.",
    author: "Divisi IT & Web Development",
    body: `## Ringkasan Pembaruan V2
Tim IT SAYBA ARC telah menyelesaikan pembaruan core engine untuk platform Web GIS terpadu kami:
- **Peningkatan Kecepatan Rendering**: Penggunaan WebGL canvas dan vector tiling memungkinkan pemuatan lebih dari 50.000 poligon tata ruang dalam waktu kurang dari 1 detik.
- **Dukungan Format Luas**: Integrasi langsung dengan format GeoJSON, FlatGeobuf, Shapefile zip, serta GeoTIFF beresolusi tinggi via Cloud-Optimized GeoTIFF (COG).
- **Integrasi ArcGIS Online / Portal**: Kompatibel penuh dengan REST API FeatureServer dan MapServer Esri.

## Kemudahan Deployment Klien
Sistem baru ini dapat di-deploy secara on-premise pada server instansi maupun cloud hosting (AWS / GCP / Cloudflare) dengan biaya infrastruktur yang sangat efisien.`,
    published_at: "2026-08-15",
    read_minutes: 3,
    views: 289,
    featured: false,
    tags: ["Rilis", "Web GIS", "API", "ArcGIS", "Performa"],
    status: "active",
    image_url: null,
    meta_title: "Catatan Rilis Arsitektur Sistem Web GIS & Integrasi API V2 — SAYBA ARC",
    meta_description: "Peningkatan performa rendering vektor geospasial, kompatibilitas ArcGIS REST, dan caching tile otomatis di SAYBA ARC.",
    meta_keywords: ["rilis web gis", "arcgis rest api pontianak", "arsitektur gis modern"],
    og_image: null,
    canonical_url: null,
    created_at: "2026-08-15T15:00:00Z",
  },
]

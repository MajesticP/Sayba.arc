export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

/**
 * Scope kategori. Satu tabel `kategori` melayani tiga modul supaya admin
 * hanya perlu mengelola satu daftar.
 */
/**
 * Cakupan kategori pada tabel `kategori`. Satu tabel melayani tiga modul:
 *  - layanan   : kategori pekerjaan di halaman Layanan
 *  - berita    : kategori artikel Berita
 *  - informasi : kategori dokumen Informasi
 *
 * Departemen TIDAK di sini, melainkan di tabel `layanan_depts`. Alasannya,
 * kolom `layanan.dept` punya foreign key ke `layanan_depts.value`, jadi
 * departemen harus berada di tabel itu supaya layanan bisa memakainya.
 * Di admin keduanya tetap tampil dalam satu tab dengan sub-tab.
 */
export type KategoriScope = "layanan" | "berita" | "informasi"

/** Satu blok isi yang bisa disusun bebas dari admin (halaman slug layanan). */
export interface ContentBlock {
  /** heading = sub-judul, paragraph = teks, list = daftar berbutir, image = gambar */
  type: "heading" | "paragraph" | "list" | "image"
  /** Teks isi. Untuk list, pisahkan tiap butir dengan baris baru. */
  text?: string
  /** URL gambar: hanya dipakai bila type = "image" */
  image_url?: string
  /** Keterangan gambar: hanya dipakai bila type = "image" */
  caption?: string
}

/** Satu butir FAQ di halaman slug layanan. */
export interface LayananFAQ {
  question: string
  answer: string
}

/** Satu tahap pada diagram alir proses kerja. */
export interface ProcessStep {
  title: string
  description?: string
}

export type Database = {
  /**
   * Supabase JS v2.104+ membaca versi PostgREST dari sini untuk menyimpulkan
   * tipe operasi tulis (insert/update/upsert). Tanpa blok ini, tipe Insert
   * runtuh menjadi `never` dan semua operasi tulis gagal type-check.
   *
   * Nilai "13" sesuai PostgREST yang dipakai proyek Supabase ini.
   * Bila Supabase di-upgrade, nilai ini boleh ikut disesuaikan.
   */
  __InternalSupabase: {
    PostgrestVersion: "13"
  }
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      /**
       * Kategori untuk Layanan, Berita, dan Informasi.
       *
       * Kolom `scope` memisahkan ketiganya dalam satu tabel, jadi admin
       * mengelola satu daftar dan halaman publik menyaring sesuai modulnya.
       * Nilai `slug` disimpan di kolom `category` tabel terkait.
       */
      kategori: {
        Row: {
          id: string
          scope: KategoriScope
          slug: string
          label: string
          description: string | null
          color: string
          sort_order: number
          status: "active" | "draft"
          created_at: string
        }
        Insert: {
          id?: string
          scope: KategoriScope
          slug: string
          label: string
          description?: string | null
          color?: string
          sort_order?: number
          status?: "active" | "draft"
          created_at?: string
        }
        Update: {
          id?: string
          scope?: KategoriScope
          slug?: string
          label?: string
          description?: string | null
          color?: string
          sort_order?: number
          status?: "active" | "draft"
          created_at?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          id: string
          title: string
          slug: string
          category: string | null
          dept: string
          description: string | null
          image_url: string | null
          result_url: string | null
          features: string[] | null
          tech_stack: string[] | null
          status: "active" | "draft" | "archived"
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          og_image: string | null
          canonical_url: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["portfolio"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["portfolio"]["Insert"]>
      }
      layanan_depts: {
        Row: {
          value: string
          label: string
          description: string | null
          color: string
          /** Kelas Tailwind opsional untuk lencana departemen. */
          badge_class: string | null
          /** Ringkasan lingkup kerja, satu butir per elemen. */
          sub_categories: string[] | null
          sort_order: number
          created_at: string
        }
        Insert: {
          value: string
          label: string
          description?: string | null
          color?: string
          badge_class?: string | null
          sub_categories?: string[] | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          value?: string
          label?: string
          description?: string | null
          color?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      layanan: {
        Row: {
          id: string
          title: string
          slug: string
          dept: string                  // "it_konsulting" | "engineering_konsulting"
          category: string | null       // slug kategori dari tabel `kategori` (scope "layanan")
          description: string | null
          icon: string | null
          image_url: string | null      // gambar utama, tampil 1:1 di kiri kartu
          gallery: string[] | null      // foto tambahan di halaman slug
          content_blocks: ContentBlock[] | null  // isi halaman yang disusun admin
          faqs: LayananFAQ[] | null     // FAQ yang diinput manual per layanan
          process_steps: ProcessStep[] | null    // tahap proses kerja (diagram alir)
          status: "active" | "draft" | "archived"
          featured_order: number | null   // 1, 2, 3 = tampil di beranda; null = tidak
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          og_image: string | null
          canonical_url: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["layanan"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["layanan"]["Insert"]>
      }
      informasi: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          category: string              // slug kategori dari tabel `kategori` (scope "informasi")
          image_url: string | null
          author: string
          body: string | null
          published_at: string          // date (YYYY-MM-DD)
          read_minutes: number
          views: number
          featured: boolean
          tags: string[] | null
          status: "active" | "draft" | "archived"
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          og_image: string | null
          canonical_url: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["informasi"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["informasi"]["Insert"]>
      }
      berita: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          category: string              // slug kategori dari tabel `kategori` (scope "berita")
          image_url: string | null
          author: string
          body: string | null           // Markdown ringan: "## " = sub-judul
          published_at: string          // date (YYYY-MM-DD)
          read_minutes: number
          views: number
          featured: boolean
          tags: string[] | null
          status: "active" | "draft" | "archived"
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          og_image: string | null
          canonical_url: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["berita"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["berita"]["Insert"]>
      }
      promo_banner: {
        Row: {
          id: string
          image_url: string
          alt: string
          eyebrow: string | null        // tidak lagi dirender: banner tampil sebagai gambar penuh
          title: string | null          // tidak lagi dirender: taruh teks di dalam gambar
          subtitle: string | null       // tidak lagi dirender
          cta_text: string | null       // tidak lagi dirender: banner tidak punya tombol
          cta_href: string | null       // tautan seluruh gambar; kosong = gambar tidak bisa diklik
          sort_order: number
          status: "active" | "draft"
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["promo_banner"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["promo_banner"]["Insert"]>
      }
      tim: {
        Row: {
          id: string
          name: string
          role: string
          bio: string | null
          photo_url: string | null
          github_url: string | null
          linkedin_url: string | null
          instagram_url: string | null
          dept: string | null           // "it_konsulting" | "engineering_konsulting"
          order_num: number
          status: "active" | "draft"
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["tim"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["tim"]["Insert"]>
      }
    }
  }
}

export type Portfolio = Database["public"]["Tables"]["portfolio"]["Row"]
export type PortfolioInsert = Database["public"]["Tables"]["portfolio"]["Insert"]

export type Layanan = Database["public"]["Tables"]["layanan"]["Row"]
export type LayananInsert = Database["public"]["Tables"]["layanan"]["Insert"]

export type Informasi = Database["public"]["Tables"]["informasi"]["Row"]
export type InformasiInsert = Database["public"]["Tables"]["informasi"]["Insert"]

export type Berita = Database["public"]["Tables"]["berita"]["Row"]
export type BeritaInsert = Database["public"]["Tables"]["berita"]["Insert"]

export type PromoBanner = Database["public"]["Tables"]["promo_banner"]["Row"]
export type PromoBannerInsert = Database["public"]["Tables"]["promo_banner"]["Insert"]

export type Kategori = Database["public"]["Tables"]["kategori"]["Row"]
export type KategoriInsert = Database["public"]["Tables"]["kategori"]["Insert"]

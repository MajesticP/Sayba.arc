export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface PriceTier {
  name: string       // e.g. "Starter", "Standard", "Premium"
  price: number      // in IDR, e.g. 3000000
  bio: string        // short tagline for this tier
  features: string[] // list of what's included
}

/** Satu blok isi yang bisa disusun bebas dari admin (halaman slug layanan). */
export interface ContentBlock {
  /** heading = sub-judul, paragraph = teks, list = daftar berbutir, image = gambar */
  type: "heading" | "paragraph" | "list" | "image"
  /** Teks isi. Untuk list, pisahkan tiap butir dengan baris baru. */
  text?: string
  /** URL gambar — hanya dipakai bila type = "image" */
  image_url?: string
  /** Keterangan gambar — hanya dipakai bila type = "image" */
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
   * runtuh menjadi `never` dan semua operasi tulis gagal type-check —
   * itulah alasan route admin lama memakai `as any`.
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
      portfolio: {
        Row: {
          id: string
          title: string
          slug: string
          category: string | null
          dept: string                  // open string — driven by LAYANAN_DEPTS config (same as layanan)
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
          sort_order: number
          created_at: string
        }
        Insert: {
          value: string
          label: string
          description?: string | null
          color?: string
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
      informasi_kategori: {
        Row: {
          id: string
          slug: string
          label: string
          color: string
          sort_order: number
          status: "active" | "draft"
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          color?: string
          sort_order?: number
          status?: "active" | "draft"
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          color?: string
          sort_order?: number
          status?: "active" | "draft"
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
          category: string | null       // sub-kategori dalam departemen (mis. "Web GIS")
          description: string | null
          icon: string | null
          image_url: string | null      // gambar utama — tampil 1:1 di kiri kartu
          gallery: string[] | null      // foto tambahan di halaman slug
          content_blocks: ContentBlock[] | null  // isi halaman yang disusun admin
          faqs: LayananFAQ[] | null     // FAQ yang diinput manual per layanan
          process_steps: ProcessStep[] | null    // tahap proses kerja (diagram alir)
          prices: PriceTier[] | null
          status: "active" | "draft" | "archived"
          featured_order: number | null   // 1, 2, or 3 = shown on homepage; null = not featured
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
          category: string              
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
          category: string              // open string — lihat newsCategories di lib/news-data.ts
          image_url: string | null
          author: string
          body: string | null           // Markdown ringan: "## " = sub-judul, baris kosong = paragraf baru
          published_at: string          // date (YYYY-MM-DD)
          read_minutes: number
          views: number
          featured: boolean             // true = tampil sebagai kartu Sorotan di /berita
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
          eyebrow: string | null
          title: string | null          // kosongkan semua teks jika gambar sudah memuat teksnya sendiri
          subtitle: string | null
          cta_text: string | null       // kosong = slide tidak bisa diklik
          cta_href: string | null
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
          dept: "lingkungan" | "it" | "kelautan" | null
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

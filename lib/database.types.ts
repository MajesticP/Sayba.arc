export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface PriceTier {
  name: string       // e.g. "Starter", "Standard", "Premium"
  price: number      // in IDR, e.g. 3000000
  bio: string        // short tagline for this tier
  features: string[] // list of what's included
}

export type Database = {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      portfolio: {
        Row: {
          id: string
          title: string                      // Indonesian title
          title_en: string | null            // English title (null = fall back to ID)
          slug: string
          category: string | null
          dept: string                       // open string — driven by LAYANAN_DEPTS config (was a closed union missing 'kelautan')
          description: string | null         // Indonesian description
          description_en: string | null      // English description (null = fall back to ID)
          image_url: string | null
          result_url: string | null
          features: string[] | null
          tech_stack: string[] | null
          status: "active" | "draft" | "archived"
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["portfolio"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["portfolio"]["Insert"]>
      }
      layanan: {
        Row: {
          id: string
          title: string                      // Indonesian title
          title_en: string | null            // English title (null = fall back to ID)
          slug: string
          dept: string                       // open string — driven by LAYANAN_DEPTS config
          category: string | null            // sub-category within a dept (e.g. "Web GIS")
          description: string | null         // Indonesian description
          description_en: string | null      // English description (null = fall back to ID)
          icon: string | null
          image_url: string | null
          prices: PriceTier[] | null
          status: "active" | "draft" | "archived"
          featured_order: number | null      // 1, 2, or 3 = shown on homepage; null = not featured
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["layanan"]["Row"], "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["layanan"]["Insert"]>
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
          dept: string | null           // open string — see note in supabase_open_dept_migration.sql re: 'lingkungan' vs 'arcgis'
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface PriceTier {
  name: string       // e.g. "Starter", "Standard", "Premium"
  price: number      // in IDR, e.g. 3000000
  bio: string        // short tagline for this tier
  features: string[] // list of what's included
}

/** Content status used across all tables (DB column is text; app only ever writes these values) */
export type RowStatus = "active" | "draft" | "archived"

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      berita: {
        Row: {
          author: string
          body: string | null
          canonical_url: string | null
          category: string
          created_at: string | null
          excerpt: string | null
          featured: boolean
          id: string
          image_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image: string | null
          published_at: string
          read_minutes: number
          slug: string
          status: string
          tags: string[] | null
          title: string
          views: number
        }
        Insert: {
          author?: string
          body?: string | null
          canonical_url?: string | null
          category?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string
          read_minutes?: number
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          views?: number
        }
        Update: {
          author?: string
          body?: string | null
          canonical_url?: string | null
          category?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string
          read_minutes?: number
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          views?: number
        }
        Relationships: []
      }
      informasi: {
        Row: {
          author: string
          body: string | null
          canonical_url: string | null
          category: string
          created_at: string | null
          excerpt: string | null
          featured: boolean
          id: string
          image_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image: string | null
          published_at: string
          read_minutes: number
          slug: string
          status: string
          tags: string[] | null
          title: string
          views: number
        }
        Insert: {
          author?: string
          body?: string | null
          canonical_url?: string | null
          category?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string
          read_minutes?: number
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          views?: number
        }
        Update: {
          author?: string
          body?: string | null
          canonical_url?: string | null
          category?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string
          read_minutes?: number
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          views?: number
        }
        Relationships: []
      }
      layanan: {
        Row: {
          canonical_url: string | null
          category: string | null
          created_at: string | null
          dept: string
          description: string | null
          featured_order: number | null
          icon: string | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image: string | null
          prices: Json | null
          slug: string
          status: string
          title: string
        }
        Insert: {
          canonical_url?: string | null
          category?: string | null
          created_at?: string | null
          dept: string
          description?: string | null
          featured_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          prices?: Json | null
          slug: string
          status?: string
          title: string
        }
        Update: {
          canonical_url?: string | null
          category?: string | null
          created_at?: string | null
          dept?: string
          description?: string | null
          featured_order?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          prices?: Json | null
          slug?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "layanan_dept_fkey"
            columns: ["dept"]
            isOneToOne: false
            referencedRelation: "layanan_depts"
            referencedColumns: ["value"]
          },
        ]
      }
      layanan_depts: {
        Row: {
          badge_class: string | null
          color: string | null
          description: string | null
          label: string
          sort_order: number | null
          sub_categories: string[] | null
          value: string
        }
        Insert: {
          badge_class?: string | null
          color?: string | null
          description?: string | null
          label: string
          sort_order?: number | null
          sub_categories?: string[] | null
          value: string
        }
        Update: {
          badge_class?: string | null
          color?: string | null
          description?: string | null
          label?: string
          sort_order?: number | null
          sub_categories?: string[] | null
          value?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          canonical_url: string | null
          category: string | null
          created_at: string | null
          dept: string
          description: string | null
          features: string[] | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image: string | null
          result_url: string | null
          slug: string
          status: string
          tech_stack: string[] | null
          title: string
        }
        Insert: {
          canonical_url?: string | null
          category?: string | null
          created_at?: string | null
          dept: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          result_url?: string | null
          slug: string
          status?: string
          tech_stack?: string[] | null
          title: string
        }
        Update: {
          canonical_url?: string | null
          category?: string | null
          created_at?: string | null
          dept?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          result_url?: string | null
          slug?: string
          status?: string
          tech_stack?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_dept_fkey"
            columns: ["dept"]
            isOneToOne: false
            referencedRelation: "layanan_depts"
            referencedColumns: ["value"]
          },
        ]
      }
      promo_banner: {
        Row: {
          alt: string
          created_at: string | null
          cta_href: string | null
          cta_text: string | null
          eyebrow: string | null
          id: string
          image_url: string
          sort_order: number
          status: string
          subtitle: string | null
          title: string | null
        }
        Insert: {
          alt: string
          created_at?: string | null
          cta_href?: string | null
          cta_text?: string | null
          eyebrow?: string | null
          id?: string
          image_url: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          alt?: string
          created_at?: string | null
          cta_href?: string | null
          cta_text?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      tim: {
        Row: {
          bio: string | null
          created_at: string | null
          dept: string | null
          github_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          name: string
          order_num: number
          photo_url: string | null
          role: string
          status: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          dept?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          name: string
          order_num?: number
          photo_url?: string | null
          role: string
          status?: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          dept?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          name?: string
          order_num?: number
          photo_url?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ── Convenience type aliases (used by admin dashboard & pages) ──────────────
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

export type Tim = Database["public"]["Tables"]["tim"]["Row"]
export type TimInsert = Database["public"]["Tables"]["tim"]["Insert"]

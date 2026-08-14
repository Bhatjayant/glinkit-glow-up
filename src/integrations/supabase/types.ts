export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      card_blocked_dates: {
        Row: {
          blocked_date: string
          card_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_date: string
          card_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_date?: string
          card_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_blocked_dates_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_bookings: {
        Row: {
          card_id: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          purpose: string
          slot_date: string
          slot_time: string
          status: string
          updated_at: string
        }
        Insert: {
          card_id: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          purpose?: string
          slot_date: string
          slot_time?: string
          status?: string
          updated_at?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          purpose?: string
          slot_date?: string
          slot_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_bookings_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_events: {
        Row: {
          card_id: string
          created_at: string
          event_type: string
          id: string
          label: string
          source: string
        }
        Insert: {
          card_id: string
          created_at?: string
          event_type: string
          id?: string
          label?: string
          source?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          event_type?: string
          id?: string
          label?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_leads: {
        Row: {
          archived: boolean
          card_id: string
          company: string
          created_at: string
          designation: string
          email: string
          follow_up_date: string | null
          id: string
          interest: string
          message: string
          name: string
          notes: string
          phone: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          card_id: string
          company?: string
          created_at?: string
          designation?: string
          email?: string
          follow_up_date?: string | null
          id?: string
          interest?: string
          message?: string
          name?: string
          notes?: string
          phone?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          card_id?: string
          company?: string
          created_at?: string
          designation?: string
          email?: string
          follow_up_date?: string | null
          id?: string
          interest?: string
          message?: string
          name?: string
          notes?: string
          phone?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_leads_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_media: {
        Row: {
          card_id: string
          created_at: string
          id: string
          kind: string
          sort_order: number
          title: string
          url: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          kind?: string
          sort_order?: number
          title?: string
          url: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          kind?: string
          sort_order?: number
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_media_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_products: {
        Row: {
          allow_buy: boolean
          allow_enquiry: boolean
          card_id: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          mrp: number | null
          name: string
          offer_price: number | null
          sort_order: number
        }
        Insert: {
          allow_buy?: boolean
          allow_enquiry?: boolean
          card_id: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          mrp?: number | null
          name?: string
          offer_price?: number | null
          sort_order?: number
        }
        Update: {
          allow_buy?: boolean
          allow_enquiry?: boolean
          card_id?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          mrp?: number | null
          name?: string
          offer_price?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_products_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          about: string
          address: string | null
          bank_details: string | null
          bg_style: string
          booking_duration: number
          booking_enabled: boolean
          booking_note: string
          booking_slots: string
          company: string
          created_at: string
          display_name: string
          email: string | null
          headline: string
          id: string
          job_title: string
          layout: string
          logo_url: string | null
          maps_url: string | null
          owner_id: string
          phone: string | null
          photo_url: string | null
          published: boolean
          section_order: Json
          seo_description: string
          short_bio: string
          slug: string
          tagline: string
          theme: string
          timezone: string
          updated_at: string
          upi_id: string | null
          view_count: number
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          about?: string
          address?: string | null
          bank_details?: string | null
          bg_style?: string
          booking_duration?: number
          booking_enabled?: boolean
          booking_note?: string
          booking_slots?: string
          company?: string
          created_at?: string
          display_name?: string
          email?: string | null
          headline?: string
          id?: string
          job_title?: string
          layout?: string
          logo_url?: string | null
          maps_url?: string | null
          owner_id: string
          phone?: string | null
          photo_url?: string | null
          published?: boolean
          section_order?: Json
          seo_description?: string
          short_bio?: string
          slug: string
          tagline?: string
          theme?: string
          timezone?: string
          updated_at?: string
          upi_id?: string | null
          view_count?: number
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          about?: string
          address?: string | null
          bank_details?: string | null
          bg_style?: string
          booking_duration?: number
          booking_enabled?: boolean
          booking_note?: string
          booking_slots?: string
          company?: string
          created_at?: string
          display_name?: string
          email?: string | null
          headline?: string
          id?: string
          job_title?: string
          layout?: string
          logo_url?: string | null
          maps_url?: string | null
          owner_id?: string
          phone?: string | null
          photo_url?: string | null
          published?: boolean
          section_order?: Json
          seo_description?: string
          short_bio?: string
          slug?: string
          tagline?: string
          theme?: string
          timezone?: string
          updated_at?: string
          upi_id?: string | null
          view_count?: number
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          plan: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          plan?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      card_blocked_days: { Args: { _card_id: string }; Returns: string[] }
      card_is_published: { Args: { _card_id: string }; Returns: boolean }
      card_taken_slots: {
        Args: { _card_id: string; _date: string }
        Returns: string[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_card_view: { Args: { _slug: string }; Returns: undefined }
      owns_card: { Args: { _card_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

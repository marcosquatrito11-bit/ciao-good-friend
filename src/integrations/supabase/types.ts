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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          experience_date_id: string | null
          experience_id: string
          guide_id: string
          guide_payout: number
          id: string
          notes: string | null
          participants: number
          platform_fee: number
          status: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id: string | null
          total_amount: number
          tourist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          experience_date_id?: string | null
          experience_id: string
          guide_id: string
          guide_payout?: number
          id?: string
          notes?: string | null
          participants?: number
          platform_fee?: number
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id?: string | null
          total_amount: number
          tourist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          experience_date_id?: string | null
          experience_id?: string
          guide_id?: string
          guide_payout?: number
          id?: string
          notes?: string | null
          participants?: number
          platform_fee?: number
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id?: string | null
          total_amount?: number
          tourist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_experience_date_id_fkey"
            columns: ["experience_date_id"]
            isOneToOne: false
            referencedRelation: "experience_dates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_dates: {
        Row: {
          created_at: string
          experience_id: string
          id: string
          spots_left: number
          starts_at: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          id?: string
          spots_left: number
          starts_at: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          id?: string
          spots_left?: number
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_dates_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          bookings_count: number | null
          category: Database["public"]["Enums"]["experience_category"]
          created_at: string
          description: string | null
          duration_minutes: number
          guide_id: string
          id: string
          images: string[] | null
          included: string[] | null
          languages: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          max_participants: number
          meeting_point: string | null
          min_participants: number
          not_included: string[] | null
          price_amount: number
          price_currency: Database["public"]["Enums"]["currency_code"]
          rating: number | null
          requirements: string | null
          reviews_count: number | null
          slug: string | null
          status: Database["public"]["Enums"]["experience_status"]
          title: string
          updated_at: string
        }
        Insert: {
          bookings_count?: number | null
          category: Database["public"]["Enums"]["experience_category"]
          created_at?: string
          description?: string | null
          duration_minutes: number
          guide_id: string
          id?: string
          images?: string[] | null
          included?: string[] | null
          languages?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_participants?: number
          meeting_point?: string | null
          min_participants?: number
          not_included?: string[] | null
          price_amount: number
          price_currency?: Database["public"]["Enums"]["currency_code"]
          rating?: number | null
          requirements?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["experience_status"]
          title: string
          updated_at?: string
        }
        Update: {
          bookings_count?: number | null
          category?: Database["public"]["Enums"]["experience_category"]
          created_at?: string
          description?: string | null
          duration_minutes?: number
          guide_id?: string
          id?: string
          images?: string[] | null
          included?: string[] | null
          languages?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_participants?: number
          meeting_point?: string | null
          min_participants?: number
          not_included?: string[] | null
          price_amount?: number
          price_currency?: Database["public"]["Enums"]["currency_code"]
          rating?: number | null
          requirements?: string | null
          reviews_count?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["experience_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          experience_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_applications: {
        Row: {
          areas_covered: string[] | null
          bio_long: string | null
          bio_short: string | null
          certificate_urls: string[] | null
          certifications: Json | null
          city: string | null
          created_at: string
          current_step: number
          date_of_birth: string | null
          emergency_contact: string | null
          first_name: string | null
          headline: string | null
          iban: string | null
          id: string
          id_document_url: string | null
          insurance_url: string | null
          languages: Json | null
          last_name: string | null
          motivation: string | null
          nationality: string | null
          phone: string | null
          privacy_accepted: boolean | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specializations:
            | Database["public"]["Enums"]["experience_category"][]
            | null
          status: Database["public"]["Enums"]["guide_status"]
          stripe_account_id: string | null
          submitted_at: string | null
          terms_accepted: boolean | null
          updated_at: string
          user_id: string
          vat_number: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          areas_covered?: string[] | null
          bio_long?: string | null
          bio_short?: string | null
          certificate_urls?: string[] | null
          certifications?: Json | null
          city?: string | null
          created_at?: string
          current_step?: number
          date_of_birth?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          headline?: string | null
          iban?: string | null
          id?: string
          id_document_url?: string | null
          insurance_url?: string | null
          languages?: Json | null
          last_name?: string | null
          motivation?: string | null
          nationality?: string | null
          phone?: string | null
          privacy_accepted?: boolean | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations?:
            | Database["public"]["Enums"]["experience_category"][]
            | null
          status?: Database["public"]["Enums"]["guide_status"]
          stripe_account_id?: string | null
          submitted_at?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          areas_covered?: string[] | null
          bio_long?: string | null
          bio_short?: string | null
          certificate_urls?: string[] | null
          certifications?: Json | null
          city?: string | null
          created_at?: string
          current_step?: number
          date_of_birth?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          headline?: string | null
          iban?: string | null
          id?: string
          id_document_url?: string | null
          insurance_url?: string | null
          languages?: Json | null
          last_name?: string | null
          motivation?: string | null
          nationality?: string | null
          phone?: string | null
          privacy_accepted?: boolean | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations?:
            | Database["public"]["Enums"]["experience_category"][]
            | null
          status?: Database["public"]["Enums"]["guide_status"]
          stripe_account_id?: string | null
          submitted_at?: string | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      guides: {
        Row: {
          application_id: string | null
          areas_covered: string[] | null
          bio_long: string | null
          bookings_count: number | null
          created_at: string
          experiences_count: number | null
          headline: string | null
          id: string
          is_active: boolean | null
          languages: Json | null
          rating: number | null
          reviews_count: number | null
          specializations:
            | Database["public"]["Enums"]["experience_category"][]
            | null
          stripe_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          areas_covered?: string[] | null
          bio_long?: string | null
          bookings_count?: number | null
          created_at?: string
          experiences_count?: number | null
          headline?: string | null
          id?: string
          is_active?: boolean | null
          languages?: Json | null
          rating?: number | null
          reviews_count?: number | null
          specializations?:
            | Database["public"]["Enums"]["experience_category"][]
            | null
          stripe_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          areas_covered?: string[] | null
          bio_long?: string | null
          bookings_count?: number | null
          created_at?: string
          experiences_count?: number | null
          headline?: string | null
          id?: string
          is_active?: boolean | null
          languages?: Json | null
          rating?: number | null
          reviews_count?: number | null
          specializations?:
            | Database["public"]["Enums"]["experience_category"][]
            | null
          stripe_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "guide_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          experience_id: string
          guide_id: string
          id: string
          rating: number
          tourist_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          experience_id: string
          guide_id: string
          id?: string
          rating: number
          tourist_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          experience_id?: string
          guide_id?: string
          id?: string
          rating?: number
          tourist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "guide" | "tourist"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "refunded"
      currency_code: "EUR" | "USD" | "GBP"
      experience_category:
        | "hiking"
        | "volcano"
        | "food"
        | "wine"
        | "culture"
        | "photo"
        | "adventure"
        | "family"
        | "wellness"
        | "sea"
      experience_status: "draft" | "pending" | "published" | "archived"
      guide_status: "draft" | "pending" | "approved" | "rejected" | "suspended"
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
      app_role: ["admin", "guide", "tourist"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "refunded",
      ],
      currency_code: ["EUR", "USD", "GBP"],
      experience_category: [
        "hiking",
        "volcano",
        "food",
        "wine",
        "culture",
        "photo",
        "adventure",
        "family",
        "wellness",
        "sea",
      ],
      experience_status: ["draft", "pending", "published", "archived"],
      guide_status: ["draft", "pending", "approved", "rejected", "suspended"],
    },
  },
} as const

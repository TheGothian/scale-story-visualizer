export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_verified: boolean
          last_sign_in_at: string | null
          password_hash: string
          reset_token: string | null
          reset_token_expires_at: string | null
          updated_at: string
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          is_verified?: boolean
          last_sign_in_at?: string | null
          password_hash: string
          reset_token?: string | null
          reset_token_expires_at?: string | null
          updated_at?: string
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_verified?: boolean
          last_sign_in_at?: string | null
          password_hash?: string
          reset_token?: string | null
          reset_token_expires_at?: string | null
          updated_at?: string
          verification_token?: string | null
        }
        Relationships: []
      }
      body_compositions: {
        Row: {
          body_fat_percentage: number | null
          bone_mass: number | null
          created_at: string
          date: string
          id: string
          measurements: Json | null
          metabolic_age: number | null
          muscle_mass: number | null
          updated_at: string
          user_id: string
          visceral_fat: number | null
          water_percentage: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          bone_mass?: number | null
          created_at?: string
          date: string
          id?: string
          measurements?: Json | null
          metabolic_age?: number | null
          muscle_mass?: number | null
          updated_at?: string
          user_id: string
          visceral_fat?: number | null
          water_percentage?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          bone_mass?: number | null
          created_at?: string
          date?: string
          id?: string
          measurements?: Json | null
          metabolic_age?: number | null
          muscle_mass?: number | null
          updated_at?: string
          user_id?: string
          visceral_fat?: number | null
          water_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_compositions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bodybuilding_goals: {
        Row: {
          caloric_target: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metrics: string[] | null
          name: string
          phase: string
          protein_target: number | null
          target_body_fat: number | null
          target_date: string
          target_muscle_mass: number | null
          target_weight: number | null
          unit: string
          updated_at: string
          user_id: string
          weekly_weight_target: number | null
        }
        Insert: {
          caloric_target?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metrics?: string[] | null
          name: string
          phase: string
          protein_target?: number | null
          target_body_fat?: number | null
          target_date: string
          target_muscle_mass?: number | null
          target_weight?: number | null
          unit: string
          updated_at?: string
          user_id: string
          weekly_weight_target?: number | null
        }
        Update: {
          caloric_target?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metrics?: string[] | null
          name?: string
          phase?: string
          protein_target?: number | null
          target_body_fat?: number | null
          target_date?: string
          target_muscle_mass?: number | null
          target_weight?: number | null
          unit?: string
          updated_at?: string
          user_id?: string
          weekly_weight_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bodybuilding_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_predictions: {
        Row: {
          created_at: string
          id: string
          name: string
          predicted_weight: number
          target_date: string
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          predicted_weight: number
          target_date: string
          unit: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          predicted_weight?: number
          target_date?: string
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          note: string | null
          unit: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          note?: string | null
          unit: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          target_date: string
          target_weight: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          target_date: string
          target_weight: number
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target_date?: string
          target_weight?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weight_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const

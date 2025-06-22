export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

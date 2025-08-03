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
      exam_attempts: {
        Row: {
          exam_id: string
          finished_at: string | null
          fullscreen_exits: number | null
          id: string
          is_completed: boolean | null
          percentage: number | null
          score: number | null
          started_at: string | null
          student_id: string
          tab_switches: number | null
          time_spent_seconds: number | null
          total_possible_score: number | null
        }
        Insert: {
          exam_id: string
          finished_at?: string | null
          fullscreen_exits?: number | null
          id?: string
          is_completed?: boolean | null
          percentage?: number | null
          score?: number | null
          started_at?: string | null
          student_id: string
          tab_switches?: number | null
          time_spent_seconds?: number | null
          total_possible_score?: number | null
        }
        Update: {
          exam_id?: string
          finished_at?: string | null
          fullscreen_exits?: number | null
          id?: string
          is_completed?: boolean | null
          percentage?: number | null
          score?: number | null
          started_at?: string | null
          student_id?: string
          tab_switches?: number | null
          time_spent_seconds?: number | null
          total_possible_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          allow_review: boolean | null
          created_at: string | null
          created_by: string
          description: string | null
          duration_minutes: number
          id: string
          instructions: string | null
          show_results_immediately: boolean | null
          status: Database["public"]["Enums"]["exam_status"] | null
          subject_id: string
          title: string
          topic_id: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          allow_review?: boolean | null
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructions?: string | null
          show_results_immediately?: boolean | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          subject_id: string
          title: string
          topic_id?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          allow_review?: boolean | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructions?: string | null
          show_results_immediately?: boolean | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          subject_id?: string
          title?: string
          topic_id?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      question_navigation: {
        Row: {
          attempt_id: string
          id: string
          question_id: string
          status: Database["public"]["Enums"]["question_status"] | null
          time_spent_seconds: number | null
          visited_at: string | null
        }
        Insert: {
          attempt_id: string
          id?: string
          question_id: string
          status?: Database["public"]["Enums"]["question_status"] | null
          time_spent_seconds?: number | null
          visited_at?: string | null
        }
        Update: {
          attempt_id?: string
          id?: string
          question_id?: string
          status?: Database["public"]["Enums"]["question_status"] | null
          time_spent_seconds?: number | null
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_navigation_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_navigation_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          option_text: string
          order_index: number
          question_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          option_text: string
          order_index: number
          question_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          option_text?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string | null
          correct_numeric_value: number | null
          correct_unit: string | null
          created_at: string | null
          exam_id: string
          explanation: string | null
          id: string
          image_url: string | null
          order_index: number
          points: number | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          correct_answer?: string | null
          correct_numeric_value?: number | null
          correct_unit?: string | null
          created_at?: string | null
          exam_id: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          order_index: number
          points?: number | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          correct_answer?: string | null
          correct_numeric_value?: number | null
          correct_unit?: string | null
          created_at?: string | null
          exam_id?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          order_index?: number
          points?: number | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      student_answers: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          attempt_id: string
          id: string
          is_correct: boolean | null
          numeric_value: number | null
          points_earned: number | null
          question_id: string
          selected_option_id: string | null
          unit: string | null
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          numeric_value?: number | null
          points_earned?: number | null
          question_id: string
          selected_option_id?: string | null
          unit?: string | null
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          numeric_value?: number | null
          points_earned?: number | null
          question_id?: string
          selected_option_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          subject_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          subject_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "professor" | "student"
      exam_status: "draft" | "published" | "archived"
      question_status: "not_visited" | "visited" | "answered"
      question_type: "multiple_choice" | "true_false" | "numeric_with_unit"
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
      app_role: ["admin", "professor", "student"],
      exam_status: ["draft", "published", "archived"],
      question_status: ["not_visited", "visited", "answered"],
      question_type: ["multiple_choice", "true_false", "numeric_with_unit"],
    },
  },
} as const

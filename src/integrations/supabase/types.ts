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
      assessment_questions: {
        Row: {
          assessment_id: string
          expected_answer: string
          id: string
          options: Json
          points: number
          question_order: number
          question_text: string
          question_type: string
        }
        Insert: {
          assessment_id: string
          expected_answer: string
          id?: string
          options: Json
          points?: number
          question_order?: number
          question_text: string
          question_type: string
        }
        Update: {
          assessment_id?: string
          expected_answer?: string
          id?: string
          options?: Json
          points?: number
          question_order?: number
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_type: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidate_responses: {
        Row: {
          ai_feedback: string
          ai_score: number
          candidate_response: string
          created_at: string
          id: string
          interview_assessment_id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          ai_feedback: string
          ai_score: number
          candidate_response: string
          created_at?: string
          id?: string
          interview_assessment_id: string
          question_id: string
          updated_at?: string
        }
        Update: {
          ai_feedback?: string
          ai_score?: number
          candidate_response?: string
          created_at?: string
          id?: string
          interview_assessment_id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_responses_interview_assessment_id_fkey"
            columns: ["interview_assessment_id"]
            isOneToOne: false
            referencedRelation: "interview_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          applied_date: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          position: string | null
          status: string
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          applied_date?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          position?: string | null
          status: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          applied_date?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          position?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exam_bank: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          difficulty: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at: string
          created_by: string
          description?: string | null
          difficulty: string
          id?: string
          title: string
          updated_at: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      interview_assessments: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          interview_id: string
          notes: string | null
          scheduled_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          interview_id: string
          notes?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          interview_id?: string
          notes?: string | null
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_assessments_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_exams: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          interview_id: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          interview_id: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          interview_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_exams_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exam_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_exams_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_interviewers: {
        Row: {
          id: string
          interview_id: string
          user_id: string
        }
        Insert: {
          id?: string
          interview_id: string
          user_id: string
        }
        Update: {
          id?: string
          interview_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_interviewers_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string | null
          candidate_name: string
          created_at: string
          date: string
          id: string
          interviewer_id: string | null
          position: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          candidate_name: string
          created_at?: string
          date: string
          id?: string
          interviewer_id?: string | null
          position: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          candidate_name?: string
          created_at?: string
          date?: string
          id?: string
          interviewer_id?: string | null
          position?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          company: string
          created_at: string
          created_by: string
          deadline: string | null
          description: string
          id: string
          is_active: boolean
          location: string
          requirements: string | null
          salary: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          company: string
          created_at?: string
          created_by: string
          deadline?: string | null
          description: string
          id?: string
          is_active?: boolean
          location: string
          requirements?: string | null
          salary?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          company?: string
          created_at?: string
          created_by?: string
          deadline?: string | null
          description?: string
          id?: string
          is_active?: boolean
          location?: string
          requirements?: string | null
          salary?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean
          avatar_url: string | null
          bio: string | null
          first_name: string | null
          id: string
          last_name: string | null
          resume_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          approved?: boolean
          avatar_url?: string | null
          bio?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          approved?: boolean
          avatar_url?: string | null
          bio?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      match_candidates_to_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "hr" | "job_seeker"
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
    Enums: {
      user_role: ["admin", "hr", "job_seeker"],
    },
  },
} as const

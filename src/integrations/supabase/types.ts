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
          expected_answer: string | null
          id: string
          options: Json | null
          points: number
          question_order: number
          question_text: string
          question_type: string
        }
        Insert: {
          assessment_id: string
          expected_answer?: string | null
          id?: string
          options?: Json | null
          points?: number
          question_order?: number
          question_text: string
          question_type: string
        }
        Update: {
          assessment_id?: string
          expected_answer?: string | null
          id?: string
          options?: Json | null
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
          assessment_type: string
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
          ai_feedback: string | null
          ai_score: number | null
          candidate_response: string | null
          created_at: string
          id: string
          interview_assessment_id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          candidate_response?: string | null
          created_at?: string
          id?: string
          interview_assessment_id: string
          question_id: string
          updated_at?: string
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          candidate_response?: string | null
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
          created_at?: string
          created_by: string
          description?: string | null
          difficulty: string
          id?: string
          title: string
          updated_at?: string
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
            foreignKeyName: "interview_assessments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
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
          candidate_name: string
          created_at: string
          date: string
          id: string
          position: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_name: string
          created_at?: string
          date: string
          id?: string
          position: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_name?: string
          created_at?: string
          date?: string
          id?: string
          position?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          avatar_url: string | null
          bio: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
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
    }
    Enums: {
      user_role: "admin" | "hr" | "job_seeker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

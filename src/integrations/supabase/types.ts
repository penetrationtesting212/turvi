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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_campaign_id: string | null
          related_mention_id: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_campaign_id?: string | null
          related_mention_id?: string | null
          severity: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_campaign_id?: string | null
          related_mention_id?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_related_campaign_id_fkey"
            columns: ["related_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_related_mention_id_fkey"
            columns: ["related_mention_id"]
            isOneToOne: false
            referencedRelation: "mentions"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_monitors: {
        Row: {
          alert_settings: Json | null
          brand_name: string
          created_at: string
          id: string
          is_active: boolean | null
          keywords: Json
          platforms: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_settings?: Json | null
          brand_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords: Json
          platforms: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_settings?: Json | null
          brand_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: Json
          platforms?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_executions: {
        Row: {
          campaign_id: string
          channel: string
          clicked_count: number | null
          completed_at: string | null
          conversion_count: number | null
          created_at: string
          delivered_count: number | null
          executed_at: string | null
          id: string
          opened_count: number | null
          revenue_generated: number | null
          sent_count: number | null
          status: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          channel: string
          clicked_count?: number | null
          completed_at?: string | null
          conversion_count?: number | null
          created_at?: string
          delivered_count?: number | null
          executed_at?: string | null
          id?: string
          opened_count?: number | null
          revenue_generated?: number | null
          sent_count?: number | null
          status?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          channel?: string
          clicked_count?: number | null
          completed_at?: string | null
          conversion_count?: number | null
          created_at?: string
          delivered_count?: number | null
          executed_at?: string | null
          id?: string
          opened_count?: number | null
          revenue_generated?: number | null
          sent_count?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_executions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ai_recommendations: Json | null
          auto_optimize: boolean | null
          campaign_type: string
          channels: Json
          completed_at: string | null
          content: Json
          created_at: string
          id: string
          launched_at: string | null
          name: string
          performance_metrics: Json | null
          schedule: Json | null
          status: string
          target_audience: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          auto_optimize?: boolean | null
          campaign_type: string
          channels: Json
          completed_at?: string | null
          content: Json
          created_at?: string
          id?: string
          launched_at?: string | null
          name: string
          performance_metrics?: Json | null
          schedule?: Json | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          auto_optimize?: boolean | null
          campaign_type?: string
          channels?: Json
          completed_at?: string | null
          content?: Json
          created_at?: string
          id?: string
          launched_at?: string | null
          name?: string
          performance_metrics?: Json | null
          schedule?: Json | null
          status?: string
          target_audience?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          bio: string | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          id: string
          is_active: boolean | null
          languages: string[] | null
          name: string
          profile_image_url: string | null
          qualifications: string[] | null
          specialization: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name: string
          profile_image_url?: string | null
          qualifications?: string[] | null
          specialization: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          languages?: string[] | null
          name?: string
          profile_image_url?: string | null
          qualifications?: string[] | null
          specialization?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          click_rate: number | null
          content: string
          created_at: string
          id: string
          name: string
          open_rate: number | null
          scheduled_time: string | null
          sent_count: number | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          click_rate?: number | null
          content: string
          created_at?: string
          id?: string
          name: string
          open_rate?: number | null
          scheduled_time?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          click_rate?: number | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          open_rate?: number | null
          scheduled_time?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_segments: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          name: string
          subscriber_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name: string
          subscriber_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          subscriber_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_workflows: {
        Row: {
          actions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          prompt: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          prompt: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          prompt?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          prompt: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          prompt: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          user_id?: string
        }
        Relationships: []
      }
      health_packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          tests_included: string[] | null
          updated_at: string | null
          user_id: string
          validity_days: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          tests_included?: string[] | null
          updated_at?: string | null
          user_id: string
          validity_days?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          tests_included?: string[] | null
          updated_at?: string | null
          user_id?: string
          validity_days?: number | null
        }
        Relationships: []
      }
      marketing_leads: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          is_shared: boolean | null
          lead_score: number | null
          lead_source: string
          lead_status: string
          message: string | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          services_interested: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          is_shared?: boolean | null
          lead_score?: number | null
          lead_source?: string
          lead_status?: string
          message?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          services_interested?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          is_shared?: boolean | null
          lead_score?: number | null
          lead_source?: string
          lead_status?: string
          message?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          services_interested?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      mentions: {
        Row: {
          ai_response_suggestion: string | null
          author: string | null
          content: string
          created_at: string
          detected_at: string
          engagement_metrics: Json | null
          id: string
          is_crisis: boolean | null
          is_viral: boolean | null
          monitor_id: string
          platform: string
          sentiment: string
          sentiment_score: number
          status: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          ai_response_suggestion?: string | null
          author?: string | null
          content: string
          created_at?: string
          detected_at?: string
          engagement_metrics?: Json | null
          id?: string
          is_crisis?: boolean | null
          is_viral?: boolean | null
          monitor_id: string
          platform: string
          sentiment: string
          sentiment_score: number
          status?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          ai_response_suggestion?: string | null
          author?: string | null
          content?: string
          created_at?: string
          detected_at?: string
          engagement_metrics?: Json | null
          id?: string
          is_crisis?: boolean | null
          is_viral?: boolean | null
          monitor_id?: string
          platform?: string
          sentiment?: string
          sentiment_score?: number
          status?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentions_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "brand_monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          email: string
          id: string
          inquiry_type: string
          message: string | null
          name: string
          phone: string
          source: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          email: string
          id?: string
          inquiry_type: string
          message?: string | null
          name: string
          phone: string
          source?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          email?: string
          id?: string
          inquiry_type?: string
          message?: string | null
          name?: string
          phone?: string
          source?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          platform: string | null
          published_at: string | null
          scheduled_for: string
          status: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          platform?: string | null
          published_at?: string | null
          scheduled_for: string
          status?: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          platform?: string | null
          published_at?: string | null
          scheduled_for?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      sentiment_analysis: {
        Row: {
          confidence: number
          created_at: string
          id: string
          sentiment: string
          text: string
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          id?: string
          sentiment: string
          text: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          sentiment?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          account_name: string
          created_at: string
          credentials: Json
          encrypted_credentials: string | null
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          created_at?: string
          credentials?: Json
          encrypted_credentials?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          created_at?: string
          credentials?: Json
          encrypted_credentials?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          content: string
          created_at: string
          engagement_score: number | null
          id: string
          platform: string
          platform_account_id: string | null
          scheduled_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          platform: string
          platform_account_id?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          platform?: string
          platform_account_id?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string | null
          features: Json
          has_analytics: boolean | null
          has_multilingual: boolean | null
          has_whatsapp: boolean | null
          id: string
          max_locations: number | null
          max_posts_per_month: number | null
          name: string
          price_monthly: number
          price_yearly: number
        }
        Insert: {
          created_at?: string | null
          features?: Json
          has_analytics?: boolean | null
          has_multilingual?: boolean | null
          has_whatsapp?: boolean | null
          id?: string
          max_locations?: number | null
          max_posts_per_month?: number | null
          name: string
          price_monthly: number
          price_yearly: number
        }
        Update: {
          created_at?: string | null
          features?: Json
          has_analytics?: boolean | null
          has_multilingual?: boolean | null
          has_whatsapp?: boolean | null
          id?: string
          max_locations?: number | null
          max_posts_per_month?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          patient_name: string
          rating: number
          review: string
          treatment_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          patient_name: string
          rating: number
          review: string
          treatment_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          patient_name?: string
          rating?: number
          review?: string
          treatment_type?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string | null
          expires_at: string | null
          id: string
          started_at: string | null
          status: string
          tier_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          tier_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          tier_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_social_credentials: {
        Args: { encrypted_data: string }
        Returns: Json
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_organization_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      log_sensitive_access: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "doctor" | "staff" | "patient"
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
      app_role: ["admin", "doctor", "staff", "patient"],
    },
  },
} as const

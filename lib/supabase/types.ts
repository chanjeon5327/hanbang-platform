// Supabase Database Types
// 이 파일은 supabase gen types typescript --project-id YOUR_PROJECT_ID 명령으로 자동 생성할 수 있습니다.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          phone: string | null
          is_verified: boolean
          kyc_status: 'pending' | 'submitted' | 'approved' | 'rejected'
          kyc_submitted_at: string | null
          kyc_approved_at: string | null
          social_provider: string | null
          social_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_verified?: boolean
          kyc_status?: 'pending' | 'submitted' | 'approved' | 'rejected'
          kyc_submitted_at?: string | null
          kyc_approved_at?: string | null
          social_provider?: string | null
          social_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_verified?: boolean
          kyc_status?: 'pending' | 'submitted' | 'approved' | 'rejected'
          kyc_submitted_at?: string | null
          kyc_approved_at?: string | null
          social_provider?: string | null
          social_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          category: 'kpop' | 'drama' | 'movie' | 'youtube' | 'webtoon' | 'webnovel' | 'other'
          target_amount: number
          current_amount: number
          yield_rate: number
          thumbnail_url: string | null
          video_url: string | null
          status: 'recruiting' | 'closed' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          min_investment: number
          max_investment: number | null
          total_shares: number
          sold_shares: number
          creator_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: 'kpop' | 'drama' | 'movie' | 'youtube' | 'webtoon' | 'webnovel' | 'other'
          target_amount: number
          current_amount?: number
          yield_rate: number
          thumbnail_url?: string | null
          video_url?: string | null
          status?: 'recruiting' | 'closed' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          min_investment?: number
          max_investment?: number | null
          total_shares: number
          sold_shares?: number
          creator_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: 'kpop' | 'drama' | 'movie' | 'youtube' | 'webtoon' | 'webnovel' | 'other'
          target_amount?: number
          current_amount?: number
          yield_rate?: number
          thumbnail_url?: string | null
          video_url?: string | null
          status?: 'recruiting' | 'closed' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          min_investment?: number
          max_investment?: number | null
          total_shares?: number
          sold_shares?: number
          creator_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          project_id: string
          amount: number
          shares: number
          price_per_share: number
          status: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method: 'krw' | 'crypto'
          transaction_id: string | null
          created_at: string
          completed_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          amount: number
          shares: number
          price_per_share: number
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method?: 'krw' | 'crypto'
          transaction_id?: string | null
          created_at?: string
          completed_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          amount?: number
          shares?: number
          price_per_share?: number
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
          payment_method?: 'krw' | 'crypto'
          transaction_id?: string | null
          created_at?: string
          completed_at?: string | null
          cancelled_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'deposit' | 'withdrawal' | 'investment' | 'dividend' | 'refund'
          amount: number
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          description: string | null
          reference_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'deposit' | 'withdrawal' | 'investment' | 'dividend' | 'refund'
          amount: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          description?: string | null
          reference_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'deposit' | 'withdrawal' | 'investment' | 'dividend' | 'refund'
          amount?: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          description?: string | null
          reference_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance_krw: number
          balance_kcp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance_krw?: number
          balance_kcp?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance_krw?: number
          balance_kcp?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'investment' | 'dividend' | 'project' | 'system'
          title: string
          message: string
          is_read: boolean
          link_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'investment' | 'dividend' | 'project' | 'system'
          title: string
          message: string
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'investment' | 'dividend' | 'project' | 'system'
          title?: string
          message?: string
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
      }
      kyc_verifications: {
        Row: {
          id: string
          user_id: string
          real_name: string | null
          birth_date: string | null
          phone: string | null
          address: string | null
          id_card_front_url: string | null
          id_card_back_url: string | null
          selfie_url: string | null
          status: 'pending' | 'submitted' | 'approved' | 'rejected'
          rejection_reason: string | null
          submitted_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          real_name?: string | null
          birth_date?: string | null
          phone?: string | null
          address?: string | null
          id_card_front_url?: string | null
          id_card_back_url?: string | null
          selfie_url?: string | null
          status?: 'pending' | 'submitted' | 'approved' | 'rejected'
          rejection_reason?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          real_name?: string | null
          birth_date?: string | null
          phone?: string | null
          address?: string | null
          id_card_front_url?: string | null
          id_card_back_url?: string | null
          selfie_url?: string | null
          status?: 'pending' | 'submitted' | 'approved' | 'rejected'
          rejection_reason?: string | null
          submitted_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}


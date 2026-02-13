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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      admin_home_config: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      admin_rail_config: {
        Row: {
          pinned_ids: string[] | null
          rail_key: string
          updated_at: string | null
        }
        Insert: {
          pinned_ids?: string[] | null
          rail_key: string
          updated_at?: string | null
        }
        Update: {
          pinned_ids?: string[] | null
          rail_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          room_key: string
          sender_label: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          room_key: string
          sender_label: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          room_key?: string
          sender_label?: string
        }
        Relationships: []
      }
      chat_messages_v2: {
        Row: {
          created_at: string
          id: string
          product_no: number
          room_key: string
          sender: string
          text: string
          ts: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_no: number
          room_key: string
          sender: string
          text: string
          ts: number
        }
        Update: {
          created_at?: string
          id?: string
          product_no?: number
          room_key?: string
          sender?: string
          text?: string
          ts?: number
        }
        Relationships: []
      }
      interest_registrations: {
        Row: {
          contact_type: string | null
          contact_value: string
          content_id: string
          created_at: string | null
          id: string
          push_enabled: boolean | null
        }
        Insert: {
          contact_type?: string | null
          contact_value: string
          content_id: string
          created_at?: string | null
          id?: string
          push_enabled?: boolean | null
        }
        Update: {
          contact_type?: string | null
          contact_value?: string
          content_id?: string
          created_at?: string | null
          id?: string
          push_enabled?: boolean | null
        }
        Relationships: []
      }
      kyc_requests: {
        Row: {
          created_at: string | null
          id: string
          provider: string | null
          request_payload: Json | null
          response_payload: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          provider?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          provider?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          birth_date: string | null
          created_at: string | null
          full_name: string | null
          id: string
          id_document_path: string | null
          nationality: string | null
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_image_path: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          id_document_path?: string | null
          nationality?: string | null
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_path?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          id_document_path?: string | null
          nationality?: string | null
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_path?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount: number
          asset_id: string | null
          created_at: string
          currency: string
          entry_type: string
          id: string
          ledger_posted_at: string | null
          memo: string | null
          metadata: Json | null
          order_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          amount?: number
          asset_id?: string | null
          created_at?: string
          currency?: string
          entry_type: string
          id?: string
          ledger_posted_at?: string | null
          memo?: string | null
          metadata?: Json | null
          order_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          amount?: number
          asset_id?: string | null
          created_at?: string
          currency?: string
          entry_type?: string
          id?: string
          ledger_posted_at?: string | null
          memo?: string | null
          metadata?: Json | null
          order_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      market_state: {
        Row: {
          last_price: number
          product_id: number
          updated_at: string
        }
        Insert: {
          last_price: number
          product_id: number
          updated_at?: string
        }
        Update: {
          last_price?: number
          product_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      ohlc_candles: {
        Row: {
          close: number
          created_at: string | null
          high: number
          id: string
          low: number
          market_id: string
          open: number
          time: string
          timeframe: string
        }
        Insert: {
          close: number
          created_at?: string | null
          high: number
          id?: string
          low: number
          market_id: string
          open: number
          time: string
          timeframe: string
        }
        Update: {
          close?: number
          created_at?: string | null
          high?: number
          id?: string
          low?: number
          market_id?: string
          open?: number
          time?: string
          timeframe?: string
        }
        Relationships: []
      }
      order_intents: {
        Row: {
          created_at: string
          id: string
          intent_type: string
          price: number
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intent_type: string
          price: number
          product_id: string
          quantity: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intent_type?: string
          price?: number
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      orderbook_levels: {
        Row: {
          level: number
          price: number
          product_id: number
          side: string
          updated_at: string
          volume: number
        }
        Insert: {
          level: number
          price: number
          product_id: number
          side: string
          updated_at?: string
          volume: number
        }
        Update: {
          level?: number
          price?: number
          product_id?: number
          side?: string
          updated_at?: string
          volume?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string
          filled_quantity: number | null
          id: string
          ledger_posted_at: string | null
          order_type: string
          price: number
          product_id: string
          quantity: number
          settled_at: string | null
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          filled_quantity?: number | null
          id?: string
          ledger_posted_at?: string | null
          order_type: string
          price: number
          product_id: string
          quantity: number
          settled_at?: string | null
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          filled_quantity?: number | null
          id?: string
          ledger_posted_at?: string | null
          order_type?: string
          price?: number
          product_id?: string
          quantity?: number
          settled_at?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio: {
        Row: {
          average_price: number | null
          created_at: string
          id: string
          product_id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          average_price?: number | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          average_price?: number | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      product_market_state: {
        Row: {
          last_price: number
          last_tick_at: string | null
          price_delta: number
          product_id: string
          updated_at: string
        }
        Insert: {
          last_price?: number
          last_tick_at?: string | null
          price_delta?: number
          product_id: string
          updated_at?: string
        }
        Update: {
          last_price?: number
          last_tick_at?: string | null
          price_delta?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_market_ticks: {
        Row: {
          close_price: number
          high_price: number
          id: number
          low_price: number
          open_price: number
          product_id: string
          tick_time: string
          volume: number
        }
        Insert: {
          close_price: number
          high_price: number
          id?: number
          low_price: number
          open_price: number
          product_id: string
          tick_time?: string
          volume?: number
        }
        Update: {
          close_price?: number
          high_price?: number
          id?: number
          low_price?: number
          open_price?: number
          product_id?: string
          tick_time?: string
          volume?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          available_supply: number | null
          category: string | null
          change_24h: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          remaining_quantity: number | null
          seller_id: string
          status: string | null
          title: string | null
          total_quantity: number | null
          total_supply: number | null
          user_id: string | null
        }
        Insert: {
          available_supply?: number | null
          category?: string | null
          change_24h?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          remaining_quantity?: number | null
          seller_id: string
          status?: string | null
          title?: string | null
          total_quantity?: number | null
          total_supply?: number | null
          user_id?: string | null
        }
        Update: {
          available_supply?: number | null
          category?: string | null
          change_24h?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          remaining_quantity?: number | null
          seller_id?: string
          status?: string | null
          title?: string | null
          total_quantity?: number | null
          total_supply?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number | null
          created_at: string
          email: string | null
          id: string
          nickname: string | null
          role: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          email?: string | null
          id: string
          nickname?: string | null
          role?: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          email?: string | null
          id?: string
          nickname?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          current_amount: number | null
          description: string | null
          id: string
          min_investment: number | null
          status: string | null
          target_amount: number
          thumbnail_url: string | null
          title: string
          yield_rate: number | null
        }
        Insert: {
          created_at?: string
          current_amount?: number | null
          description?: string | null
          id?: string
          min_investment?: number | null
          status?: string | null
          target_amount: number
          thumbnail_url?: string | null
          title: string
          yield_rate?: number | null
        }
        Update: {
          created_at?: string
          current_amount?: number | null
          description?: string | null
          id?: string
          min_investment?: number | null
          status?: string | null
          target_amount?: number
          thumbnail_url?: string | null
          title?: string
          yield_rate?: number | null
        }
        Relationships: []
      }
      seller_daily_settlement_finalizations: {
        Row: {
          finalized_at: string
          finalized_by: string | null
          seller_id: string
          settlement_date: string
        }
        Insert: {
          finalized_at?: string
          finalized_by?: string | null
          seller_id: string
          settlement_date: string
        }
        Update: {
          finalized_at?: string
          finalized_by?: string | null
          seller_id?: string
          settlement_date?: string
        }
        Relationships: []
      }
      settlement_batch_orders: {
        Row: {
          batch_id: string
          order_id: string
        }
        Insert: {
          batch_id: string
          order_id: string
        }
        Update: {
          batch_id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_batch_orders_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "settlement_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_batches: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          gross_amount: number
          id: string
          net_amount: number
          order_count: number
          platform_fee: number
          prev_hash: string | null
          seller_id: string
          settlement_date: string
          snapshot: Json
          snapshot_hash: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          order_count: number
          platform_fee: number
          prev_hash?: string | null
          seller_id: string
          settlement_date: string
          snapshot?: Json
          snapshot_hash: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          order_count?: number
          platform_fee?: number
          prev_hash?: string | null
          seller_id?: string
          settlement_date?: string
          snapshot?: Json
          snapshot_hash?: string
        }
        Relationships: []
      }
      support_messages_v2: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          sender: string
          text: string
          ticket_key: string
          ts: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          sender: string
          text: string
          ticket_key: string
          ts: number
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          sender?: string
          text?: string
          ticket_key?: string
          ts?: number
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount: number
          created_at: string
          id: string
          price_at_trade: number
          product_id: string
          quantity: number
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          price_at_trade?: number
          product_id?: string
          quantity?: number
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          price_at_trade?: number
          product_id?: string
          quantity?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_interest_ratings: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_tastes: {
        Row: {
          item_id: string
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          item_id: string
          score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          item_id?: string
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_verified: boolean | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_verified?: boolean | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_settlement_daily: {
        Row: {
          gross_amount: number | null
          net_amount: number | null
          order_count: number | null
          platform_fee: number | null
          seller_id: string | null
          settlement_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_daily_settlement_net: {
        Row: {
          gross_amount: number | null
          net_amount: number | null
          order_count: number | null
          platform_fee: number | null
          seller_id: string | null
          settlement_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_daily_settlement_raw: {
        Row: {
          gross_amount: number | null
          order_count: number | null
          seller_id: string | null
          settlement_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_settlement_daily: {
        Row: {
          day: string | null
          gross_amount: number | null
          order_count: number | null
          seller_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_experiment_candidates: {
        Row: {
          impressions: number | null
          item_id: string | null
        }
        Relationships: []
      }
      ui_experiment_score: {
        Row: {
          experiment_score: number | null
          item_id: string | null
        }
        Relationships: []
      }
      ui_funnel_daily: {
        Row: {
          day: string | null
          detail_viewed: number | null
          item_id: string | null
          preview_cta_clicked: number | null
          preview_opened: number | null
        }
        Relationships: []
      }
      ui_funnel_personalized_score: {
        Row: {
          item_id: string | null
          personalized_score: number | null
          user_id: string | null
        }
        Relationships: []
      }
      ui_funnel_score: {
        Row: {
          cta_rate: number | null
          detail_rate: number | null
          detail_viewed: number | null
          funnel_score: number | null
          item_id: string | null
          preview_cta_clicked: number | null
          preview_opened: number | null
        }
        Relationships: []
      }
      ui_funnel_score_v2: {
        Row: {
          cta_rate: number | null
          detail_rate: number | null
          detail_viewed: number | null
          funnel_score: number | null
          item_id: string | null
          preview_cta_clicked: number | null
          preview_opened: number | null
        }
        Relationships: []
      }
      ui_funnel_score_v3: {
        Row: {
          cta_rate_w: number | null
          detail_rate_w: number | null
          detail_viewed_w: number | null
          funnel_score: number | null
          item_id: string | null
          preview_cta_clicked_w: number | null
          preview_opened_w: number | null
        }
        Relationships: []
      }
      user_emails: {
        Row: {
          email: string | null
          id: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
        }
        Update: {
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
      user_taste_score: {
        Row: {
          item_id: string | null
          taste_score: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      buy_product: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: Json
      }
      finalize_daily_settlement: {
        Args: { p_settlement_date: string }
        Returns: undefined
      }
      fn_apply_intent_pressure: { Args: never; Returns: undefined }
      fn_apply_market_tick: { Args: never; Returns: undefined }
      fn_simulate_market_tick: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      hb_is_admin: { Args: never; Returns: boolean }
      invest_trade_amount_krw_p_product_id:
        | {
            Args: { p_amount_krw: number; p_product_id: string }
            Returns: undefined
          }
        | {
            Args: {
              p_amount_krw: number
              p_product_id: string
              p_user_id: string
            }
            Returns: undefined
          }
      is_admin: { Args: never; Returns: boolean }
      place_order: {
        Args: {
          p_order_type: string
          p_price: number
          p_product_id: string
          p_quantity: number
          p_type: string
        }
        Returns: Json
      }
      reverse_trade: { Args: { p_trade_id: string }; Returns: undefined }
      rpc_admin_confirm_settlement:
        | { Args: { p_batch_id: string }; Returns: undefined }
        | {
            Args: { p_seller_id: string; p_settlement_date: string }
            Returns: Json
          }
      rpc_close_experiment_rail: {
        Args: {
          p_min_impressions?: number
          p_min_score?: number
          p_now?: string
        }
        Returns: Json
      }
      rpc_confirm_settlement: {
        Args: { p_batch_id: string }
        Returns: undefined
      }
      rpc_invest: { Args: { p_order_id: string }; Returns: undefined }
      rpc_mark_order_completed: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      rpc_place_order: {
        Args: {
          p_market_id: string
          p_price: number
          p_quantity: number
          p_side: string
        }
        Returns: Json
      }
      sell_product: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: Json
      }
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

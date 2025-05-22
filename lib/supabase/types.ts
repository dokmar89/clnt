export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          ico: string
          dic: string
          address: string
          city: string
          postal_code: string
          country: string
          contact_email: string
          contact_phone: string
          wallet_balance: number
          pricing_tier: 'no_contract' | 'monthly' | 'yearly' | 'enterprise'
          owner_id: string
          is_active: boolean
          status: 'pending_approval' | 'active' | 'suspended' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          ico?: string
          dic?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          contact_email: string
          contact_phone?: string
          wallet_balance?: number
          pricing_tier?: 'no_contract' | 'monthly' | 'yearly' | 'enterprise'
          owner_id: string
          is_active?: boolean
          status?: 'pending_approval' | 'active' | 'suspended' | 'inactive'
        }
        Update: {
          name?: string
          ico?: string
          dic?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          contact_email?: string
          contact_phone?: string
          wallet_balance?: number
          pricing_tier?: 'no_contract' | 'monthly' | 'yearly' | 'enterprise'
          owner_id?: string
          is_active?: boolean
          status?: 'pending_approval' | 'active' | 'suspended' | 'inactive'
        }
      }
      company_users: {
        Row: {
          user_id: string
          company_id: string
          role_in_company: 'owner' | 'admin' | 'member' | 'viewer'
          created_at: string
        }
        Insert: {
          user_id: string
          company_id: string
          role_in_company?: 'owner' | 'admin' | 'member' | 'viewer'
        }
        Update: {
          role_in_company?: 'owner' | 'admin' | 'member' | 'viewer'
        }
      }
      shops: {
        Row: {
          id: string
          company_id: string
          name: string
          url: string
          description: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          url?: string
          description?: string
          is_active?: boolean
        }
        Update: {
          company_id?: string
          name?: string
          url?: string
          description?: string
          is_active?: boolean
        }
      }
      api_keys: {
        Row: {
          id: string
          shop_id: string
          key_prefix: string
          hashed_key: string
          description: string
          status: 'active' | 'inactive' | 'revoked'
          created_at: string
          created_by_user_id: string
          last_used_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          key_prefix: string
          hashed_key: string
          description?: string
          status?: 'active' | 'inactive' | 'revoked'
          created_by_user_id?: string
          expires_at?: string
        }
        Update: {
          description?: string
          status?: 'active' | 'inactive' | 'revoked'
          last_used_at?: string
          expires_at?: string
        }
      }
      verification_logs: {
        Row: {
          id: string
          shop_id: string
          method_code: string
          status: 'pending' | 'processing' | 'requires_action' | 'success' | 'failed' | 'expired' | 'error'
          started_at: string
          completed_at: string
          cost_charged: number
          user_identifier_input: string
          result_details: Json
          error_message: string
        }
        Insert: {
          id?: string
          shop_id: string
          method_code?: string
          status?: 'pending' | 'processing' | 'requires_action' | 'success' | 'failed' | 'expired' | 'error'
          started_at?: string
          completed_at?: string
          cost_charged?: number
          user_identifier_input?: string
          result_details?: Json
          error_message?: string
        }
        Update: {
          status?: 'pending' | 'processing' | 'requires_action' | 'success' | 'failed' | 'expired' | 'error'
          completed_at?: string
          cost_charged?: number
          result_details?: Json
          error_message?: string
        }
      }
      verification_methods: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          is_enabled: boolean
          config_details: Json
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string
          is_enabled?: boolean
          config_details?: Json
        }
        Update: {
          code?: string
          name?: string
          description?: string
          is_enabled?: boolean
          config_details?: Json
        }
      }
      wallet_transactions: {
        Row: {
          id: string
          company_id: string
          type: 'credit' | 'debit'
          amount: number
          description: string
          status: 'pending' | 'completed' | 'failed'
          created_at: string
          verification_log_id: string
        }
        Insert: {
          id?: string
          company_id: string
          type: 'credit' | 'debit'
          amount: number
          description?: string
          status?: 'pending' | 'completed' | 'failed'
          verification_log_id?: string
        }
        Update: {
          status?: 'pending' | 'completed' | 'failed'
        }
      }
      profiles: {
        Row: {
          user_id: string
          role: 'admin' | 'company_user'
          full_name: string
          email: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role?: 'admin' | 'company_user'
          full_name?: string
          email?: string
          is_active?: boolean
        }
        Update: {
          role?: 'admin' | 'company_user'
          full_name?: string
          email?: string
          is_active?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          target_entity: string
          target_id: string
          target_company_id: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          target_entity: string
          target_id: string
          target_company_id: string
          details: Json
          created_at?: string
        }
        Update: {
          user_id?: string
          action?: string
          target_entity?: string
          target_id?: string
          target_company_id?: string
          details?: Json
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          ticket_number: string
          user_id: string
          company_id: string
          title: string
          status: 'open' | 'waiting' | 'in_progress' | 'closed'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
          resolved_at: string | null
          resolution_note: string | null
        }
        Insert: {
          id?: string
          ticket_number: string
          user_id: string
          company_id?: string
          title: string
          status?: 'open' | 'waiting' | 'in_progress' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          resolution_note?: string | null
        }
        Update: {
          ticket_number?: string
          user_id?: string
          company_id?: string
          title?: string
          status?: 'open' | 'waiting' | 'in_progress' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          updated_at?: string
          resolved_at?: string | null
          resolution_note?: string | null
        }
      }
      support_ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          user_name: string
          is_from_support: boolean
          message: string
          created_at: string
          attachments: Json | null
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          user_name: string
          is_from_support?: boolean
          message: string
          created_at?: string
          attachments?: Json | null
        }
        Update: {
          ticket_id?: string
          user_id?: string
          user_name?: string
          is_from_support?: boolean
          message?: string
          attachments?: Json | null
        }
      }
      kb_categories: {
        Row: {
          id: string
          title: string
          description: string
          slug: string
          icon: string
          color: string
          order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          slug: string
          icon?: string
          color?: string
          order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          slug?: string
          icon?: string
          color?: string
          order?: number
          is_active?: boolean
        }
      }
      kb_articles: {
        Row: {
          id: string
          category_id: string
          title: string
          description: string
          content: string
          read_time: number
          is_featured: boolean
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          title: string
          description?: string
          content: string
          read_time?: number
          is_featured?: boolean
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          title?: string
          description?: string
          content?: string
          read_time?: number
          is_featured?: boolean
          is_published?: boolean
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          invoice_number: string
          amount: number
          status: 'pending' | 'paid' | 'cancelled'
          created_at: string
          due_date: string
          pdf_url: string
          transaction_id: string
        }
        Insert: {
          id?: string
          company_id: string
          invoice_number: string
          amount: number
          status?: 'pending' | 'paid' | 'cancelled'
          created_at?: string
          due_date: string
          pdf_url?: string
          transaction_id?: string
        }
        Update: {
          company_id?: string
          invoice_number?: string
          amount?: number
          status?: 'pending' | 'paid' | 'cancelled'
          due_date?: string
          pdf_url?: string
          transaction_id?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Company = Tables<'companies'>
export type Shop = Tables<'shops'>
export type ApiKey = Tables<'api_keys'>
export type VerificationLog = Tables<'verification_logs'>
export type VerificationMethod = Tables<'verification_methods'>
export type WalletTransaction = Tables<'wallet_transactions'>
export type Profile = Tables<'profiles'>
export type CompanyUser = Tables<'company_users'>
export type AuditLog = Tables<'audit_logs'>
export type SupportTicket = Tables<'support_tickets'>
export type SupportTicketMessage = Tables<'support_ticket_messages'>
export type KBCategory = Tables<'kb_categories'>
export type KBArticle = Tables<'kb_articles'>
export type Invoice = Tables<'invoices'>


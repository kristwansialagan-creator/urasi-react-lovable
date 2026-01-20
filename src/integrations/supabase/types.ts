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
      coupons: {
        Row: {
          active: boolean | null
          author: string | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          limit_usage: boolean | null
          maximum_usage: number | null
          minimum_cart_value: number | null
          name: string
          type: string | null
          updated_at: string | null
          usage_count: number | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          author?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          limit_usage?: boolean | null
          maximum_usage?: number | null
          minimum_cart_value?: number | null
          name: string
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          author?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          limit_usage?: boolean | null
          maximum_usage?: number | null
          minimum_cart_value?: number | null
          name?: string
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons_categories: {
        Row: {
          category_id: string | null
          coupon_id: string | null
          id: string
        }
        Insert: {
          category_id?: string | null
          coupon_id?: string | null
          id?: string
        }
        Update: {
          category_id?: string | null
          coupon_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_categories_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons_customers_groups: {
        Row: {
          coupon_id: string | null
          group_id: string | null
          id: string
        }
        Insert: {
          coupon_id?: string | null
          group_id?: string | null
          id?: string
        }
        Update: {
          coupon_id?: string | null
          group_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_customers_groups_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_customers_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "customers_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons_products: {
        Row: {
          coupon_id: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_products_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_groups: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          account_amount: number | null
          author: string | null
          birthdate: string | null
          created_at: string | null
          credit_limit_amount: number | null
          description: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          group_id: string | null
          id: string
          last_name: string | null
          owed_amount: number | null
          phone: string | null
          pobox: string | null
          purchases_amount: number | null
          reward_system_points: number | null
          updated_at: string | null
        }
        Insert: {
          account_amount?: number | null
          author?: string | null
          birthdate?: string | null
          created_at?: string | null
          credit_limit_amount?: number | null
          description?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          group_id?: string | null
          id?: string
          last_name?: string | null
          owed_amount?: number | null
          phone?: string | null
          pobox?: string | null
          purchases_amount?: number | null
          reward_system_points?: number | null
          updated_at?: string | null
        }
        Update: {
          account_amount?: number | null
          author?: string | null
          birthdate?: string | null
          created_at?: string | null
          credit_limit_amount?: number | null
          description?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          group_id?: string | null
          id?: string
          last_name?: string | null
          owed_amount?: number | null
          phone?: string | null
          pobox?: string | null
          purchases_amount?: number | null
          reward_system_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "customers_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      customers_account_history: {
        Row: {
          amount: number | null
          author: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          next_amount: number | null
          operation: string
          order_id: string | null
          previous_amount: number | null
        }
        Insert: {
          amount?: number | null
          author?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          next_amount?: number | null
          operation: string
          order_id?: string | null
          previous_amount?: number | null
        }
        Update: {
          amount?: number | null
          author?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          next_amount?: number | null
          operation?: string
          order_id?: string | null
          previous_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_account_history_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_account_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers_addresses: {
        Row: {
          address_1: string | null
          address_2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          customer_id: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          pobox: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          pobox?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          pobox?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers_coupons: {
        Row: {
          active: boolean | null
          coupon_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          usage: number | null
        }
        Insert: {
          active?: boolean | null
          coupon_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          usage?: number | null
        }
        Update: {
          active?: boolean | null
          coupon_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_coupons_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers_groups: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          minimal_credit_payment: number | null
          name: string
          reward_system_id: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          minimal_credit_payment?: number | null
          name: string
          reward_system_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          minimal_credit_payment?: number | null
          name?: string
          reward_system_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_groups_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers_rewards: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          points: number | null
          reward_id: string | null
          reward_name: string | null
          target: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          points?: number | null
          reward_id?: string | null
          reward_name?: string | null
          target?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          points?: number | null
          reward_id?: string | null
          reward_name?: string | null
          target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_rewards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_system"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_days: {
        Row: {
          created_at: string | null
          date: string
          day_of_year: number
          id: string
          total_discount: number | null
          total_income: number | null
          total_orders: number | null
          total_paid_orders: number | null
          total_paid_orders_count: number | null
          total_partially_paid_orders: number | null
          total_partially_paid_orders_count: number | null
          total_taxes: number | null
          total_unpaid_orders: number | null
          total_unpaid_orders_count: number | null
          total_wasted_products: number | null
          updated_at: string | null
          wasted_products_count: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          day_of_year: number
          id?: string
          total_discount?: number | null
          total_income?: number | null
          total_orders?: number | null
          total_paid_orders?: number | null
          total_paid_orders_count?: number | null
          total_partially_paid_orders?: number | null
          total_partially_paid_orders_count?: number | null
          total_taxes?: number | null
          total_unpaid_orders?: number | null
          total_unpaid_orders_count?: number | null
          total_wasted_products?: number | null
          updated_at?: string | null
          wasted_products_count?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          day_of_year?: number
          id?: string
          total_discount?: number | null
          total_income?: number | null
          total_orders?: number | null
          total_paid_orders?: number | null
          total_paid_orders_count?: number | null
          total_partially_paid_orders?: number | null
          total_partially_paid_orders_count?: number | null
          total_taxes?: number | null
          total_unpaid_orders?: number | null
          total_unpaid_orders_count?: number | null
          total_wasted_products?: number | null
          updated_at?: string | null
          wasted_products_count?: number | null
        }
        Relationships: []
      }
      dashboard_months: {
        Row: {
          created_at: string | null
          id: string
          month: number
          total_discount: number | null
          total_income: number | null
          total_orders: number | null
          total_paid_orders: number | null
          total_paid_orders_count: number | null
          total_partially_paid_orders: number | null
          total_partially_paid_orders_count: number | null
          total_taxes: number | null
          total_unpaid_orders: number | null
          total_unpaid_orders_count: number | null
          total_wasted_products: number | null
          updated_at: string | null
          wasted_products_count: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          total_discount?: number | null
          total_income?: number | null
          total_orders?: number | null
          total_paid_orders?: number | null
          total_paid_orders_count?: number | null
          total_partially_paid_orders?: number | null
          total_partially_paid_orders_count?: number | null
          total_taxes?: number | null
          total_unpaid_orders?: number | null
          total_unpaid_orders_count?: number | null
          total_wasted_products?: number | null
          updated_at?: string | null
          wasted_products_count?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          total_discount?: number | null
          total_income?: number | null
          total_orders?: number | null
          total_paid_orders?: number | null
          total_paid_orders_count?: number | null
          total_partially_paid_orders?: number | null
          total_partially_paid_orders_count?: number | null
          total_taxes?: number | null
          total_unpaid_orders?: number | null
          total_unpaid_orders_count?: number | null
          total_wasted_products?: number | null
          updated_at?: string | null
          wasted_products_count?: number | null
          year?: number
        }
        Relationships: []
      }
      instalment_plans: {
        Row: {
          created_at: string | null
          id: number
          interest_rate: number | null
          is_active: boolean | null
          max_amount: number | null
          min_amount: number
          provider: string | null
          tenure_months: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          interest_rate?: number | null
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          provider?: string | null
          tenure_months: number
        }
        Update: {
          created_at?: string | null
          id?: number
          interest_rate?: number | null
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          provider?: string | null
          tenure_months?: number
        }
        Relationships: []
      }
      instalment_schedules: {
        Row: {
          due_date: string
          id: string
          instalment_id: string | null
          instalment_number: number
          interest_amount: number | null
          paid_amount: number | null
          paid_date: string | null
          principal_amount: number
          status: string | null
          total_due: number
        }
        Insert: {
          due_date: string
          id?: string
          instalment_id?: string | null
          instalment_number: number
          interest_amount?: number | null
          paid_amount?: number | null
          paid_date?: string | null
          principal_amount: number
          status?: string | null
          total_due: number
        }
        Update: {
          due_date?: string
          id?: string
          instalment_id?: string | null
          instalment_number?: number
          interest_amount?: number | null
          paid_amount?: number | null
          paid_date?: string | null
          principal_amount?: number
          status?: string | null
          total_due?: number
        }
        Relationships: [
          {
            foreignKeyName: "instalment_schedules_instalment_id_fkey"
            columns: ["instalment_id"]
            isOneToOne: false
            referencedRelation: "order_instalments"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          id: string
          reference: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          reference?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lines: {
        Row: {
          account_id: string
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "transaction_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "view_general_ledger"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "view_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
        ]
      }
      label_templates: {
        Row: {
          created_at: string | null
          height: number | null
          id: string
          name: string
          template_data: Json | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          height?: number | null
          id?: string
          name: string
          template_data?: Json | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          height?: number | null
          id?: string
          name?: string
          template_data?: Json | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      medias: {
        Row: {
          created_at: string | null
          extension: string | null
          id: string
          name: string
          slug: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          extension?: string | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          extension?: string | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medias_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          label: string
          name: string
          settings: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          name: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          name?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          description: string | null
          dismissable: boolean | null
          entity_id: string | null
          entity_type: string | null
          id: string
          identifier: string | null
          read: boolean | null
          source: string | null
          title: string
          type: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dismissable?: boolean | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          identifier?: string | null
          read?: boolean | null
          source?: string | null
          title: string
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dismissable?: boolean | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          identifier?: string | null
          read?: boolean | null
          source?: string | null
          title?: string
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string | null
          id: string
          is_array: boolean | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_array?: boolean | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_array?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      order_instalments: {
        Row: {
          created_at: string | null
          down_payment: number | null
          end_date: string
          id: string
          interest_accrued: number | null
          next_due_date: string | null
          order_id: string | null
          plan_id: number | null
          remaining_balance: number
          start_date: string
          status: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          down_payment?: number | null
          end_date: string
          id?: string
          interest_accrued?: number | null
          next_due_date?: string | null
          order_id?: string | null
          plan_id?: number | null
          remaining_balance: number
          start_date: string
          status?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          down_payment?: number | null
          end_date?: string
          id?: string
          interest_accrued?: number | null
          next_due_date?: string | null
          order_id?: string | null
          plan_id?: number | null
          remaining_balance?: number
          start_date?: string
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_instalments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_instalments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "instalment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          instalment_schedule_id: string | null
          order_id: string
          payment_type: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          instalment_schedule_id?: string | null
          order_id: string
          payment_type?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          instalment_schedule_id?: string | null
          order_id?: string
          payment_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_instalment_schedule_id_fkey"
            columns: ["instalment_schedule_id"]
            isOneToOne: false
            referencedRelation: "instalment_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_payment_type_fkey"
            columns: ["payment_type"]
            isOneToOne: false
            referencedRelation: "payment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      order_products: {
        Row: {
          created_at: string | null
          discount: number | null
          id: string
          name: string
          order_id: string
          product_id: string
          quantity: number
          sku: string | null
          tax_rate: number | null
          total_price: number
          unit_id: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          id?: string
          name: string
          order_id: string
          product_id: string
          quantity?: number
          sku?: string | null
          tax_rate?: number | null
          total_price?: number
          unit_id?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          id?: string
          name?: string
          order_id?: string
          product_id?: string
          quantity?: number
          sku?: string | null
          tax_rate?: number | null
          total_price?: number
          unit_id?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_products_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      order_refunds: {
        Row: {
          condition: string
          created_at: string | null
          id: string
          order_id: string
          order_product_id: string
          quantity: number
          total_price: number
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          condition?: string
          created_at?: string | null
          id?: string
          order_id: string
          order_product_id: string
          quantity?: number
          total_price?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          condition?: string
          created_at?: string | null
          id?: string
          order_id?: string
          order_product_id?: string
          quantity?: number
          total_price?: number
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_refunds_order_product_id_fkey"
            columns: ["order_product_id"]
            isOneToOne: false
            referencedRelation: "order_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_refunds_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          author: string | null
          change: number | null
          code: string
          created_at: string | null
          customer_id: string | null
          delivery_status: string | null
          discount: number | null
          discount_percentage: number | null
          discount_rate: number | null
          discount_type: string | null
          expected_payment_date: string | null
          gross_total: number | null
          id: string
          instalment_id: string | null
          net_total: number | null
          note: string | null
          payment_status: string | null
          process_status: string | null
          products_discount: number | null
          products_total: number | null
          products_total_cost_price: number | null
          register_id: string | null
          shipping: number | null
          shipping_rate: number | null
          shipping_type: string | null
          subtotal: number | null
          tax_value: number | null
          tendered: number | null
          title: string | null
          total: number | null
          total_coupons: number | null
          total_instalments: number | null
          total_without_discount: number | null
          type: string | null
          updated_at: string | null
          voidance_reason: string | null
        }
        Insert: {
          author?: string | null
          change?: number | null
          code: string
          created_at?: string | null
          customer_id?: string | null
          delivery_status?: string | null
          discount?: number | null
          discount_percentage?: number | null
          discount_rate?: number | null
          discount_type?: string | null
          expected_payment_date?: string | null
          gross_total?: number | null
          id?: string
          instalment_id?: string | null
          net_total?: number | null
          note?: string | null
          payment_status?: string | null
          process_status?: string | null
          products_discount?: number | null
          products_total?: number | null
          products_total_cost_price?: number | null
          register_id?: string | null
          shipping?: number | null
          shipping_rate?: number | null
          shipping_type?: string | null
          subtotal?: number | null
          tax_value?: number | null
          tendered?: number | null
          title?: string | null
          total?: number | null
          total_coupons?: number | null
          total_instalments?: number | null
          total_without_discount?: number | null
          type?: string | null
          updated_at?: string | null
          voidance_reason?: string | null
        }
        Update: {
          author?: string | null
          change?: number | null
          code?: string
          created_at?: string | null
          customer_id?: string | null
          delivery_status?: string | null
          discount?: number | null
          discount_percentage?: number | null
          discount_rate?: number | null
          discount_type?: string | null
          expected_payment_date?: string | null
          gross_total?: number | null
          id?: string
          instalment_id?: string | null
          net_total?: number | null
          note?: string | null
          payment_status?: string | null
          process_status?: string | null
          products_discount?: number | null
          products_total?: number | null
          products_total_cost_price?: number | null
          register_id?: string | null
          shipping?: number | null
          shipping_rate?: number | null
          shipping_type?: string | null
          subtotal?: number | null
          tax_value?: number | null
          tendered?: number | null
          title?: string | null
          total?: number | null
          total_coupons?: number | null
          total_instalments?: number | null
          total_without_discount?: number | null
          type?: string | null
          updated_at?: string | null
          voidance_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_instalment_id_fkey"
            columns: ["instalment_id"]
            isOneToOne: false
            referencedRelation: "order_instalments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "registers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_addresses: {
        Row: {
          address_1: string | null
          address_2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          order_id: string | null
          phone: string | null
          pobox: string | null
          type: string | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          order_id?: string | null
          phone?: string | null
          pobox?: string | null
          type?: string | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          order_id?: string | null
          phone?: string | null
          pobox?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_coupons: {
        Row: {
          code: string | null
          coupon_id: string | null
          created_at: string | null
          customer_coupon_id: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          maximum_cart_value: number | null
          minimum_cart_value: number | null
          name: string | null
          order_id: string | null
          type: string | null
          value: number | null
        }
        Insert: {
          code?: string | null
          coupon_id?: string | null
          created_at?: string | null
          customer_coupon_id?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          maximum_cart_value?: number | null
          minimum_cart_value?: number | null
          name?: string | null
          order_id?: string | null
          type?: string | null
          value?: number | null
        }
        Update: {
          code?: string | null
          coupon_id?: string | null
          created_at?: string | null
          customer_coupon_id?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          maximum_cart_value?: number | null
          minimum_cart_value?: number | null
          name?: string | null
          order_id?: string | null
          type?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupons_customer_coupon_id_fkey"
            columns: ["customer_coupon_id"]
            isOneToOne: false
            referencedRelation: "customers_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupons_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_instalments: {
        Row: {
          amount: number | null
          author: string | null
          created_at: string | null
          date: string
          id: string
          order_id: string | null
          paid: boolean | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          author?: string | null
          created_at?: string | null
          date: string
          id?: string
          order_id?: string | null
          paid?: boolean | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          author?: string | null
          created_at?: string | null
          date?: string
          id?: string
          order_id?: string | null
          paid?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_instalments_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_instalments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_payments: {
        Row: {
          author: string | null
          created_at: string | null
          id: string
          identifier: string | null
          order_id: string | null
          payment_type_id: string | null
          value: number | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          id?: string
          identifier?: string | null
          order_id?: string | null
          payment_type_id?: string | null
          value?: number | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          id?: string
          identifier?: string | null
          order_id?: string | null
          payment_type_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_payments_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payments_payment_type_id_fkey"
            columns: ["payment_type_id"]
            isOneToOne: false
            referencedRelation: "payment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_product_refunds: {
        Row: {
          author: string | null
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          order_product_id: string | null
          order_refund_id: string | null
          quantity: number | null
          total_price: number | null
          unit_id: string | null
          unit_price: number | null
        }
        Insert: {
          author?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          order_product_id?: string | null
          order_refund_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
        }
        Update: {
          author?: string | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          order_product_id?: string | null
          order_refund_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_refunds_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_refunds_order_product_id_fkey"
            columns: ["order_product_id"]
            isOneToOne: false
            referencedRelation: "orders_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_refunds_order_refund_id_fkey"
            columns: ["order_refund_id"]
            isOneToOne: false
            referencedRelation: "orders_refunds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_refunds_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_products: {
        Row: {
          author: string | null
          batch_id: string | null
          batch_number: string | null
          created_at: string | null
          discount: number | null
          discount_percentage: number | null
          discount_rate: number | null
          discount_type: string | null
          expiry_date: string | null
          gross_price: number | null
          id: string
          mode: string | null
          name: string | null
          net_price: number | null
          order_id: string | null
          procurement_product_id: string | null
          product_category_id: string | null
          product_id: string | null
          quantity: number | null
          rate: number | null
          return_condition: string | null
          return_observations: string | null
          status: string | null
          tax_group_id: string | null
          tax_value: number | null
          total_gross_price: number | null
          total_net_price: number | null
          total_price: number | null
          total_price_with_discount: number | null
          total_price_without_discount: number | null
          total_purchase_price: number | null
          unit_id: string | null
          unit_price: number | null
          unit_quantity_id: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          batch_id?: string | null
          batch_number?: string | null
          created_at?: string | null
          discount?: number | null
          discount_percentage?: number | null
          discount_rate?: number | null
          discount_type?: string | null
          expiry_date?: string | null
          gross_price?: number | null
          id?: string
          mode?: string | null
          name?: string | null
          net_price?: number | null
          order_id?: string | null
          procurement_product_id?: string | null
          product_category_id?: string | null
          product_id?: string | null
          quantity?: number | null
          rate?: number | null
          return_condition?: string | null
          return_observations?: string | null
          status?: string | null
          tax_group_id?: string | null
          tax_value?: number | null
          total_gross_price?: number | null
          total_net_price?: number | null
          total_price?: number | null
          total_price_with_discount?: number | null
          total_price_without_discount?: number | null
          total_purchase_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
          unit_quantity_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          batch_id?: string | null
          batch_number?: string | null
          created_at?: string | null
          discount?: number | null
          discount_percentage?: number | null
          discount_rate?: number | null
          discount_type?: string | null
          expiry_date?: string | null
          gross_price?: number | null
          id?: string
          mode?: string | null
          name?: string | null
          net_price?: number | null
          order_id?: string | null
          procurement_product_id?: string | null
          product_category_id?: string | null
          product_id?: string | null
          quantity?: number | null
          rate?: number | null
          return_condition?: string | null
          return_observations?: string | null
          status?: string | null
          tax_group_id?: string | null
          tax_value?: number | null
          total_gross_price?: number | null
          total_net_price?: number | null
          total_price?: number | null
          total_price_with_discount?: number | null
          total_price_without_discount?: number | null
          total_purchase_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
          unit_quantity_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_products_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_tax_group_id_fkey"
            columns: ["tax_group_id"]
            isOneToOne: false
            referencedRelation: "taxes_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_products_unit_quantity_id_fkey"
            columns: ["unit_quantity_id"]
            isOneToOne: false
            referencedRelation: "product_unit_quantities"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_refunds: {
        Row: {
          author: string | null
          created_at: string | null
          id: string
          order_id: string | null
          payment_method: string | null
          product_refunds: number | null
          shipping: number | null
          total: number | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string | null
          product_refunds?: number | null
          shipping?: number | null
          total?: number | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string | null
          product_refunds?: number | null
          shipping?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_refunds_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          order_id: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          order_id?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          order_id?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_settings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_storage: {
        Row: {
          author: string | null
          created_at: string | null
          data: Json | null
          id: string
          session_identifier: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          session_identifier?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          session_identifier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_storage_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_taxes: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          rate: number | null
          tax_id: string | null
          tax_name: string | null
          tax_value: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          rate?: number | null
          tax_id?: string | null
          tax_name?: string | null
          tax_value?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          rate?: number | null
          tax_id?: string | null
          tax_name?: string | null
          tax_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_taxes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_taxes_tax_id_fkey"
            columns: ["tax_id"]
            isOneToOne: false
            referencedRelation: "taxes"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_types: {
        Row: {
          active: boolean | null
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          identifier: string
          label: string
          priority: number | null
          readonly: boolean | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          identifier: string
          label: string
          priority?: number | null
          readonly?: boolean | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          identifier?: string
          label?: string
          priority?: number | null
          readonly?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_types_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          namespace: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          namespace: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          namespace?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      procurements: {
        Row: {
          author: string | null
          automatic_approval: boolean | null
          cost: number | null
          created_at: string | null
          delivery_status: string | null
          description: string | null
          id: string
          invoice_date: string | null
          invoice_reference: string | null
          name: string
          payment_status: string | null
          provider_id: string | null
          tax_value: number | null
          total_items: number | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          author?: string | null
          automatic_approval?: boolean | null
          cost?: number | null
          created_at?: string | null
          delivery_status?: string | null
          description?: string | null
          id?: string
          invoice_date?: string | null
          invoice_reference?: string | null
          name: string
          payment_status?: string | null
          provider_id?: string | null
          tax_value?: number | null
          total_items?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          author?: string | null
          automatic_approval?: boolean | null
          cost?: number | null
          created_at?: string | null
          delivery_status?: string | null
          description?: string | null
          id?: string
          invoice_date?: string | null
          invoice_reference?: string | null
          name?: string
          payment_status?: string | null
          provider_id?: string | null
          tax_value?: number | null
          total_items?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "procurements_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurements_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      procurements_products: {
        Row: {
          author: string | null
          barcode: string | null
          convert_unit_id: string | null
          created_at: string | null
          expiration_date: string | null
          id: string
          name: string | null
          procurement_id: string | null
          product_id: string | null
          purchase_price: number | null
          quantity: number | null
          tax_value: number | null
          total_purchase_price: number | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          barcode?: string | null
          convert_unit_id?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          name?: string | null
          procurement_id?: string | null
          product_id?: string | null
          purchase_price?: number | null
          quantity?: number | null
          tax_value?: number | null
          total_purchase_price?: number | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          barcode?: string | null
          convert_unit_id?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          name?: string | null
          procurement_id?: string | null
          product_id?: string | null
          purchase_price?: number | null
          quantity?: number | null
          tax_value?: number | null
          total_purchase_price?: number | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurements_products_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurements_products_convert_unit_id_fkey"
            columns: ["convert_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurements_products_procurement_id_fkey"
            columns: ["procurement_id"]
            isOneToOne: false
            referencedRelation: "procurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurements_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurements_products_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          displays_on_pos: boolean | null
          icon: string | null
          id: string
          media_id: string | null
          name: string
          parent_id: string | null
          status: string | null
          thumbnail: string | null
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          displays_on_pos?: boolean | null
          icon?: string | null
          id?: string
          media_id?: string | null
          name: string
          parent_id?: string | null
          status?: string | null
          thumbnail?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          displays_on_pos?: boolean | null
          icon?: string | null
          id?: string
          media_id?: string | null
          name?: string
          parent_id?: string | null
          status?: string | null
          thumbnail?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_group_items: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_group_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_unit_quantities: {
        Row: {
          created_at: string | null
          excl_tax_sale_price: number | null
          excl_tax_wholesale_price: number | null
          id: string
          incl_tax_sale_price: number | null
          incl_tax_wholesale_price: number | null
          low_quantity: number | null
          product_id: string | null
          purchase_price: number | null
          quantity: number | null
          sale_price: number | null
          sale_price_edit: boolean | null
          stock_alert_enabled: boolean | null
          unit_id: string | null
          updated_at: string | null
          visible: boolean | null
          wholesale_price: number | null
        }
        Insert: {
          created_at?: string | null
          excl_tax_sale_price?: number | null
          excl_tax_wholesale_price?: number | null
          id?: string
          incl_tax_sale_price?: number | null
          incl_tax_wholesale_price?: number | null
          low_quantity?: number | null
          product_id?: string | null
          purchase_price?: number | null
          quantity?: number | null
          sale_price?: number | null
          sale_price_edit?: boolean | null
          stock_alert_enabled?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          visible?: boolean | null
          wholesale_price?: number | null
        }
        Update: {
          created_at?: string | null
          excl_tax_sale_price?: number | null
          excl_tax_wholesale_price?: number | null
          id?: string
          incl_tax_sale_price?: number | null
          incl_tax_wholesale_price?: number | null
          low_quantity?: number | null
          product_id?: string | null
          purchase_price?: number | null
          quantity?: number | null
          sale_price?: number | null
          sale_price_edit?: boolean | null
          stock_alert_enabled?: boolean | null
          unit_id?: string | null
          updated_at?: string | null
          visible?: boolean | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_unit_quantities_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_unit_quantities_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          accurate_tracking: boolean | null
          author: string | null
          barcode: string | null
          bpom_number: string | null
          brand: string | null
          category_id: string | null
          composition: string | null
          created_at: string | null
          description: string | null
          expires: boolean | null
          gross_sale_price: number | null
          halal_number: string | null
          id: string
          name: string
          net_sale_price: number | null
          on_expiration: string | null
          parent_id: string | null
          purchase_price: number | null
          registration_number: string | null
          sale_price: number | null
          sale_price_edit: boolean | null
          searchable: boolean | null
          selling_price: number | null
          shelf_life: string | null
          sku: string | null
          sku_parent_id: string | null
          status: string | null
          stock_management: boolean | null
          stock_quantity: number | null
          tax_group_id: string | null
          tax_type: string | null
          thumbnail_id: string | null
          type: string | null
          unit_group_id: string | null
          updated_at: string | null
          wholesale_price: number | null
        }
        Insert: {
          accurate_tracking?: boolean | null
          author?: string | null
          barcode?: string | null
          bpom_number?: string | null
          brand?: string | null
          category_id?: string | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          expires?: boolean | null
          gross_sale_price?: number | null
          halal_number?: string | null
          id?: string
          name: string
          net_sale_price?: number | null
          on_expiration?: string | null
          parent_id?: string | null
          purchase_price?: number | null
          registration_number?: string | null
          sale_price?: number | null
          sale_price_edit?: boolean | null
          searchable?: boolean | null
          selling_price?: number | null
          shelf_life?: string | null
          sku?: string | null
          sku_parent_id?: string | null
          status?: string | null
          stock_management?: boolean | null
          stock_quantity?: number | null
          tax_group_id?: string | null
          tax_type?: string | null
          thumbnail_id?: string | null
          type?: string | null
          unit_group_id?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Update: {
          accurate_tracking?: boolean | null
          author?: string | null
          barcode?: string | null
          bpom_number?: string | null
          brand?: string | null
          category_id?: string | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          expires?: boolean | null
          gross_sale_price?: number | null
          halal_number?: string | null
          id?: string
          name?: string
          net_sale_price?: number | null
          on_expiration?: string | null
          parent_id?: string | null
          purchase_price?: number | null
          registration_number?: string | null
          sale_price?: number | null
          sale_price_edit?: boolean | null
          searchable?: boolean | null
          selling_price?: number | null
          shelf_life?: string | null
          sku?: string | null
          sku_parent_id?: string | null
          status?: string | null
          stock_management?: boolean | null
          stock_quantity?: number | null
          tax_group_id?: string | null
          tax_type?: string | null
          thumbnail_id?: string | null
          type?: string | null
          unit_group_id?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sku_parent_id_fkey"
            columns: ["sku_parent_id"]
            isOneToOne: false
            referencedRelation: "sku_parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tax_group_id_fkey"
            columns: ["tax_group_id"]
            isOneToOne: false
            referencedRelation: "taxes_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_thumbnail_id_fkey"
            columns: ["thumbnail_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_unit_group_id_fkey"
            columns: ["unit_group_id"]
            isOneToOne: false
            referencedRelation: "units_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      products_gallery: {
        Row: {
          created_at: string | null
          featured: boolean | null
          id: string
          media_id: string | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          featured?: boolean | null
          id?: string
          media_id?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          featured?: boolean | null
          id?: string
          media_id?: string | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_gallery_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_gallery_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products_history: {
        Row: {
          after_quantity: number | null
          author: string | null
          batch_id: string | null
          batch_number: string | null
          before_quantity: number | null
          created_at: string | null
          description: string | null
          expiry_date: string | null
          id: string
          operation_type: string
          order_id: string | null
          order_product_id: string | null
          procurement_id: string | null
          procurement_product_id: string | null
          product_id: string | null
          quantity: number | null
          total_price: number | null
          unit_id: string | null
          unit_price: number | null
        }
        Insert: {
          after_quantity?: number | null
          author?: string | null
          batch_id?: string | null
          batch_number?: string | null
          before_quantity?: number | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          operation_type: string
          order_id?: string | null
          order_product_id?: string | null
          procurement_id?: string | null
          procurement_product_id?: string | null
          product_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
        }
        Update: {
          after_quantity?: number | null
          author?: string | null
          batch_id?: string | null
          batch_number?: string | null
          before_quantity?: number | null
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          operation_type?: string
          order_id?: string | null
          order_product_id?: string | null
          procurement_id?: string | null
          procurement_product_id?: string | null
          product_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_history_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_history_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_history_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      products_history_combined: {
        Row: {
          created_at: string | null
          defective_quantity: number | null
          final_quantity: number | null
          id: string
          initial_quantity: number | null
          procurement_product_id: string | null
          product_id: string | null
          sold_quantity: number | null
          total_price: number | null
          unit_id: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          defective_quantity?: number | null
          final_quantity?: number | null
          id?: string
          initial_quantity?: number | null
          procurement_product_id?: string | null
          product_id?: string | null
          sold_quantity?: number | null
          total_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          defective_quantity?: number | null
          final_quantity?: number | null
          id?: string
          initial_quantity?: number | null
          procurement_product_id?: string | null
          product_id?: string | null
          sold_quantity?: number | null
          total_price?: number | null
          unit_id?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_history_combined_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_history_combined_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      products_metas: {
        Row: {
          created_at: string | null
          id: string
          key: string
          product_id: string | null
          type: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          product_id?: string | null
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          product_id?: string | null
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_metas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products_sub_items: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string | null
          product_id: string | null
          quantity: number | null
          sale_price: number | null
          total_price: number | null
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          product_id?: string | null
          quantity?: number | null
          sale_price?: number | null
          total_price?: number | null
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string | null
          product_id?: string | null
          quantity?: number | null
          sale_price?: number | null
          total_price?: number | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_sub_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      products_taxes: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          product_id: string | null
          rate: number | null
          tax_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          product_id?: string | null
          rate?: number | null
          tax_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          product_id?: string | null
          rate?: number | null
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_taxes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_taxes_tax_id_fkey"
            columns: ["tax_id"]
            isOneToOne: false
            referencedRelation: "taxes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          phone: string | null
          role: string | null
          second_name: string | null
          total_sales: number | null
          total_sales_count: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          second_name?: string | null
          total_sales?: number | null
          total_sales_count?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          second_name?: string | null
          total_sales?: number | null
          total_sales_count?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          address_1: string | null
          address_2: string | null
          author: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address_1?: string | null
          address_2?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address_1?: string | null
          address_2?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registers: {
        Row: {
          author: string | null
          balance: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          used_by: string | null
        }
        Insert: {
          author?: string | null
          balance?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          used_by?: string | null
        }
        Update: {
          author?: string | null
          balance?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registers_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registers_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registers_history: {
        Row: {
          action: string
          author: string | null
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          payment_type_id: string | null
          register_id: string | null
          transaction_type: string | null
          value: number | null
        }
        Insert: {
          action: string
          author?: string | null
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_type_id?: string | null
          register_id?: string | null
          transaction_type?: string | null
          value?: number | null
        }
        Update: {
          action?: string
          author?: string | null
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_type_id?: string | null
          register_id?: string | null
          transaction_type?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registers_history_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registers_history_payment_type_id_fkey"
            columns: ["payment_type_id"]
            isOneToOne: false
            referencedRelation: "payment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registers_history_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "registers"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_system: {
        Row: {
          author: string | null
          coupon_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          target: number | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          coupon_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          target?: number | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          coupon_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          target?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_system_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_system_rules: {
        Row: {
          created_at: string | null
          from_amount: number | null
          id: string
          reward: number | null
          reward_id: string | null
          to_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_amount?: number | null
          id?: string
          reward?: number | null
          reward_id?: string | null
          to_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_amount?: number | null
          id?: string
          reward?: number | null
          reward_id?: string | null
          to_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_system_rules_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_system"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          locked: boolean | null
          name: string
          namespace: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          locked?: boolean | null
          name: string
          namespace: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          locked?: boolean | null
          name?: string
          namespace?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      settings_storage: {
        Row: {
          created_at: string | null
          id: string
          key: string
          module: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          module?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          module?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      sku_parents: {
        Row: {
          author: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sku_parents_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_batches: {
        Row: {
          author: string | null
          batch_number: string
          created_at: string | null
          expiry_date: string | null
          id: string
          initial_quantity: number | null
          notes: string | null
          product_id: string
          purchase_price: number | null
          quantity: number | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          batch_number: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          initial_quantity?: number | null
          notes?: string | null
          product_id: string
          purchase_price?: number | null
          quantity?: number | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          batch_number?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          initial_quantity?: number | null
          notes?: string | null
          product_id?: string
          purchase_price?: number | null
          quantity?: number | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_batches_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_batches_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_logs: {
        Row: {
          action: string
          author_id: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          author_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          author_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      taxes: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          rate: number | null
          tax_group_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          rate?: number | null
          tax_group_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          rate?: number | null
          tax_group_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxes_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxes_tax_group_id_fkey"
            columns: ["tax_group_id"]
            isOneToOne: false
            referencedRelation: "taxes_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      taxes_groups: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "taxes_groups_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_accounts: {
        Row: {
          balance: number | null
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_balance_days: {
        Row: {
          balance: number | null
          created_at: string | null
          date: string
          day_of_year: number
          expense: number | null
          id: string
          income: number | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          date: string
          day_of_year: number
          expense?: number | null
          id?: string
          income?: number | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          date?: string
          day_of_year?: number
          expense?: number | null
          id?: string
          income?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_balance_months: {
        Row: {
          balance: number | null
          created_at: string | null
          expense: number | null
          id: string
          income: number | null
          month: number
          updated_at: string | null
          year: number
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          expense?: number | null
          id?: string
          income?: number | null
          month: number
          updated_at?: string | null
          year: number
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          expense?: number | null
          id?: string
          income?: number | null
          month?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          active: boolean | null
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          journal_entry_id: string | null
          name: string
          occurrence: number | null
          occurrence_count: number | null
          order_id: string | null
          order_refund_id: string | null
          procurement_id: string | null
          recurring_on: number | null
          recurring_type: string | null
          register_history_id: string | null
          scheduled_date: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          account_id?: string | null
          active?: boolean | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          name: string
          occurrence?: number | null
          occurrence_count?: number | null
          order_id?: string | null
          order_refund_id?: string | null
          procurement_id?: string | null
          recurring_on?: number | null
          recurring_type?: string | null
          register_history_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          account_id?: string | null
          active?: boolean | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          journal_entry_id?: string | null
          name?: string
          occurrence?: number | null
          occurrence_count?: number | null
          order_id?: string | null
          order_refund_id?: string | null
          procurement_id?: string | null
          recurring_on?: number | null
          recurring_type?: string | null
          register_history_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "transactions_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "view_general_ledger"
            referencedColumns: ["journal_entry_id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_order_refund_id_fkey"
            columns: ["order_refund_id"]
            isOneToOne: false
            referencedRelation: "orders_refunds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_procurement_id_fkey"
            columns: ["procurement_id"]
            isOneToOne: false
            referencedRelation: "procurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_register_history_id_fkey"
            columns: ["register_history_id"]
            isOneToOne: false
            referencedRelation: "registers_history"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_accounts: {
        Row: {
          account: string
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          operation: string
          updated_at: string | null
        }
        Insert: {
          account: string
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          operation: string
          updated_at?: string | null
        }
        Update: {
          account?: string
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          operation?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_accounts_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_history: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string | null
          operation: string
          status: string | null
          transaction_id: string | null
          trigger_date: string | null
          value: number | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          operation: string
          status?: string | null
          transaction_id?: string | null
          trigger_date?: string | null
          value?: number | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          operation?: string
          status?: string | null
          transaction_id?: string | null
          trigger_date?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_history_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          author: string | null
          base_unit: boolean | null
          created_at: string | null
          description: string | null
          group_id: string | null
          id: string
          identifier: string
          name: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          author?: string | null
          base_unit?: boolean | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          identifier: string
          name: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          author?: string | null
          base_unit?: boolean | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          identifier?: string
          name?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "units_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "units_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      units_groups: {
        Row: {
          author: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_groups_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users_roles: {
        Row: {
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_general_ledger: {
        Row: {
          account_code: string | null
          account_id: string | null
          account_name: string | null
          account_type: string | null
          created_at: string | null
          credit: number | null
          debit: number | null
          entry_date: string | null
          entry_description: string | null
          journal_entry_id: string | null
          line_description: string | null
          reference: string | null
        }
        Relationships: []
      }
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

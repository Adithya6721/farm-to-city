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
          name: string
          email: string
          role: 'farmer' | 'trader' | 'shopkeeper'
          location: string | null
          created_at: string
          avatar_url: string | null
          phone: string | null
          bio: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'farmer' | 'trader' | 'shopkeeper'
          location?: string | null
          created_at?: string
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'farmer' | 'trader' | 'shopkeeper'
          location?: string | null
          created_at?: string
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
        }
      }
      products: {
        Row: {
          id: string
          farmer_id: string
          name: string
          price: number
          quantity: number
          availability: boolean
          created_at: string
          description: string | null
          category: string | null
          unit: string | null
          image_url: string | null
          harvest_date: string | null
          expiry_date: string | null
        }
        Insert: {
          id?: string
          farmer_id: string
          name: string
          price: number
          quantity: number
          availability?: boolean
          created_at?: string
          description?: string | null
          category?: string | null
          unit?: string | null
          image_url?: string | null
          harvest_date?: string | null
          expiry_date?: string | null
        }
        Update: {
          id?: string
          farmer_id?: string
          name?: string
          price?: number
          quantity?: number
          availability?: boolean
          created_at?: string
          description?: string | null
          category?: string | null
          unit?: string | null
          image_url?: string | null
          harvest_date?: string | null
          expiry_date?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          trader_id: string
          farmer_id: string
          product_id: string
          quantity: number
          status: 'pending' | 'confirmed' | 'rejected' | 'delivered'
          delivery_date: string | null
          created_at: string
          total_amount: number | null
          notes: string | null
          payment_status: 'pending' | 'paid' | 'failed'
        }
        Insert: {
          id?: string
          trader_id: string
          farmer_id: string
          product_id: string
          quantity: number
          status?: 'pending' | 'confirmed' | 'rejected' | 'delivered'
          delivery_date?: string | null
          created_at?: string
          total_amount?: number | null
          notes?: string | null
          payment_status?: 'pending' | 'paid' | 'failed'
        }
        Update: {
          id?: string
          trader_id?: string
          farmer_id?: string
          product_id?: string
          quantity?: number
          status?: 'pending' | 'confirmed' | 'rejected' | 'delivered'
          delivery_date?: string | null
          created_at?: string
          total_amount?: number | null
          notes?: string | null
          payment_status?: 'pending' | 'paid' | 'failed'
        }
      }
      chats: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          message: string
          created_at: string
          read: boolean
          order_id: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          message: string
          created_at?: string
          read?: boolean
          order_id?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          created_at?: string
          read?: boolean
          order_id?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          shopkeeper_id: string
          farmer_id: string
          rating: number
          comment: string | null
          created_at: string
          order_id: string | null
        }
        Insert: {
          id?: string
          shopkeeper_id: string
          farmer_id: string
          rating: number
          comment?: string | null
          created_at?: string
          order_id?: string | null
        }
        Update: {
          id?: string
          shopkeeper_id?: string
          farmer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          order_id?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'order' | 'chat' | 'payment' | 'system'
          read: boolean
          created_at: string
          data: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'order' | 'chat' | 'payment' | 'system'
          read?: boolean
          created_at?: string
          data?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'order' | 'chat' | 'payment' | 'system'
          read?: boolean
          created_at?: string
          data?: Json | null
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          shopkeeper_id: string
          product_id: string
          quantity_in: number
          quantity_out: number
          current_stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shopkeeper_id: string
          product_id: string
          quantity_in: number
          quantity_out: number
          current_stock: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shopkeeper_id?: string
          product_id?: string
          quantity_in?: number
          quantity_out?: number
          current_stock?: number
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



